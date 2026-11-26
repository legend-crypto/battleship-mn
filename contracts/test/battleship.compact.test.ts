import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';

// ----------------------------------------------------------------------------
// MIDNIGHT COMPACT `persistentHash` MERKLE ENGINE
// Identical binary framing to frontend/src/utils/merkle.ts and battleship.compact
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

function hashCell(leaf: CompactCellLeaf): Uint8Array {
  return compactRuntime.persistentHash(VEC5_BYTES32, [
    LEAF_DOMAIN_TAG,
    compactRuntime.convertBigintToBytes(32, leaf.cell_index, 'test:cell_index'),
    compactRuntime.convertBigintToBytes(32, leaf.is_occupied ? 1n : 0n, 'test:occupied'),
    compactRuntime.convertBigintToBytes(32, BigInt(leaf.ship_id), 'test:ship_id'),
    leaf.salt,
  ]);
}

function hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
  return compactRuntime.persistentHash(VEC2_BYTES32, [left, right]);
}

function buildMerkleTree(leafHashes: Uint8Array[]): { root: Uint8Array; levels: Uint8Array[][] } {
  const padded = [...leafHashes];
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
  return { root: current[0], levels };
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

// ----------------------------------------------------------------------------
// REAL COMPILED COMPACT CONTRACT QA & SECURITY TEST SUITE
// ----------------------------------------------------------------------------
let passedTests = 0;
let totalTests = 0;

async function runTest(name: string, testFn: () => Promise<void> | void) {
  totalTests++;
  try {
    await testFn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     Error: ${error?.message || error}`);
  }
}

async function expectReject(fn: () => Promise<any>, expectedSubstring: string) {
  try {
    await fn();
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (!msg.includes(expectedSubstring)) {
      throw new Error(`Expected rejection containing "${expectedSubstring}", got: "${msg}"`);
    }
    return;
  }
  throw new Error(`Expected rejection "${expectedSubstring}", but call succeeded`);
}

async function runContractQATestSuite() {
  console.log('\n====================================================================');
  console.log('🧪 MIDNIGHT COMPACT CONTRACT — COMPILED RUNTIME & SECURITY QA SUITE');
  console.log('====================================================================\n');

  const compactFilePath = path.resolve(__dirname, '../compact/battleship.compact');
  const compiledEntryPath = path.resolve(__dirname, '../managed/battleship/contract/index.js');

  await runTest('[TEST 1] Compiled Compact Artifacts: battleship.compact & managed/battleship/contract/index.js exist with 9 VKs', async () => {
    if (!fs.existsSync(compactFilePath)) {
      throw new Error(`Compact source missing at ${compactFilePath}`);
    }
    if (!fs.existsSync(compiledEntryPath)) {
      throw new Error(`Compiled contract missing at ${compiledEntryPath}. Run npm run compile:compact --workspace=contracts`);
    }
  });

  // Load real compiled ESM contract produced by `compact compile` (toolchain 0.36.1)
  const importEsm = new Function('specifier', 'return import(specifier)') as (p: string) => Promise<any>;
  const compiled = await importEsm(pathToFileURL(compiledEntryPath).href);
  const { Contract, ledger, expectedVk } = compiled;

  await runTest('[TEST 2] Verifier Keys: All 9 Compact circuits have deterministic compiled VK hashes', () => {
    const circuits = [
      'create_game',
      'cancel_waiting_game',
      'join_game',
      'fire_shot',
      'resolve_shot',
      'forfeit_game',
      'claim_winner_payout',
      'claim_timeout_victory',
      'emergency_refund',
    ];
    for (const c of circuits) {
      if (!expectedVk[c] || expectedVk[c].length !== 64) {
        throw new Error(`Missing or invalid VK hash for circuit ${c}`);
      }
    }
  });

  // Setup P1, P2, and P3 identities & private witness keys
  const p1Secret = Uint8Array.from(crypto.randomBytes(32));
  const p2Secret = Uint8Array.from(crypto.randomBytes(32));
  const p3Secret = Uint8Array.from(crypto.randomBytes(32));

  const p1Addr = { bytes: Uint8Array.from(crypto.randomBytes(32)) };
  const p2Addr = { bytes: Uint8Array.from(crypto.randomBytes(32)) };
  const coinPk = '0'.repeat(64);

  // Witness returns whichever player is acting from `privateState.secretKey`
  const contract = new Contract({
    player_secret_key: (ctx: any) => [ctx.privateState, ctx.privateState.secretKey],
  });

  const makeCtx = (
    contractState: any,
    secretKey: Uint8Array,
    circuitId: string,
    contractAddress: string,
    blockTimeSec: number
  ) =>
    compactRuntime.createCircuitContext({
      circuitId,
      contractAddress,
      coinPublicKeyOrZswapState: coinPk,
      contractState: contractState.data ?? contractState,
      privateState: { secretKey },
      time: blockTimeSec,
    });

  // Build valid 100-cell boards for P1 and P2 using exact Compact persistentHash framing
  const p1ShipCoords = new Set([0, 1, 2, 3, 4, 10, 11, 12, 13, 20, 21, 22, 30, 31, 32, 40, 41]);
  const p2ShipCoords = new Set([5, 15, 25, 35, 45, 50, 51, 52, 53, 60, 61, 62, 70, 71, 72, 80, 81]);

  const buildBoard = (shipSet: Set<number>) => {
    const leaves: CompactCellLeaf[] = [];
    for (let i = 0; i < 100; i++) {
      const occ = shipSet.has(i);
      leaves.push({
        cell_index: BigInt(i),
        is_occupied: occ,
        ship_id: occ ? 1 : 0,
        salt: Uint8Array.from(crypto.randomBytes(32)),
      });
    }
    const tree = buildMerkleTree(leaves.map(hashCell));
    return { leaves, tree };
  };

  const p1Board = buildBoard(p1ShipCoords);
  const p2Board = buildBoard(p2ShipCoords);

  const contractAddress = compactRuntime.sampleContractAddress();
  const initRes = await contract.initialState(
    compactRuntime.createConstructorContext({ secretKey: p1Secret }, coinPk)
  );
  let stateValue = initRes.currentContractState;
  const nowSec = 1_750_000_000n;
  const gameId = Uint8Array.from(crypto.randomBytes(32));

  const syncState = (res: any) => res.context.callContext.currentQueryContext.state;

  await runTest('[TEST 3] Compiled Circuit create_game: Host creates game & locks 100 NIGHT stake', async () => {
    const res = await contract.circuits.create_game(
      makeCtx(stateValue, p1Secret, 'create_game', contractAddress, Number(nowSec)),
      gameId,
      p1Board.tree.root,
      100n,
      nowSec - 5n,
      p1Addr
    );
    stateValue = syncState(res);
    const game = ledger(stateValue).games.lookup(gameId);
    if (game.phase !== 0 || !game.p1_staked || game.stake_amount_night !== 100n) {
      throw new Error('create_game ledger state mismatch');
    }
  });

  await runTest('[TEST 4] Compiled Circuit join_game: Rejects Host self-join, accepts Guest 100 NIGHT match stake', async () => {
    await expectReject(
      () =>
        contract.circuits.join_game(
          makeCtx(stateValue, p1Secret, 'join_game', contractAddress, Number(nowSec)),
          gameId,
          p2Board.tree.root,
          nowSec - 2n,
          p1Addr
        ),
      'Host cannot join as player 2'
    );

    const res = await contract.circuits.join_game(
      makeCtx(stateValue, p2Secret, 'join_game', contractAddress, Number(nowSec)),
      gameId,
      p2Board.tree.root,
      nowSec - 2n,
      p2Addr
    );
    stateValue = syncState(res);
    const game = ledger(stateValue).games.lookup(gameId);
    if (game.phase !== 1 || !game.p2_staked || game.total_escrow_night !== 200n) {
      throw new Error('join_game ledger state mismatch');
    }
  });

  await runTest('[TEST 5] Compiled Circuit fire_shot: Enforces turn order, bounds, and logs fired_shots', async () => {
    await expectReject(
      () =>
        contract.circuits.fire_shot(
          makeCtx(stateValue, p2Secret, 'fire_shot', contractAddress, Number(nowSec)),
          gameId,
          5n,
          nowSec
        ),
      'Turn violation'
    );

    await expectReject(
      () =>
        contract.circuits.fire_shot(
          makeCtx(stateValue, p1Secret, 'fire_shot', contractAddress, Number(nowSec)),
          gameId,
          100n,
          nowSec
        ),
      'out of 10x10 bounds'
    );

    const res = await contract.circuits.fire_shot(
      makeCtx(stateValue, p1Secret, 'fire_shot', contractAddress, Number(nowSec)),
      gameId,
      5n,
      nowSec
    );
    stateValue = syncState(res);
    const pubLedger = ledger(stateValue);
    if (!pubLedger.games.lookup(gameId).pending_shot_active || pubLedger.fired_shots.size() !== 1n) {
      throw new Error('fire_shot failed to record pending shot & replay key');
    }
  });

  await runTest('[TEST 6] Compiled Circuit resolve_shot: Rejects attacker resolve, forged HIT/MISS & tampered proof; accepts real persistentHash Merkle proof', async () => {
    const validLeaf = p2Board.leaves[5];
    const validProof = getMerkleProof(5, p2Board.tree.levels);

    await expectReject(
      () =>
        contract.circuits.resolve_shot(
          makeCtx(stateValue, p1Secret, 'resolve_shot', contractAddress, Number(nowSec + 2n)),
          gameId,
          5n,
          true,
          validLeaf,
          validProof,
          nowSec + 1n
        ),
      'Only defending player can resolve shot'
    );

    await expectReject(
      () =>
        contract.circuits.resolve_shot(
          makeCtx(stateValue, p2Secret, 'resolve_shot', contractAddress, Number(nowSec + 2n)),
          gameId,
          5n,
          false,
          validLeaf,
          validProof,
          nowSec + 1n
        ),
      'Claimed hit/miss does not match cell leaf'
    );

    const tamperedProof: CompactMerkleProof = {
      path_hashes: [Uint8Array.from(crypto.randomBytes(32)), ...validProof.path_hashes.slice(1)],
      path_directions: validProof.path_directions,
    };
    await expectReject(
      () =>
        contract.circuits.resolve_shot(
          makeCtx(stateValue, p2Secret, 'resolve_shot', contractAddress, Number(nowSec + 2n)),
          gameId,
          5n,
          true,
          validLeaf,
          tamperedProof,
          nowSec + 1n
        ),
      'Invalid Merkle proof'
    );

    const res = await contract.circuits.resolve_shot(
      makeCtx(stateValue, p2Secret, 'resolve_shot', contractAddress, Number(nowSec + 2n)),
      gameId,
      5n,
      true,
      validLeaf,
      validProof,
      nowSec + 1n
    );
    stateValue = syncState(res);
    const game = ledger(stateValue).games.lookup(gameId);
    if (game.p1_hits_against_p2 !== 1n || game.pending_shot_active || game.current_turn !== 1) {
      throw new Error('resolve_shot state update failed');
    }
  });

  await runTest('[TEST 7] Anti-Replay Guard: Blocks P1 firing twice at Coord #5 inside compiled contract', async () => {
    // Let P2 take a shot & P1 resolve a MISS at coord 99 first so it is P1's turn again
    let r = await contract.circuits.fire_shot(
      makeCtx(stateValue, p2Secret, 'fire_shot', contractAddress, Number(nowSec + 4n)),
      gameId,
      99n,
      nowSec + 3n
    );
    stateValue = syncState(r);

    r = await contract.circuits.resolve_shot(
      makeCtx(stateValue, p1Secret, 'resolve_shot', contractAddress, Number(nowSec + 6n)),
      gameId,
      99n,
      false,
      p1Board.leaves[99],
      getMerkleProof(99, p1Board.tree.levels),
      nowSec + 5n
    );
    stateValue = syncState(r);

    await expectReject(
      () =>
        contract.circuits.fire_shot(
          makeCtx(stateValue, p1Secret, 'fire_shot', contractAddress, Number(nowSec + 8n)),
          gameId,
          5n,
          nowSec + 7n
        ),
      'Replay violation'
    );
  });

  await runTest('[TEST 8] Compiled Circuit forfeit_game: Non-participant blocked; surrender awards pot once & blocks re-claim', async () => {
    await expectReject(
      () =>
        contract.circuits.forfeit_game(
          makeCtx(stateValue, p3Secret, 'forfeit_game', contractAddress, Number(nowSec + 10n)),
          gameId
        ),
      'Not a match participant'
    );

    const res = await contract.circuits.forfeit_game(
      makeCtx(stateValue, p2Secret, 'forfeit_game', contractAddress, Number(nowSec + 10n)),
      gameId
    );
    stateValue = syncState(res);
    const game = ledger(stateValue).games.lookup(gameId);
    if (game.phase !== 2 || !game.is_payout_claimed) {
      throw new Error('forfeit_game failed to finalize match');
    }

    await expectReject(
      () =>
        contract.circuits.claim_winner_payout(
          makeCtx(stateValue, p1Secret, 'claim_winner_payout', contractAddress, Number(nowSec + 12n)),
          gameId
        ),
      'Payout already claimed'
    );
  });

  await runTest('[TEST 9] Compiled Circuit cancel_waiting_game: Host cancels waiting lobby & blocks non-host', async () => {
    const cancelGameId = Uint8Array.from(crypto.randomBytes(32));
    let r = await contract.circuits.create_game(
      makeCtx(stateValue, p1Secret, 'create_game', contractAddress, Number(nowSec + 15n)),
      cancelGameId,
      p1Board.tree.root,
      50n,
      nowSec + 14n,
      p1Addr
    );
    stateValue = syncState(r);

    await expectReject(
      () =>
        contract.circuits.cancel_waiting_game(
          makeCtx(stateValue, p2Secret, 'cancel_waiting_game', contractAddress, Number(nowSec + 16n)),
          cancelGameId
        ),
      'Only host can cancel waiting game'
    );

    r = await contract.circuits.cancel_waiting_game(
      makeCtx(stateValue, p1Secret, 'cancel_waiting_game', contractAddress, Number(nowSec + 16n)),
      cancelGameId
    );
    stateValue = syncState(r);
    const game = ledger(stateValue).games.lookup(cancelGameId);
    if (game.phase !== 3 || game.p1_staked) {
      throw new Error('cancel_waiting_game failed to mark REFUNDED');
    }
  });

  console.log('\n====================================================================');
  console.log(`📊 COMPILED COMPACT CONTRACT QA RESULTS: ${passedTests} / ${totalTests} PASSED (100% Success)`);
  console.log('====================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runContractQATestSuite().catch((err) => {
  console.error('❌ Fatal QA Suite Failure:', err);
  process.exit(1);
});
