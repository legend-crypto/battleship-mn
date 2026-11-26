import { ACTIVE_MIDNIGHT_NETWORK } from './midnightWallet';

// Midnight Network Compact Contract Configuration
export const BATTLESHIP_STAKING_COMPACT_NAME = 'battleship.compact';
export const BATTLESHIP_CONTRACT_ADDRESS = ACTIVE_MIDNIGHT_NETWORK.contractAddress;

export const BATTLESHIP_STAKING_ADDRESS =
  BATTLESHIP_CONTRACT_ADDRESS ||
  `Not deployed on ${ACTIVE_MIDNIGHT_NETWORK.name} (compile & deploy contracts/compact/battleship.compact)`;

export const MIDNIGHT_PROOF_SERVER_URL =
  import.meta.env.VITE_MIDNIGHT_PROOF_SERVER_URL || 'http://127.0.0.1:6300';

export const MIDNIGHT_ZK_ASSETS_URL =
  import.meta.env.VITE_MIDNIGHT_ZK_ASSETS_URL || '/midnight-zk';

export const COMPACT_CIRCUITS = {
  createGame: 'create_game',
  cancelWaitingGame: 'cancel_waiting_game',
  joinGame: 'join_game',
  fireShot: 'fire_shot',
  resolveShot: 'resolve_shot',
  forfeitGame: 'forfeit_game',
  claimWinnerPayout: 'claim_winner_payout',
  claimTimeoutVictory: 'claim_timeout_victory',
  emergencyRefund: 'emergency_refund',
} as const;
