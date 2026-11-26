import { ACTIVE_MIDNIGHT_NETWORK, getEnabledLaceApi, getLaceProvider, isLaceWalletAvailable } from '../config/midnightWallet';
import { BATTLESHIP_CONTRACT_ADDRESS, MIDNIGHT_PROOF_SERVER_URL } from '../config/contract';
import { CellLeafData, MerkleProof } from '../utils/merkle';

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

/**
 * Checks whether the local Midnight Proof Server (port 6300) is reachable.
 */
export async function checkProofServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${MIDNIGHT_PROOF_SERVER_URL}/health`, {
      signal: controller.signal
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

export class CompactContractService {
  /**
   * Executes a Midnight Compact circuit using the compiled contract interface
   * + local Proof Server + connected Lace Midnight Wallet.
   *
   * NOTE: Does NOT mock transactions or substitute `signData` message signatures
   * for on-chain extrinsics. Requires `compactc` compilation, a deployed
   * contract address on the active network, and an active Proof Server on :6300.
   */
  private static async invokeCircuit(circuitName: string, args: any[]): Promise<string> {
    if (ACTIVE_MIDNIGHT_NETWORK.requiresBlockfrost && !ACTIVE_MIDNIGHT_NETWORK.rpcUrl) {
      throw new Error(
        `${ACTIVE_MIDNIGHT_NETWORK.name} Endpoint Missing: Configure Blockfrost Midnight RPC/Indexer URLs in .env before transacting on ${ACTIVE_MIDNIGHT_NETWORK.shortLabel}.`
      );
    }

    if (!BATTLESHIP_CONTRACT_ADDRESS) {
      throw new Error(
        `Midnight Contract Not Deployed on ${ACTIVE_MIDNIGHT_NETWORK.name}: ` +
          `Start Docker Desktop, run "npm run setup:stack --workspace=contracts", compile contracts/compact/battleship.compact with compactc, and set VITE_MIDNIGHT_CONTRACT_ADDRESS.`
      );
    }

    const proofServerOnline = await checkProofServerHealth();
    if (!proofServerOnline) {
      throw new Error(
        `Midnight Proof Server Offline (${MIDNIGHT_PROOF_SERVER_URL}): Start Docker Desktop and run "npm run setup:stack --workspace=contracts" so ZK-SNARK proofs can be generated locally.`
      );
    }

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

    if (typeof api.submitCircuit === 'function') {
      return await api.submitCircuit(circuitName, args);
    }
    if (api.midnight && typeof api.midnight.submitCircuit === 'function') {
      return await api.midnight.submitCircuit(circuitName, args);
    }
    if (api.compact && typeof api.compact.submitCircuit === 'function') {
      return await api.compact.submitCircuit(circuitName, args);
    }

    throw new Error(
      `Compiled Midnight.js Contract Bindings Missing: Lace Wallet connected and Proof Server is online, ` +
        `but @midnight-ntwrk/midnight-js-contracts compiled artifacts from compactc have not been generated and wired into CompactContractService yet (cannot execute "${circuitName}").`
    );
  }

  static async createGame(
    gameIdBytes32: string,
    boardCommitment: string,
    stakeAmountNight: string = '0.1'
  ): Promise<string> {
    return this.invokeCircuit('create_game', [
      gameIdBytes32,
      boardCommitment,
      stakeAmountNight,
      Math.floor(Date.now() / 1000)
    ]);
  }

  static async cancelWaitingGame(gameIdBytes32: string): Promise<string> {
    return this.invokeCircuit('cancel_waiting_game', [gameIdBytes32]);
  }

  static async joinGame(gameIdBytes32: string, boardCommitment: string): Promise<string> {
    return this.invokeCircuit('join_game', [
      gameIdBytes32,
      boardCommitment,
      Math.floor(Date.now() / 1000)
    ]);
  }

  static async fireShot(gameIdBytes32: string, targetCoord: number): Promise<string> {
    return this.invokeCircuit('fire_shot', [
      gameIdBytes32,
      targetCoord,
      Math.floor(Date.now() / 1000)
    ]);
  }

  static async resolveShot(
    gameIdBytes32: string,
    targetCoord: number,
    isHit: boolean,
    leaf: CellLeafData,
    proof: MerkleProof
  ): Promise<string> {
    return this.invokeCircuit('resolve_shot', [
      gameIdBytes32,
      targetCoord,
      isHit,
      leaf,
      proof,
      Math.floor(Date.now() / 1000)
    ]);
  }

  static async forfeitGame(gameIdBytes32: string): Promise<string> {
    return this.invokeCircuit('forfeit_game', [gameIdBytes32]);
  }

  static async claimWinnerPayout(gameIdBytes32: string): Promise<string> {
    return this.invokeCircuit('claim_winner_payout', [gameIdBytes32]);
  }

  static async claimTimeoutVictory(gameIdBytes32: string): Promise<string> {
    return this.invokeCircuit('claim_timeout_victory', [gameIdBytes32]);
  }

  static async emergencyRefund(gameIdBytes32: string): Promise<string> {
    return this.invokeCircuit('emergency_refund', [gameIdBytes32]);
  }
}
