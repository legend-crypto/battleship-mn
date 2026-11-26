import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { pathToFileURL } from 'url';
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';
import type { Contract as CompiledBattleshipContract, Witnesses } from '../managed/battleship/contract/index.js';

const PROOF_SERVER_URL = process.env.PROOF_SERVER_URL || 'http://127.0.0.1:6300';
const REQUIRE_REAL_PROOF_SERVER = process.env.REQUIRE_REAL_PROOF_SERVER === 'true';

const importEsm = new Function('specifier', 'return import(specifier)') as <T = any>(
  specifier: string
) => Promise<T>;

// ----------------------------------------------------------------------------
// MIDNIGHT COMPACT `persistentHash` MERKLE ENGINE
// Identical binary framing to battleship.compact and frontend/src/utils/merkle.ts
// ----------------------------------------------------------------------------
const BYTES32 = new compactRuntime.CompactTypeBytes(32);
const VEC2_BYTES32 = new compactRuntime.CompactTypeVector(2, BYTES32);
const VEC5_BYTES32 = new compactRuntime.CompactTypeVector(5, BYTES32);

function padAsciiBytes32(label: string): Uint8Array {
  const out = new Uint8Array(32);
  out.set(Buffer.from(label, 'utf8').subarray(0, 32), 0);
  return out;
}

const LEAF_DOMAIN_TAG = padAsciiBytes32('battleship:leaf:v1');

interface CompactCellLeaf {
  cell_index: bigint;
  is_occupied: boolean;
  ship_id: number;
  salt: Uint8Array;
}

interface CompactMerkleProof {
  path_hashes: Uint8Array[];
  path_directions: boolean[];
}

interface BattleshipPrivateState {
  secretKey: Uint8Array;
}

function hashCell(leaf: CompactCellLeaf): Uint8Array {
  return compactRuntime.persistentHash(VEC5_BYTES32, [
    LEAF_DOMAIN_TAG,
    compactRuntime.convertBigintToBytes(32, leaf.cell_index, 'proof-harness:cell_index'),
    compactRuntime.convertBigintToBytes(32, leaf.is_occupied ? 1n : 0n, 'proof-harness:occupied'),
    compactRuntime.convertBigintToBytes(32, BigInt(leaf.ship_id), 'proof-harness:ship_id'),
    leaf.salt,
  ]);
}

function hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
  return compactRuntime.persistentHash(VEC2_BYTES32, [left, right]);
}

function buildBoardMerkleTree(shipCoords: Set<number>): {
  leaves: CompactCellLeaf[];
  root: Uint8Array;
  levels: Uint8Array[][];
} {
  const leaves: CompactCellLeaf[] = [];
  for (let i = 0; i < 100; i++) {
    const occ = shipCoords.has(i);
    leaves.push({
      cell_index: BigInt(i),
      is_occupied: occ,
      ship_id: occ ? 1 : 0,
      salt: Uint8Array.from(crypto.randomBytes(32)),
    });
  }

  const padded = leaves.map(hashCell);
  while (padded.length < 128) {
    padded.push(hashPair(padAsciiBytes32(`battleship:pad:${padded.length}`), new Uint8Array(32)));
  }

  let current = padded;
  const levels: Uint8Array[][] = [current];
  while (current.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(hashPair(current[i], current[i + 1]));
    }
    levels.push(next);
    current = next;
  }
  return { leaves, root: current[0], levels };
}

function getMerkleProof(index: number, levels: Uint8Array[][]): CompactMerkleProof {
  const path_hashes: Uint8Array[] = [];
  const path_directions: boolean[] = [];
  let curr = index;
  for (let lvl = 0; lvl < levels.length - 1; lvl++) {
    const isRight = curr % 2 === 1;
    const sibling = isRight ? curr - 1 : curr + 1;
    path_hashes.push(levels[lvl][sibling]);
    path_directions.push(isRight);
    curr = Math.floor(curr / 2);
  }
  return { path_hashes, path_directions };
}

async function fetchHttpText(url: string, timeoutMs = 2000): Promise<{ ok: boolean; body: string }> {
  return new Promise((resolve) => {
    const req = http.get(url, (res: http.IncomingMessage) => {
      let body = '';
      res.on('data', (chunk) => {
        body += String(chunk);
      });
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        resolve({ ok: status >= 200 && status < 300, body: body.trim() });
      });
    });
    req.on('error', () => resolve({ ok: false, body: '' }));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ ok: false, body: '' });
    });
  });
}

async function runProofServerTestHarness() {
  console.log('\n====================================================================');
  console.log('MIDNIGHT COMPILED ZK PROOF SERVER HARNESS (LEDGER V9)');
  console.log('====================================================================');
  console.log(`Proof Server URL : ${PROOF_SERVER_URL}`);

  const zkAssetsDir = path.resolve(__dirname, '../managed/battleship');
  const compiledEntry = path.resolve(zkAssetsDir, 'contract/index.js');
  if (!fs.existsSync(compiledEntry)) {
    console.error(`Compiled contract missing at ${compiledEntry}`);
    console.error('Run: npm run compile:compact --workspace=contracts');
    process.exit(1);
  }

  const [healthRes, versionRes] = await Promise.all([
    fetchHttpText(`${PROOF_SERVER_URL}/health`),
    fetchHttpText(`${PROOF_SERVER_URL}/version`),
  ]);

  const isServerOnline = healthRes.ok;
  const serverVersion = versionRes.body || 'unknown';
  if (isServerOnline) {
    console.log(`Proof Server     : ONLINE (version: ${serverVersion})`);
  } else {
    console.log(`Proof Server     : OFFLINE (${PROOF_SERVER_URL})`);
    if (REQUIRE_REAL_PROOF_SERVER) {
      console.error('REQUIRE_REAL_PROOF_SERVER=true set; refusing to continue while offline.');
      process.exit(1);
    }
  }

  const [
    ledgerV9,
    { CompiledContract },
    { createUnprovenDeployTxFromVerifierKeys, createUnprovenCallTxFromInitialStates },
    { NodeZkConfigProvider },
    { httpClientProofProvider },
    { SerializedLedgerParameters, SerializedZswapChainState },
    contractMod,
  ] = await Promise.all([
    importEsm<typeof import('@midnightntwrk/ledger-v9')>('@midnightntwrk/ledger-v9'),
    importEsm<typeof import('@midnight-ntwrk/compact-js')>('@midnight-ntwrk/compact-js'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-contracts')>('@midnight-ntwrk/midnight-js-contracts'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-node-zk-config-provider')>('@midnight-ntwrk/midnight-js-node-zk-config-provider'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-http-client-proof-provider')>('@midnight-ntwrk/midnight-js-http-client-proof-provider'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-types')>('@midnight-ntwrk/midnight-js-types'),
    importEsm<{
      Contract: typeof CompiledBattleshipContract;
      ledger: (state: any) => any;
    }>(pathToFileURL(compiledEntry).href),
  ]);

  const p1Secret = Uint8Array.from(crypto.randomBytes(32));
  const p2Secret = Uint8Array.from(crypto.randomBytes(32));
  const witnesses: Witnesses<BattleshipPrivateState> = {
    player_secret_key: (ctx) => [ctx.privateState, ctx.privateState?.secretKey ?? p1Secret],
  };

  const compiledContract = CompiledContract.make('battleship', contractMod.Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(zkAssetsDir)
  );

  const zkConfigProvider = new NodeZkConfigProvider(zkAssetsDir);
  const zswapKeys = ledgerV9.ZswapSecretKeys.fromSeed(Uint8Array.from(crypto.randomBytes(32)));
  const coinPublicKey = zswapKeys.coinPublicKey;
  const encryptionPublicKey = zswapKeys.encryptionPublicKey;
  const signingKey = ledgerV9.sampleSigningKey();
  const midnightConfig = { networkId: 'preview', ttlSeconds: 300 };

  const p1ShipCoords = new Set([0, 1, 2, 3, 4, 10, 11, 12, 13, 20, 21, 22, 30, 31, 32, 40, 41]);
  const p2ShipCoords = new Set([5, 15, 25, 35, 45, 50, 51, 52, 53, 60, 61, 62, 70, 71, 72, 80, 81]);
  const p1Board = buildBoardMerkleTree(p1ShipCoords);
  const p2Board = buildBoardMerkleTree(p2ShipCoords);

  console.log(`\nP1 Board Root    : 0x${Buffer.from(p1Board.root).toString('hex').slice(0, 16)}...`);
  console.log(`P2 Board Root    : 0x${Buffer.from(p2Board.root).toString('hex').slice(0, 16)}...`);

  // 1. Build REAL Ledger-v9 unproven deploy tx from compiled Compact verifier keys
  const unprovenDeploy = await createUnprovenDeployTxFromVerifierKeys(
    zkConfigProvider,
    coinPublicKey,
    {
      compiledContract,
      signingKey,
      initialPrivateState: { secretKey: p1Secret },
    },
    encryptionPublicKey,
    midnightConfig
  );
  console.log(
    `Deploy Unproven  : ContractAddr=${unprovenDeploy.public.contractAddress}, bytes=${unprovenDeploy.private.unprovenTx.serialize().length}`
  );

  // 2. Build REAL Ledger-v9 unproven call tx for `create_game`
  const gameId = Uint8Array.from(crypto.randomBytes(32));
  const nowSec = 1_750_000_000n;
  const p1Addr = { bytes: Uint8Array.from(crypto.randomBytes(32)) };
  const p2Addr = { bytes: Uint8Array.from(crypto.randomBytes(32)) };

  const initialLedgerParams = SerializedLedgerParameters.fromBytes(
    'v9',
    ledgerV9.LedgerParameters.initialParameters().serialize()
  );
  const initialZswapChainState = SerializedZswapChainState.fromBytes(
    'v9',
    new ledgerV9.ZswapChainState().serialize()
  );

  const unprovenCreateGame = await createUnprovenCallTxFromInitialStates(
    zkConfigProvider,
    {
      compiledContract,
      circuitId: 'create_game',
      contractAddress: unprovenDeploy.public.contractAddress,
      coinPublicKey,
      initialContractState: unprovenDeploy.public.initialContractState,
      initialZswapChainState,
      ledgerParameters: initialLedgerParams,
      config: midnightConfig,
      initialPrivateState: { secretKey: p1Secret },
      args: [gameId, p1Board.root, 100n, nowSec - 5n, p1Addr],
    },
    encryptionPublicKey
  );
  console.log(
    `create_game Tx   : Unproven assembled (${unprovenCreateGame.private.unprovenTx.serialize().length} bytes, ${unprovenCreateGame.public.publicTranscript.length} transcript ops)`
  );

  // 3. Dispatch real ZK-SNARK proof generation when Proof Server 9.0.x is online
  if (isServerOnline) {
    if (!serverVersion.startsWith('9.')) {
      console.error(`Proof server version "${serverVersion}" is incompatible with Ledger v9 (expected 9.0.x).`);
      process.exit(1);
    }
    const proofProvider = httpClientProofProvider(PROOF_SERVER_URL, zkConfigProvider);
    const t0 = Date.now();
    const provenDeploy = await proofProvider.proveTx(unprovenDeploy.private.unprovenTx);
    const t1 = Date.now();
    const provenCall = await proofProvider.proveTx(unprovenCreateGame.private.unprovenTx);
    const t2 = Date.now();
    console.log(`ZK Proof Deploy  : PROVED via ${PROOF_SERVER_URL} in ${t1 - t0}ms (${provenDeploy.serialize().length} bytes)`);
    console.log(`ZK Proof Call    : PROVED create_game via ${PROOF_SERVER_URL} in ${t2 - t1}ms (${provenCall.serialize().length} bytes)`);
  } else {
    console.log('ZK SNARK Proving : SKIPPED (Proof Server offline; start Docker + midnight-proof-server 9.0.2 to prove live).');
  }

  // 4. Verify full 17-turn compiled Compact circuit execution & payout transcript
  const runtimeContract = new contractMod.Contract(witnesses);
  const ctorCtx = compactRuntime.createConstructorContext({ secretKey: p1Secret }, '0'.repeat(64));
  let contractState = (await runtimeContract.initialState(ctorCtx)).currentContractState;

  const execCircuit = async (
    circuitId: string,
    secretKey: Uint8Array,
    blockTimeSec: bigint,
    ...args: any[]
  ) => {
    const ctx = compactRuntime.createCircuitContext({
      circuitId,
      contractAddress: unprovenDeploy.public.contractAddress,
      coinPublicKeyOrZswapState: '0'.repeat(64),
      contractState: (contractState as any).data ?? contractState,
      privateState: { secretKey },
      time: Number(blockTimeSec),
    });
    const res = await (runtimeContract.circuits as any)[circuitId](ctx, ...args);
    contractState = res.context.callContext.currentQueryContext.state;
    return res;
  };

  let stepTime = nowSec + 10n;
  await execCircuit('create_game', p1Secret, stepTime, gameId, p1Board.root, 100n, stepTime - 1n, p1Addr);
  stepTime += 2n;
  await execCircuit('join_game', p2Secret, stepTime, gameId, p2Board.root, stepTime - 1n, p2Addr);

  const p2Targets = Array.from(p2ShipCoords);
  const p1EmptyTargets = Array.from({ length: 100 }, (_, i) => i).filter((i) => !p1ShipCoords.has(i));
  for (let turn = 0; turn < p2Targets.length; turn++) {
    const p1Shot = p2Targets[turn];
    stepTime += 2n;
    await execCircuit('fire_shot', p1Secret, stepTime, gameId, BigInt(p1Shot), stepTime - 1n);
    stepTime += 2n;
    await execCircuit(
      'resolve_shot',
      p2Secret,
      stepTime,
      gameId,
      BigInt(p1Shot),
      true,
      p2Board.leaves[p1Shot],
      getMerkleProof(p1Shot, p2Board.levels),
      stepTime - 1n
    );

    if (turn < p2Targets.length - 1) {
      const p2Shot = p1EmptyTargets[turn];
      stepTime += 2n;
      await execCircuit('fire_shot', p2Secret, stepTime, gameId, BigInt(p2Shot), stepTime - 1n);
      stepTime += 2n;
      await execCircuit(
        'resolve_shot',
        p1Secret,
        stepTime,
        gameId,
        BigInt(p2Shot),
        false,
        p1Board.leaves[p2Shot],
        getMerkleProof(p2Shot, p1Board.levels),
        stepTime - 1n
      );
    }
  }
  stepTime += 2n;
  await execCircuit('claim_winner_payout', p1Secret, stepTime, gameId);

  const finalGame = contractMod.ledger(contractState).games.lookup(gameId);
  if (finalGame.phase !== 2 || !finalGame.is_payout_claimed || finalGame.p1_hits_against_p2 !== 17n) {
    throw new Error('Unexpected final game state after 17-hit compiled circuit transcript');
  }

  console.log('Circuit Replay   : 17-hit alternating compiled transcript + claim_winner_payout PASSED (phase=2, p1_hits_against_p2=17)');
}

runProofServerTestHarness().catch((err) => {
  console.error('Proof server harness failed:', err);
  process.exit(1);
});
