// Midnight Network Compact Contract Configuration
export const BATTLESHIP_STAKING_COMPACT_NAME = 'battleship.compact';
export const BATTLESHIP_CONTRACT_ADDRESS =
  import.meta.env.VITE_MIDNIGHT_CONTRACT_ADDRESS || '';

export const BATTLESHIP_STAKING_ADDRESS =
  BATTLESHIP_CONTRACT_ADDRESS || 'Not deployed (compile & deploy contracts/compact/battleship.compact)';

export const MIDNIGHT_PROOF_SERVER_URL =
  import.meta.env.VITE_MIDNIGHT_PROOF_SERVER_URL || 'http://127.0.0.1:6300';

export const COMPACT_CIRCUITS = {
  createGame: 'create_game',
  joinGame: 'join_game',
  fireShot: 'fire_shot',
  resolveShot: 'resolve_shot',
  claimWinnerPayout: 'claim_winner_payout',
  claimTimeoutVictory: 'claim_timeout_victory',
  emergencyRefund: 'emergency_refund',
} as const;
