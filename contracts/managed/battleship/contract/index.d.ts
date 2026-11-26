import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  player_secret_key(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  create_game(context: __compactRuntime.CircuitContext<PS>,
              game_id_0: Uint8Array,
              board_commitment_0: Uint8Array,
              stake_amount_night_0: bigint,
              current_timestamp_0: bigint,
              payout_addr_0: { bytes: Uint8Array }): Promise<__compactRuntime.CircuitResults<PS, []>>;
  cancel_waiting_game(context: __compactRuntime.CircuitContext<PS>,
                      game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  join_game(context: __compactRuntime.CircuitContext<PS>,
            game_id_0: Uint8Array,
            board_commitment_0: Uint8Array,
            current_timestamp_0: bigint,
            payout_addr_0: { bytes: Uint8Array }): Promise<__compactRuntime.CircuitResults<PS, []>>;
  fire_shot(context: __compactRuntime.CircuitContext<PS>,
            game_id_0: Uint8Array,
            target_coord_0: bigint,
            current_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  resolve_shot(context: __compactRuntime.CircuitContext<PS>,
               game_id_0: Uint8Array,
               target_coord_0: bigint,
               is_hit_0: boolean,
               leaf_0: { cell_index: bigint,
                         is_occupied: boolean,
                         ship_id: number,
                         salt: Uint8Array
                       },
               proof_0: { path_hashes: Uint8Array[], path_directions: boolean[]
                        },
               current_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  forfeit_game(context: __compactRuntime.CircuitContext<PS>,
               game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_winner_payout(context: __compactRuntime.CircuitContext<PS>,
                      game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_timeout_victory(context: __compactRuntime.CircuitContext<PS>,
                        game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  emergency_refund(context: __compactRuntime.CircuitContext<PS>,
                   game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  create_game(context: __compactRuntime.CircuitContext<PS>,
              game_id_0: Uint8Array,
              board_commitment_0: Uint8Array,
              stake_amount_night_0: bigint,
              current_timestamp_0: bigint,
              payout_addr_0: { bytes: Uint8Array }): Promise<__compactRuntime.CircuitResults<PS, []>>;
  cancel_waiting_game(context: __compactRuntime.CircuitContext<PS>,
                      game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  join_game(context: __compactRuntime.CircuitContext<PS>,
            game_id_0: Uint8Array,
            board_commitment_0: Uint8Array,
            current_timestamp_0: bigint,
            payout_addr_0: { bytes: Uint8Array }): Promise<__compactRuntime.CircuitResults<PS, []>>;
  fire_shot(context: __compactRuntime.CircuitContext<PS>,
            game_id_0: Uint8Array,
            target_coord_0: bigint,
            current_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  resolve_shot(context: __compactRuntime.CircuitContext<PS>,
               game_id_0: Uint8Array,
               target_coord_0: bigint,
               is_hit_0: boolean,
               leaf_0: { cell_index: bigint,
                         is_occupied: boolean,
                         ship_id: number,
                         salt: Uint8Array
                       },
               proof_0: { path_hashes: Uint8Array[], path_directions: boolean[]
                        },
               current_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  forfeit_game(context: __compactRuntime.CircuitContext<PS>,
               game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_winner_payout(context: __compactRuntime.CircuitContext<PS>,
                      game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_timeout_victory(context: __compactRuntime.CircuitContext<PS>,
                        game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  emergency_refund(context: __compactRuntime.CircuitContext<PS>,
                   game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  create_game(context: __compactRuntime.CircuitContext<PS>,
              game_id_0: Uint8Array,
              board_commitment_0: Uint8Array,
              stake_amount_night_0: bigint,
              current_timestamp_0: bigint,
              payout_addr_0: { bytes: Uint8Array }): Promise<__compactRuntime.CircuitResults<PS, []>>;
  cancel_waiting_game(context: __compactRuntime.CircuitContext<PS>,
                      game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  join_game(context: __compactRuntime.CircuitContext<PS>,
            game_id_0: Uint8Array,
            board_commitment_0: Uint8Array,
            current_timestamp_0: bigint,
            payout_addr_0: { bytes: Uint8Array }): Promise<__compactRuntime.CircuitResults<PS, []>>;
  fire_shot(context: __compactRuntime.CircuitContext<PS>,
            game_id_0: Uint8Array,
            target_coord_0: bigint,
            current_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  resolve_shot(context: __compactRuntime.CircuitContext<PS>,
               game_id_0: Uint8Array,
               target_coord_0: bigint,
               is_hit_0: boolean,
               leaf_0: { cell_index: bigint,
                         is_occupied: boolean,
                         ship_id: number,
                         salt: Uint8Array
                       },
               proof_0: { path_hashes: Uint8Array[], path_directions: boolean[]
                        },
               current_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  forfeit_game(context: __compactRuntime.CircuitContext<PS>,
               game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_winner_payout(context: __compactRuntime.CircuitContext<PS>,
                      game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_timeout_victory(context: __compactRuntime.CircuitContext<PS>,
                        game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  emergency_refund(context: __compactRuntime.CircuitContext<PS>,
                   game_id_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type Ledger = {
  games: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { game_id: Uint8Array,
                                 player1_id: Uint8Array,
                                 player2_id: Uint8Array,
                                 player1_payout: { bytes: Uint8Array },
                                 player2_payout: { bytes: Uint8Array },
                                 board_commitment_p1: Uint8Array,
                                 board_commitment_p2: Uint8Array,
                                 stake_amount_night: bigint,
                                 total_escrow_night: bigint,
                                 p1_staked: boolean,
                                 p2_staked: boolean,
                                 is_payout_claimed: boolean,
                                 current_turn: number,
                                 phase: number,
                                 created_timestamp: bigint,
                                 last_action_timestamp: bigint,
                                 p1_hits_against_p2: bigint,
                                 p2_hits_against_p1: bigint,
                                 last_shot_coord: bigint,
                                 pending_shot_active: boolean,
                                 winner_id: Uint8Array,
                                 winner_payout: { bytes: Uint8Array }
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { game_id: Uint8Array,
  player1_id: Uint8Array,
  player2_id: Uint8Array,
  player1_payout: { bytes: Uint8Array },
  player2_payout: { bytes: Uint8Array },
  board_commitment_p1: Uint8Array,
  board_commitment_p2: Uint8Array,
  stake_amount_night: bigint,
  total_escrow_night: bigint,
  p1_staked: boolean,
  p2_staked: boolean,
  is_payout_claimed: boolean,
  current_turn: number,
  phase: number,
  created_timestamp: bigint,
  last_action_timestamp: bigint,
  p1_hits_against_p2: bigint,
  p2_hits_against_p1: bigint,
  last_shot_coord: bigint,
  pending_shot_active: boolean,
  winner_id: Uint8Array,
  winner_payout: { bytes: Uint8Array }
}]>
  };
  fired_shots: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
}

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
export declare const circuitSignatures: __compactRuntime.CircuitSignatures;
export declare const declaredInterfaces: __compactRuntime.DeclaredInterfaces;
