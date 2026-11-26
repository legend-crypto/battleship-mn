import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-js';
import {
  createLedger9MidnightProvider,
  createLedger9WalletProvider,
  type MidnightProviders,
} from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnightntwrk/ledger-v9';
import {
  MidnightBech32m,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
  UnshieldedAddress,
} from '@midnightntwrk/wallet-sdk-address-format';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import {
  Contract as CompiledBattleshipContract,
  type Witnesses,
} from '../../../contracts/managed/battleship/contract/index.js';
import {
  ACTIVE_MIDNIGHT_NETWORK,
  getEnabledLaceApi,
  getLaceProvider,
  isLaceWalletAvailable,
} from '../config/midnightWallet';
import {
  BATTLESHIP_CONTRACT_ADDRESS,
  MIDNIGHT_PROOF_SERVER_URL,
  MIDNIGHT_ZK_ASSETS_URL,
} from '../config/contract';
import {
  bytesToHex,
  CellLeafData,
  hexToBytes32,
  MerkleProof,
} from '../utils/merkle';

export interface CompactGameRecord {
  gameId: string;
  player1: string;
  player2?: string;
  boardCommitmentP1: string;
  boardCommitmentP2?: string;
  currentTurn: 'PLAYER_1' | 'PLAYER_2';
  phase: 'WAITING' | 'IN_PROGRESS' | 'GAME_OVER' | 'REFUNDED';
  p1Hits: number;
  p2Hits: number;
  winner?: string;
}

export interface ProtocolReadiness {
  networkKey: string;
  networkName: string;
  contractDeployed: boolean;
  proofServerOnline: boolean;
  laceAvailable: boolean;
  rpcConfigured: boolean;
  readyForOnChain: boolean;
}

interface BattleshipPrivateState {
  secretKey: Uint8Array;
}

const MATCH_SK_STORAGE_PREFIX = 'mn_battleship_sk_';
const PRIVATE_DB_PASSWORD_KEY = 'mn_private_db_key_v1';

function parseHexBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return out;
}

function getOrCreateLocalDbPassword(): string {
  const existing = localStorage.getItem(PRIVATE_DB_PASSWORD_KEY);
  if (existing && existing.length >= 16) return existing;
  // Generate 24 random bytes with mixed character classes satisfying MidnightJS password policy
  const rnd = new Uint8Array(18);
  crypto.getRandomValues(rnd);
  const generated = `Mn#${bytesToHex(rnd)}A9!`;
  localStorage.setItem(PRIVATE_DB_PASSWORD_KEY, generated);
  return generated;
}

/**
 * Generates or loads a 32-byte private authentication key for `player_secret_key()` witness
 * scoped to a specific match ID. Never leaves browser localStorage or ZK proof witness scope.
 */
function getOrCreateMatchSecretKey(gameIdBytes32: string): Uint8Array {
  const key = `${MATCH_SK_STORAGE_PREFIX}${gameIdBytes32.toLowerCase()}`;
  const stored = localStorage.getItem(key);
  if (stored && stored.length >= 64) {
    return hexToBytes32(stored);
  }
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  localStorage.setItem(key, bytesToHex(secret));
  return secret;
}

function toAtomicNight(stakeAmountNight: string): bigint {
  const parsed = Number(stakeAmountNight);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid NIGHT stake amount: "${stakeAmountNight}"`);
  }
  return BigInt(Math.round(parsed * 1_000_000));
}

function toWebSocketUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) return `wss://${httpUrl.slice('https://'.length)}`;
  if (httpUrl.startsWith('http://')) return `ws://${httpUrl.slice('http://'.length)}`;
  return httpUrl;
}

function makeCompiledContract(gameIdBytes32: string) {
  const witnesses: Witnesses<BattleshipPrivateState> = {
    player_secret_key: (context) => {
      const sk =
        context.privateState?.secretKey instanceof Uint8Array && context.privateState.secretKey.length === 32
          ? context.privateState.secretKey
          : getOrCreateMatchSecretKey(gameIdBytes32);
      return [{ secretKey: sk }, sk];
    },
  };

  return CompiledContract.make('battleship', CompiledBattleshipContract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(
      typeof window !== 'undefined' && MIDNIGHT_ZK_ASSETS_URL.startsWith('/')
        ? `${window.location.origin}${MIDNIGHT_ZK_ASSETS_URL}`
        : MIDNIGHT_ZK_ASSETS_URL
    )
  );
}

/**
 * Checks whether the local Midnight Proof Server (port 6300) is reachable.
 */
export async function checkProofServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${MIDNIGHT_PROOF_SERVER_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function getProtocolReadiness(): Promise<ProtocolReadiness> {
  const proofServerOnline = await checkProofServerHealth();
  const contractDeployed = !!BATTLESHIP_CONTRACT_ADDRESS;
  const laceAvailable = isLaceWalletAvailable();
  const rpcConfigured = !!ACTIVE_MIDNIGHT_NETWORK.rpcUrl && !!ACTIVE_MIDNIGHT_NETWORK.indexerUrl;

  return {
    networkKey: ACTIVE_MIDNIGHT_NETWORK.key,
    networkName: ACTIVE_MIDNIGHT_NETWORK.name,
    contractDeployed,
    proofServerOnline,
    laceAvailable,
    rpcConfigured,
    readyForOnChain: contractDeployed && proofServerOnline && laceAvailable && rpcConfigured,
  };
}

async function resolveLaceWalletApi(): Promise<ConnectedAPI> {
  let api = await getEnabledLaceApi();
  if (!api) {
    const rawProvider = getLaceProvider();
    if (rawProvider && (typeof rawProvider.connect === 'function' || typeof rawProvider.enable === 'function')) {
      api =
        typeof rawProvider.connect === 'function'
          ? await rawProvider.connect(ACTIVE_MIDNIGHT_NETWORK.id)
          : await rawProvider.enable();
    }
  }
  if (!api) {
    throw new Error(
      'Lace Wallet Required: Install and unlock the Midnight Lace Wallet extension to sign and submit transactions.'
    );
  }
  return api as ConnectedAPI;
}

async function decodeLaceAddresses(api: ConnectedAPI, networkId: string) {
  const [shielded, unshielded] = await Promise.all([
    api.getShieldedAddresses(),
    api.getUnshieldedAddress(),
  ]);

  const coinPublicKey = ShieldedCoinPublicKey.codec
    .decode(networkId, MidnightBech32m.parse(shielded.shieldedCoinPublicKey))
    .toHexString();
  const encryptionPublicKey = ShieldedEncryptionPublicKey.codec
    .decode(networkId, MidnightBech32m.parse(shielded.shieldedEncryptionPublicKey))
    .toHexString();
  const unshieldedBytes = Uint8Array.from(
    UnshieldedAddress.codec.decode(networkId, MidnightBech32m.parse(unshielded.unshieldedAddress)).data
  );

  return {
    coinPublicKey,
    encryptionPublicKey,
    unshieldedBytes,
  };
}

async function buildBrowserMidnightProviders(gameIdBytes32: string) {
  if (ACTIVE_MIDNIGHT_NETWORK.requiresBlockfrost && !ACTIVE_MIDNIGHT_NETWORK.rpcUrl) {
    throw new Error(
      `${ACTIVE_MIDNIGHT_NETWORK.name} Endpoint Missing: Configure Blockfrost Midnight RPC/Indexer URLs in .env before transacting on ${ACTIVE_MIDNIGHT_NETWORK.shortLabel}.`
    );
  }

  const proofServerOnline = await checkProofServerHealth();
  if (!proofServerOnline) {
    throw new Error(
      `Midnight Proof Server Offline (${MIDNIGHT_PROOF_SERVER_URL}): Start Docker Desktop and run "npm run setup:stack --workspace=contracts" so ZK-SNARK proofs can be generated locally.`
    );
  }

  const api = await resolveLaceWalletApi();
  const configFromWallet =
    typeof api.getConfiguration === 'function' ? await api.getConfiguration() : undefined;
  const networkId = configFromWallet?.networkId || ACTIVE_MIDNIGHT_NETWORK.id;
  setNetworkId(networkId);

  const { coinPublicKey, encryptionPublicKey, unshieldedBytes } = await decodeLaceAddresses(
    api,
    networkId
  );

  const zkBaseUrl =
    typeof window !== 'undefined' && MIDNIGHT_ZK_ASSETS_URL.startsWith('/')
      ? `${window.location.origin}${MIDNIGHT_ZK_ASSETS_URL}`
      : MIDNIGHT_ZK_ASSETS_URL;

  const zkConfigProvider = new FetchZkConfigProvider(zkBaseUrl);
  const indexerHttp = configFromWallet?.indexerUri || ACTIVE_MIDNIGHT_NETWORK.indexerUrl;
  const indexerWs = configFromWallet?.indexerWsUri || toWebSocketUrl(indexerHttp);
  const proofUrl = configFromWallet?.proverServerUri || MIDNIGHT_PROOF_SERVER_URL;

  const walletProvider = createLedger9WalletProvider({
    balanceTx: async (tx) => {
      const serializedHex = bytesToHex(tx.serialize());
      const res = await api.balanceUnsealedTransaction(serializedHex);
      return parseHexBytes(res.tx);
    },
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
  });

  const midnightProvider = createLedger9MidnightProvider(async (tx) => {
    const serializedHex = bytesToHex(tx.serialize());
    await api.submitTransaction(serializedHex);
    const decoded = tx.deserialize({ v9: Transaction });
    return decoded.identifiers()[0] || decoded.transactionHash();
  });

  const providers: MidnightProviders<any, string, BattleshipPrivateState> = {
    privateStateProvider: levelPrivateStateProvider({
      privateStoragePasswordProvider: () => getOrCreateLocalDbPassword(),
      accountId: coinPublicKey,
    }),
    publicDataProvider: indexerPublicDataProvider(indexerHttp, indexerWs),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proofUrl, zkConfigProvider),
    walletProvider,
    midnightProvider,
    config: {
      networkId,
      ttlSeconds: 300,
    },
  };

  return {
    providers,
    compiledContract: makeCompiledContract(gameIdBytes32),
    unshieldedBytes,
    initialPrivateState: { secretKey: getOrCreateMatchSecretKey(gameIdBytes32) },
  };
}

export class CompactContractService {
  /**
   * Deploys `contracts/managed/battleship` directly from the browser using Lace Wallet + Proof Server.
   * Useful when no server deployer seed is configured in `.env`.
   */
  static async deployContractWithLace(): Promise<{ contractAddress: string; txId: string }> {
    const { providers, compiledContract, initialPrivateState } =
      await buildBrowserMidnightProviders('deploy_seed');

    const deployed = await deployContract(providers as any, {
      compiledContract,
      privateStateId: 'battleship_deploy_v1',
      initialPrivateState,
    });

    return {
      contractAddress: deployed.deployTxData.public.contractAddress,
      txId: deployed.deployTxData.public.txId,
    };
  }

  private static async getDeployedContract(gameIdBytes32: string) {
    if (!BATTLESHIP_CONTRACT_ADDRESS) {
      throw new Error(
        `Midnight Contract Not Deployed on ${ACTIVE_MIDNIGHT_NETWORK.name}: ` +
          `Compile contracts/compact/battleship.compact, deploy it via Lace or npm run deploy:midnight --workspace=contracts, and set VITE_MIDNIGHT_CONTRACT_ADDRESS.`
      );
    }

    const { providers, compiledContract, unshieldedBytes, initialPrivateState } =
      await buildBrowserMidnightProviders(gameIdBytes32);

    const found = await findDeployedContract(providers as any, {
      compiledContract,
      contractAddress: BATTLESHIP_CONTRACT_ADDRESS,
      privateStateId: `battleship_${gameIdBytes32.toLowerCase()}`,
      initialPrivateState,
    });

    return { found, unshieldedBytes };
  }

  static async createGame(
    gameIdBytes32: string,
    boardCommitment: string,
    stakeAmountNight: string = '0.1'
  ): Promise<string> {
    const { found, unshieldedBytes } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.create_game(
      hexToBytes32(gameIdBytes32),
      hexToBytes32(boardCommitment),
      toAtomicNight(stakeAmountNight),
      BigInt(Math.floor(Date.now() / 1000)),
      { bytes: unshieldedBytes }
    );
    return tx.public.txId;
  }

  static async cancelWaitingGame(gameIdBytes32: string): Promise<string> {
    const { found } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.cancel_waiting_game(hexToBytes32(gameIdBytes32));
    return tx.public.txId;
  }

  static async joinGame(gameIdBytes32: string, boardCommitment: string): Promise<string> {
    const { found, unshieldedBytes } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.join_game(
      hexToBytes32(gameIdBytes32),
      hexToBytes32(boardCommitment),
      BigInt(Math.floor(Date.now() / 1000)),
      { bytes: unshieldedBytes }
    );
    return tx.public.txId;
  }

  static async fireShot(gameIdBytes32: string, targetCoord: number): Promise<string> {
    const { found } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.fire_shot(
      hexToBytes32(gameIdBytes32),
      BigInt(targetCoord),
      BigInt(Math.floor(Date.now() / 1000))
    );
    return tx.public.txId;
  }

  static async resolveShot(
    gameIdBytes32: string,
    targetCoord: number,
    isHit: boolean,
    leaf: CellLeafData,
    proof: MerkleProof
  ): Promise<string> {
    const { found } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.resolve_shot(
      hexToBytes32(gameIdBytes32),
      BigInt(targetCoord),
      isHit,
      {
        cell_index: BigInt(leaf.cellIndex),
        is_occupied: leaf.isOccupied,
        ship_id: leaf.shipId,
        salt: hexToBytes32(leaf.salt),
      },
      {
        path_hashes: proof.pathHashes.map(hexToBytes32),
        path_directions: proof.pathDirections,
      },
      BigInt(Math.floor(Date.now() / 1000))
    );
    return tx.public.txId;
  }

  static async forfeitGame(gameIdBytes32: string): Promise<string> {
    const { found } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.forfeit_game(hexToBytes32(gameIdBytes32));
    return tx.public.txId;
  }

  static async claimWinnerPayout(gameIdBytes32: string): Promise<string> {
    const { found } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.claim_winner_payout(hexToBytes32(gameIdBytes32));
    return tx.public.txId;
  }

  static async claimTimeoutVictory(gameIdBytes32: string): Promise<string> {
    const { found } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.claim_timeout_victory(hexToBytes32(gameIdBytes32));
    return tx.public.txId;
  }

  static async emergencyRefund(gameIdBytes32: string): Promise<string> {
    const { found } = await this.getDeployedContract(gameIdBytes32);
    const tx = await found.callTx.emergency_refund(hexToBytes32(gameIdBytes32));
    return tx.public.txId;
  }
}
