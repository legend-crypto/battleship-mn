import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.21.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

class _UserAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_1 = new _UserAddress_0();

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_3 = __compactRuntime.CompactTypeBoolean;

const _descriptor_4 = new __compactRuntime.CompactTypeEnum(1, 1);

const _descriptor_5 = new __compactRuntime.CompactTypeEnum(3, 1);

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class _GameState_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_5.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_6.alignment().concat(_descriptor_6.alignment().concat(_descriptor_6.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment())))))))))))))))))))));
  }
  fromValue(value_0) {
    return {
      game_id: _descriptor_0.fromValue(value_0),
      player1_id: _descriptor_0.fromValue(value_0),
      player2_id: _descriptor_0.fromValue(value_0),
      player1_payout: _descriptor_1.fromValue(value_0),
      player2_payout: _descriptor_1.fromValue(value_0),
      board_commitment_p1: _descriptor_0.fromValue(value_0),
      board_commitment_p2: _descriptor_0.fromValue(value_0),
      stake_amount_night: _descriptor_2.fromValue(value_0),
      total_escrow_night: _descriptor_2.fromValue(value_0),
      p1_staked: _descriptor_3.fromValue(value_0),
      p2_staked: _descriptor_3.fromValue(value_0),
      is_payout_claimed: _descriptor_3.fromValue(value_0),
      current_turn: _descriptor_4.fromValue(value_0),
      phase: _descriptor_5.fromValue(value_0),
      created_timestamp: _descriptor_2.fromValue(value_0),
      last_action_timestamp: _descriptor_2.fromValue(value_0),
      p1_hits_against_p2: _descriptor_6.fromValue(value_0),
      p2_hits_against_p1: _descriptor_6.fromValue(value_0),
      last_shot_coord: _descriptor_6.fromValue(value_0),
      pending_shot_active: _descriptor_3.fromValue(value_0),
      winner_id: _descriptor_0.fromValue(value_0),
      winner_payout: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.game_id).concat(_descriptor_0.toValue(value_0.player1_id).concat(_descriptor_0.toValue(value_0.player2_id).concat(_descriptor_1.toValue(value_0.player1_payout).concat(_descriptor_1.toValue(value_0.player2_payout).concat(_descriptor_0.toValue(value_0.board_commitment_p1).concat(_descriptor_0.toValue(value_0.board_commitment_p2).concat(_descriptor_2.toValue(value_0.stake_amount_night).concat(_descriptor_2.toValue(value_0.total_escrow_night).concat(_descriptor_3.toValue(value_0.p1_staked).concat(_descriptor_3.toValue(value_0.p2_staked).concat(_descriptor_3.toValue(value_0.is_payout_claimed).concat(_descriptor_4.toValue(value_0.current_turn).concat(_descriptor_5.toValue(value_0.phase).concat(_descriptor_2.toValue(value_0.created_timestamp).concat(_descriptor_2.toValue(value_0.last_action_timestamp).concat(_descriptor_6.toValue(value_0.p1_hits_against_p2).concat(_descriptor_6.toValue(value_0.p2_hits_against_p1).concat(_descriptor_6.toValue(value_0.last_shot_coord).concat(_descriptor_3.toValue(value_0.pending_shot_active).concat(_descriptor_0.toValue(value_0.winner_id).concat(_descriptor_1.toValue(value_0.winner_payout))))))))))))))))))))));
  }
}

const _descriptor_7 = new _GameState_0();

const _descriptor_8 = new __compactRuntime.CompactTypeEnum(5, 1);

class _CellLeaf_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_3.alignment().concat(_descriptor_8.alignment().concat(_descriptor_0.alignment())));
  }
  fromValue(value_0) {
    return {
      cell_index: _descriptor_6.fromValue(value_0),
      is_occupied: _descriptor_3.fromValue(value_0),
      ship_id: _descriptor_8.fromValue(value_0),
      salt: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.cell_index).concat(_descriptor_3.toValue(value_0.is_occupied).concat(_descriptor_8.toValue(value_0.ship_id).concat(_descriptor_0.toValue(value_0.salt))));
  }
}

const _descriptor_9 = new _CellLeaf_0();

const _descriptor_10 = new __compactRuntime.CompactTypeVector(7, _descriptor_0);

const _descriptor_11 = new __compactRuntime.CompactTypeVector(7, _descriptor_3);

class _MerkleProof_0 {
  alignment() {
    return _descriptor_10.alignment().concat(_descriptor_11.alignment());
  }
  fromValue(value_0) {
    return {
      path_hashes: _descriptor_10.fromValue(value_0),
      path_directions: _descriptor_11.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_10.toValue(value_0.path_hashes).concat(_descriptor_11.toValue(value_0.path_directions));
  }
}

const _descriptor_12 = new _MerkleProof_0();

const _descriptor_13 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_14 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

const _descriptor_15 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_3.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_16 = new _Either_0();

const _descriptor_17 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_18 = new _ContractAddress_0();

class _Either_1 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_18.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_3.fromValue(value_0),
      left: _descriptor_18.fromValue(value_0),
      right: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.is_left).concat(_descriptor_18.toValue(value_0.left).concat(_descriptor_1.toValue(value_0.right)));
  }
}

const _descriptor_19 = new _Either_1();

class _Maybe_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_19.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_3.fromValue(value_0),
      value: _descriptor_19.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.is_some).concat(_descriptor_19.toValue(value_0.value));
  }
}

const _descriptor_20 = new _Maybe_0();

const _descriptor_21 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.player_secret_key) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named player_secret_key');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      create_game: async (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`create_game: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        const board_commitment_0 = args_1[2];
        const stake_amount_night_0 = args_1[3];
        const current_timestamp_0 = args_1[4];
        const payout_addr_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('create_game',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 140 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('create_game',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 140 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        if (!(board_commitment_0.buffer instanceof ArrayBuffer && board_commitment_0.BYTES_PER_ELEMENT === 1 && board_commitment_0.length === 32)) {
          __compactRuntime.typeError('create_game',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'battleship.compact line 140 char 1',
                                     'Bytes<32>',
                                     board_commitment_0)
        }
        if (!(typeof(stake_amount_night_0) === 'bigint' && stake_amount_night_0 >= 0n && stake_amount_night_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('create_game',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'battleship.compact line 140 char 1',
                                     'Uint<0..18446744073709551616>',
                                     stake_amount_night_0)
        }
        if (!(typeof(current_timestamp_0) === 'bigint' && current_timestamp_0 >= 0n && current_timestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('create_game',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'battleship.compact line 140 char 1',
                                     'Uint<0..18446744073709551616>',
                                     current_timestamp_0)
        }
        if (!(typeof(payout_addr_0) === 'object' && payout_addr_0.bytes.buffer instanceof ArrayBuffer && payout_addr_0.bytes.BYTES_PER_ELEMENT === 1 && payout_addr_0.bytes.length === 32)) {
          __compactRuntime.typeError('create_game',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'battleship.compact line 140 char 1',
                                     'struct UserAddress<bytes: Bytes<32>>',
                                     payout_addr_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0).concat(_descriptor_0.toValue(board_commitment_0).concat(_descriptor_2.toValue(stake_amount_night_0).concat(_descriptor_2.toValue(current_timestamp_0).concat(_descriptor_1.toValue(payout_addr_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._create_game_0(context,
                                                   partialProofData,
                                                   game_id_0,
                                                   board_commitment_0,
                                                   stake_amount_night_0,
                                                   current_timestamp_0,
                                                   payout_addr_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      cancel_waiting_game: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`cancel_waiting_game: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('cancel_waiting_game',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 190 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('cancel_waiting_game',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 190 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._cancel_waiting_game_0(context,
                                                           partialProofData,
                                                           game_id_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      join_game: async (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`join_game: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        const board_commitment_0 = args_1[2];
        const current_timestamp_0 = args_1[3];
        const payout_addr_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('join_game',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 213 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('join_game',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 213 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        if (!(board_commitment_0.buffer instanceof ArrayBuffer && board_commitment_0.BYTES_PER_ELEMENT === 1 && board_commitment_0.length === 32)) {
          __compactRuntime.typeError('join_game',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'battleship.compact line 213 char 1',
                                     'Bytes<32>',
                                     board_commitment_0)
        }
        if (!(typeof(current_timestamp_0) === 'bigint' && current_timestamp_0 >= 0n && current_timestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('join_game',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'battleship.compact line 213 char 1',
                                     'Uint<0..18446744073709551616>',
                                     current_timestamp_0)
        }
        if (!(typeof(payout_addr_0) === 'object' && payout_addr_0.bytes.buffer instanceof ArrayBuffer && payout_addr_0.bytes.BYTES_PER_ELEMENT === 1 && payout_addr_0.bytes.length === 32)) {
          __compactRuntime.typeError('join_game',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'battleship.compact line 213 char 1',
                                     'struct UserAddress<bytes: Bytes<32>>',
                                     payout_addr_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0).concat(_descriptor_0.toValue(board_commitment_0).concat(_descriptor_2.toValue(current_timestamp_0).concat(_descriptor_1.toValue(payout_addr_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._join_game_0(context,
                                                 partialProofData,
                                                 game_id_0,
                                                 board_commitment_0,
                                                 current_timestamp_0,
                                                 payout_addr_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      fire_shot: async (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`fire_shot: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        const target_coord_0 = args_1[2];
        const current_timestamp_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('fire_shot',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 248 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('fire_shot',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 248 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        if (!(typeof(target_coord_0) === 'bigint' && target_coord_0 >= 0n && target_coord_0 <= 255n)) {
          __compactRuntime.typeError('fire_shot',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'battleship.compact line 248 char 1',
                                     'Uint<0..256>',
                                     target_coord_0)
        }
        if (!(typeof(current_timestamp_0) === 'bigint' && current_timestamp_0 >= 0n && current_timestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('fire_shot',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'battleship.compact line 248 char 1',
                                     'Uint<0..18446744073709551616>',
                                     current_timestamp_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0).concat(_descriptor_6.toValue(target_coord_0).concat(_descriptor_2.toValue(current_timestamp_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_2.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._fire_shot_0(context,
                                                 partialProofData,
                                                 game_id_0,
                                                 target_coord_0,
                                                 current_timestamp_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      resolve_shot: async (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`resolve_shot: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        const target_coord_0 = args_1[2];
        const is_hit_0 = args_1[3];
        const leaf_0 = args_1[4];
        const proof_0 = args_1[5];
        const current_timestamp_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('resolve_shot',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 281 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('resolve_shot',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 281 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        if (!(typeof(target_coord_0) === 'bigint' && target_coord_0 >= 0n && target_coord_0 <= 255n)) {
          __compactRuntime.typeError('resolve_shot',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'battleship.compact line 281 char 1',
                                     'Uint<0..256>',
                                     target_coord_0)
        }
        if (!(typeof(is_hit_0) === 'boolean')) {
          __compactRuntime.typeError('resolve_shot',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'battleship.compact line 281 char 1',
                                     'Boolean',
                                     is_hit_0)
        }
        if (!(typeof(leaf_0) === 'object' && typeof(leaf_0.cell_index) === 'bigint' && leaf_0.cell_index >= 0n && leaf_0.cell_index <= 255n && typeof(leaf_0.is_occupied) === 'boolean' && typeof(leaf_0.ship_id) === 'number' && leaf_0.ship_id >= 0 && leaf_0.ship_id <= 5 && leaf_0.salt.buffer instanceof ArrayBuffer && leaf_0.salt.BYTES_PER_ELEMENT === 1 && leaf_0.salt.length === 32)) {
          __compactRuntime.typeError('resolve_shot',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'battleship.compact line 281 char 1',
                                     'struct CellLeaf<cell_index: Uint<0..256>, is_occupied: Boolean, ship_id: Enum<ShipId, EMPTY, CARRIER, BATTLESHIP, CRUISER, SUBMARINE, DESTROYER>, salt: Bytes<32>>',
                                     leaf_0)
        }
        if (!(typeof(proof_0) === 'object' && Array.isArray(proof_0.path_hashes) && proof_0.path_hashes.length === 7 && proof_0.path_hashes.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32) && Array.isArray(proof_0.path_directions) && proof_0.path_directions.length === 7 && proof_0.path_directions.every((t) => typeof(t) === 'boolean'))) {
          __compactRuntime.typeError('resolve_shot',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'battleship.compact line 281 char 1',
                                     'struct MerkleProof<path_hashes: Vector<7, Bytes<32>>, path_directions: Vector<7, Boolean>>',
                                     proof_0)
        }
        if (!(typeof(current_timestamp_0) === 'bigint' && current_timestamp_0 >= 0n && current_timestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('resolve_shot',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'battleship.compact line 281 char 1',
                                     'Uint<0..18446744073709551616>',
                                     current_timestamp_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0).concat(_descriptor_6.toValue(target_coord_0).concat(_descriptor_3.toValue(is_hit_0).concat(_descriptor_9.toValue(leaf_0).concat(_descriptor_12.toValue(proof_0).concat(_descriptor_2.toValue(current_timestamp_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_3.alignment().concat(_descriptor_9.alignment().concat(_descriptor_12.alignment().concat(_descriptor_2.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._resolve_shot_0(context,
                                                    partialProofData,
                                                    game_id_0,
                                                    target_coord_0,
                                                    is_hit_0,
                                                    leaf_0,
                                                    proof_0,
                                                    current_timestamp_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      forfeit_game: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`forfeit_game: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('forfeit_game',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 346 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('forfeit_game',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 346 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._forfeit_game_0(context,
                                                    partialProofData,
                                                    game_id_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      claim_winner_payout: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`claim_winner_payout: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('claim_winner_payout',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 375 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('claim_winner_payout',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 375 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._claim_winner_payout_0(context,
                                                           partialProofData,
                                                           game_id_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      claim_timeout_victory: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`claim_timeout_victory: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('claim_timeout_victory',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 398 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('claim_timeout_victory',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 398 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._claim_timeout_victory_0(context,
                                                             partialProofData,
                                                             game_id_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      emergency_refund: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`emergency_refund: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const game_id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('emergency_refund',
                                     'argument 1 (as invoked from Typescript)',
                                     'battleship.compact line 430 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(game_id_0.buffer instanceof ArrayBuffer && game_id_0.BYTES_PER_ELEMENT === 1 && game_id_0.length === 32)) {
          __compactRuntime.typeError('emergency_refund',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'battleship.compact line 430 char 1',
                                     'Bytes<32>',
                                     game_id_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(game_id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._emergency_refund_0(context,
                                                        partialProofData,
                                                        game_id_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      create_game: this.circuits.create_game,
      cancel_waiting_game: this.circuits.cancel_waiting_game,
      join_game: this.circuits.join_game,
      fire_shot: this.circuits.fire_shot,
      resolve_shot: this.circuits.resolve_shot,
      forfeit_game: this.circuits.forfeit_game,
      claim_winner_payout: this.circuits.claim_winner_payout,
      claim_timeout_victory: this.circuits.claim_timeout_victory,
      emergency_refund: this.circuits.emergency_refund
    };
    this.provableCircuits = {
      create_game: this.circuits.create_game,
      cancel_waiting_game: this.circuits.cancel_waiting_game,
      join_game: this.circuits.join_game,
      fire_shot: this.circuits.fire_shot,
      resolve_shot: this.circuits.resolve_shot,
      forfeit_game: this.circuits.forfeit_game,
      claim_winner_payout: this.circuits.claim_winner_payout,
      claim_timeout_victory: this.circuits.claim_timeout_victory,
      emergency_refund: this.circuits.emergency_refund
    };
  }
  async initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('create_game', new __compactRuntime.ContractOperation());
    state_0.setOperation('cancel_waiting_game', new __compactRuntime.ContractOperation());
    state_0.setOperation('join_game', new __compactRuntime.ContractOperation());
    state_0.setOperation('fire_shot', new __compactRuntime.ContractOperation());
    state_0.setOperation('resolve_shot', new __compactRuntime.ContractOperation());
    state_0.setOperation('forfeit_game', new __compactRuntime.ContractOperation());
    state_0.setOperation('claim_winner_payout', new __compactRuntime.ContractOperation());
    state_0.setOperation('claim_timeout_victory', new __compactRuntime.ContractOperation());
    state_0.setOperation('emergency_refund', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext({circuitId: 'constructor', contractAddress: __compactRuntime.dummyContractAddress(), coinPublicKeyOrZswapState: constructorContext_0.initialZswapLocalState.coinPublicKey, contractState: state_0.data, privateState: constructorContext_0.initialPrivateState});
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(1n),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  _left_0(value_0) {
    return { is_left: true, left: value_0, right: new Uint8Array(32) };
  }
  _right_0(value_0) {
    return { is_left: false, left: { bytes: new Uint8Array(32) }, right: value_0 };
  }
  async _blockTimeLt_0(context, partialProofData, time_0) {
    return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 2 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_6.toValue(2n),
                                                                                                 alignment: _descriptor_6.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(time_0),
                                                                                                                             alignment: _descriptor_2.alignment() }).encode() } },
                                                                      'lt',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  async _blockTimeGt_0(context, partialProofData, time_0) {
    return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(time_0),
                                                                                                                             alignment: _descriptor_2.alignment() }).encode() } },
                                                                      { dup: { n: 3 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_6.toValue(2n),
                                                                                                 alignment: _descriptor_6.alignment() } }] } },
                                                                      'lt',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  async _sendUnshielded_0(context,
                          partialProofData,
                          color_0,
                          amount_0,
                          recipient_0)
  {
    const tmp_0 = this._left_0(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(7n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_16.toValue(tmp_0),
                                                                                              alignment: _descriptor_16.alignment() }).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(amount_0),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    const tmp_1 = this._left_0(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(8n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.alignedConcat(
                                                                                              { value: _descriptor_16.toValue(tmp_1),
                                                                                                alignment: _descriptor_16.alignment() },
                                                                                              { value: _descriptor_19.toValue(recipient_0),
                                                                                                alignment: _descriptor_19.alignment() }
                                                                                            )).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(amount_0),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    if (recipient_0.is_left
        &&
        this._equal_0(recipient_0.left.bytes,
                      _descriptor_18.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 2 } },
                                                                                  { idx: { cached: true,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_6.toValue(0n),
                                                                                                             alignment: _descriptor_6.alignment() } }] } },
                                                                                  { popeq: { cached: true,
                                                                                             result: undefined } }]).value).bytes))
    {
      const tmp_2 = this._left_0(color_0);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { swap: { n: 0 } },
                                         { idx: { cached: true,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_6.toValue(6n),
                                                                    alignment: _descriptor_6.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_16.toValue(tmp_2),
                                                                                                alignment: _descriptor_16.alignment() }).encode() } },
                                         { dup: { n: 1 } },
                                         { dup: { n: 1 } },
                                         'member',
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(amount_0),
                                                                                                alignment: _descriptor_17.alignment() }).encode() } },
                                         { swap: { n: 0 } },
                                         'neg',
                                         { branch: { skip: 4 } },
                                         { dup: { n: 2 } },
                                         { dup: { n: 2 } },
                                         { idx: { cached: true,
                                                  pushPath: false,
                                                  path: [ { tag: 'stack' }] } },
                                         'add',
                                         { ins: { cached: true, n: 2 } },
                                         { swap: { n: 0 } }]);
    }
    return [];
  }
  async _receiveUnshielded_0(context, partialProofData, color_0, amount_0) {
    const tmp_0 = this._left_0(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(6n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_16.toValue(tmp_0),
                                                                                              alignment: _descriptor_16.alignment() }).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(amount_0),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    return [];
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_14, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_15, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_13, value_0);
    return result_0;
  }
  _player_secret_key_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.player_secret_key(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('player_secret_key',
                                 'return value',
                                 'battleship.compact line 91 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _derive_player_id_0(sk_0) {
    return this._persistentHash_2([new Uint8Array([98, 97, 116, 116, 108, 101, 115, 104, 105, 112, 58, 112, 107, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _hash_cell_leaf_0(leaf_0) {
    const occupied_byte_0 = leaf_0.is_occupied ? 1n : 0n;
    return this._persistentHash_1([new Uint8Array([98, 97, 116, 116, 108, 101, 115, 104, 105, 112, 58, 108, 101, 97, 102, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         leaf_0.cell_index,
                                                                         'battleship.compact line 104 char 5'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         occupied_byte_0,
                                                                         'battleship.compact line 105 char 5'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         BigInt(leaf_0.ship_id),
                                                                         'battleship.compact line 106 char 5'),
                                   leaf_0.salt]);
  }
  _merkle_step_0(current_0, sibling_0, is_right_child_0) {
    if (is_right_child_0) {
      return this._persistentHash_2([sibling_0, current_0]);
    } else {
      return this._persistentHash_2([current_0, sibling_0]);
    }
  }
  _verify_merkle_root_0(leaf_hash_0, proof_0) {
    const h1_0 = this._merkle_step_0(leaf_hash_0,
                                     proof_0.path_hashes[0],
                                     proof_0.path_directions[0]);
    const h2_0 = this._merkle_step_0(h1_0,
                                     proof_0.path_hashes[1],
                                     proof_0.path_directions[1]);
    const h3_0 = this._merkle_step_0(h2_0,
                                     proof_0.path_hashes[2],
                                     proof_0.path_directions[2]);
    const h4_0 = this._merkle_step_0(h3_0,
                                     proof_0.path_hashes[3],
                                     proof_0.path_directions[3]);
    const h5_0 = this._merkle_step_0(h4_0,
                                     proof_0.path_hashes[4],
                                     proof_0.path_directions[4]);
    const h6_0 = this._merkle_step_0(h5_0,
                                     proof_0.path_hashes[5],
                                     proof_0.path_directions[5]);
    return this._merkle_step_0(h6_0,
                               proof_0.path_hashes[6],
                               proof_0.path_directions[6]);
  }
  _shot_replay_key_0(game_id_0, shooter_id_0, target_coord_0) {
    return this._persistentHash_0([new Uint8Array([98, 97, 116, 116, 108, 101, 115, 104, 105, 112, 58, 115, 104, 111, 116, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   game_id_0,
                                   shooter_id_0,
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         target_coord_0,
                                                                         'battleship.compact line 132 char 5')]);
  }
  _night_token_color_0() { return new Uint8Array(32); }
  async _create_game_0(context,
                       partialProofData,
                       game_id_0,
                       board_commitment_0,
                       stake_amount_night_0,
                       current_timestamp_0,
                       payout_addr_0)
  {
    const pub_game_id_0 = game_id_0;
    const pub_commitment_0 = board_commitment_0;
    const pub_stake_0 = stake_amount_night_0;
    const pub_ts_0 = current_timestamp_0;
    const pub_payout_0 = payout_addr_0;
    __compactRuntime.assert(!_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_6.toValue(0n),
                                                                                                                   alignment: _descriptor_6.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Game ID already exists');
    __compactRuntime.assert(!this._equal_1(pub_commitment_0, new Uint8Array(32)),
                            'Invalid board commitment');
    __compactRuntime.assert(pub_stake_0 > 0n, 'Stake must be positive');
    __compactRuntime.assert(!await this._blockTimeLt_0(context,
                                                       partialProofData,
                                                       pub_ts_0),
                            'Timestamp ahead of block time');
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    await this._receiveUnshielded_0(context,
                                    partialProofData,
                                    this._night_token_color_0(),
                                    pub_stake_0);
    const new_game_0 = { game_id: pub_game_id_0,
                         player1_id: caller_id_0,
                         player2_id: new Uint8Array(32),
                         player1_payout: pub_payout_0,
                         player2_payout: { bytes: new Uint8Array(32) },
                         board_commitment_p1: pub_commitment_0,
                         board_commitment_p2: new Uint8Array(32),
                         stake_amount_night: pub_stake_0,
                         total_escrow_night: pub_stake_0,
                         p1_staked: true,
                         p2_staked: false,
                         is_payout_claimed: false,
                         current_turn: 0,
                         phase: 0,
                         created_timestamp: pub_ts_0,
                         last_action_timestamp: pub_ts_0,
                         p1_hits_against_p2: 0n,
                         p2_hits_against_p1: 0n,
                         last_shot_coord: 255n,
                         pending_shot_active: false,
                         winner_id: new Uint8Array(32),
                         winner_payout: { bytes: new Uint8Array(32) } };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(new_game_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _cancel_waiting_game_0(context, partialProofData, game_id_0) {
    const pub_game_id_0 = game_id_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    __compactRuntime.assert(game_0.phase === 0, 'Game already started or closed');
    __compactRuntime.assert(this._equal_2(caller_id_0, game_0.player1_id),
                            'Only host can cancel waiting game');
    __compactRuntime.assert(game_0.p1_staked, 'Host stake already refunded');
    await this._sendUnshielded_0(context,
                                 partialProofData,
                                 this._night_token_color_0(),
                                 game_0.stake_amount_night,
                                 this._right_0(game_0.player1_payout));
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: game_0.player2_id,
                    player1_payout: game_0.player1_payout,
                    player2_payout: game_0.player2_payout,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: game_0.board_commitment_p2,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night: game_0.total_escrow_night,
                    p1_staked: false,
                    p2_staked: game_0.p2_staked,
                    is_payout_claimed: game_0.is_payout_claimed,
                    current_turn: game_0.current_turn,
                    phase: 3,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: game_0.last_action_timestamp,
                    p1_hits_against_p2: game_0.p1_hits_against_p2,
                    p2_hits_against_p1: game_0.p2_hits_against_p1,
                    last_shot_coord: game_0.last_shot_coord,
                    pending_shot_active: game_0.pending_shot_active,
                    winner_id: game_0.winner_id,
                    winner_payout: game_0.winner_payout };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _join_game_0(context,
                     partialProofData,
                     game_id_0,
                     board_commitment_0,
                     current_timestamp_0,
                     payout_addr_0)
  {
    const pub_game_id_0 = game_id_0;
    const pub_commitment_0 = board_commitment_0;
    const pub_ts_0 = current_timestamp_0;
    const pub_payout_0 = payout_addr_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    __compactRuntime.assert(game_0.phase === 0, 'Game is not accepting player 2');
    __compactRuntime.assert(!this._equal_3(caller_id_0, game_0.player1_id),
                            'Host cannot join as player 2');
    __compactRuntime.assert(!this._equal_4(pub_commitment_0, new Uint8Array(32)),
                            'Invalid board commitment');
    __compactRuntime.assert(!await this._blockTimeLt_0(context,
                                                       partialProofData,
                                                       pub_ts_0),
                            'Timestamp ahead of block time');
    await this._receiveUnshielded_0(context,
                                    partialProofData,
                                    this._night_token_color_0(),
                                    game_0.stake_amount_night);
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: caller_id_0,
                    player1_payout: game_0.player1_payout,
                    player2_payout: pub_payout_0,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: pub_commitment_0,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night:
                      ((t1) => {
                        if (t1 > 18446744073709551615n) {
                          throw new __compactRuntime.CompactError('battleship.compact line 241 char 25: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                        }
                        return t1;
                      })(game_0.stake_amount_night + game_0.stake_amount_night),
                    p1_staked: game_0.p1_staked,
                    p2_staked: true,
                    is_payout_claimed: game_0.is_payout_claimed,
                    current_turn: 0,
                    phase: 1,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: pub_ts_0,
                    p1_hits_against_p2: game_0.p1_hits_against_p2,
                    p2_hits_against_p1: game_0.p2_hits_against_p1,
                    last_shot_coord: game_0.last_shot_coord,
                    pending_shot_active: game_0.pending_shot_active,
                    winner_id: game_0.winner_id,
                    winner_payout: game_0.winner_payout };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _fire_shot_0(context,
                     partialProofData,
                     game_id_0,
                     target_coord_0,
                     current_timestamp_0)
  {
    const pub_game_id_0 = game_id_0;
    const pub_coord_0 = target_coord_0;
    const pub_ts_0 = current_timestamp_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(game_0.phase === 1, 'Game is not in progress');
    __compactRuntime.assert(!game_0.pending_shot_active,
                            'Previous shot resolution pending');
    __compactRuntime.assert(pub_coord_0 < 100n,
                            'Target coordinate out of 10x10 bounds (0..99)');
    __compactRuntime.assert(!await this._blockTimeLt_0(context,
                                                       partialProofData,
                                                       pub_ts_0),
                            'Timestamp ahead of block time');
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    const expected_shooter_0 = game_0.current_turn === 0 ?
                               game_0.player1_id :
                               game_0.player2_id;
    __compactRuntime.assert(this._equal_5(caller_id_0, expected_shooter_0),
                            'Turn violation: Not your turn to fire');
    const key_0 = this._shot_replay_key_0(pub_game_id_0,
                                          caller_id_0,
                                          pub_coord_0);
    __compactRuntime.assert(!_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_6.toValue(1n),
                                                                                                                   alignment: _descriptor_6.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Replay violation: Coordinate already targeted');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(1n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(true),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: game_0.player2_id,
                    player1_payout: game_0.player1_payout,
                    player2_payout: game_0.player2_payout,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: game_0.board_commitment_p2,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night: game_0.total_escrow_night,
                    p1_staked: game_0.p1_staked,
                    p2_staked: game_0.p2_staked,
                    is_payout_claimed: game_0.is_payout_claimed,
                    current_turn: game_0.current_turn,
                    phase: game_0.phase,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: pub_ts_0,
                    p1_hits_against_p2: game_0.p1_hits_against_p2,
                    p2_hits_against_p1: game_0.p2_hits_against_p1,
                    last_shot_coord: pub_coord_0,
                    pending_shot_active: true,
                    winner_id: game_0.winner_id,
                    winner_payout: game_0.winner_payout };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _resolve_shot_0(context,
                        partialProofData,
                        game_id_0,
                        target_coord_0,
                        is_hit_0,
                        leaf_0,
                        proof_0,
                        current_timestamp_0)
  {
    const pub_game_id_0 = game_id_0;
    const pub_coord_0 = target_coord_0;
    const pub_is_hit_0 = is_hit_0;
    const pub_ts_0 = current_timestamp_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(game_0.phase === 1, 'Game is not in progress');
    __compactRuntime.assert(game_0.pending_shot_active,
                            'No pending shot to resolve');
    __compactRuntime.assert(game_0.last_shot_coord === pub_coord_0,
                            'Target coordinate mismatch');
    __compactRuntime.assert(leaf_0.cell_index === pub_coord_0,
                            'Leaf index mismatch');
    __compactRuntime.assert(leaf_0.is_occupied === pub_is_hit_0,
                            'Claimed hit/miss does not match cell leaf');
    __compactRuntime.assert(!await this._blockTimeLt_0(context,
                                                       partialProofData,
                                                       pub_ts_0),
                            'Timestamp ahead of block time');
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    const expected_defender_0 = game_0.current_turn === 0 ?
                                game_0.player2_id :
                                game_0.player1_id;
    __compactRuntime.assert(this._equal_6(caller_id_0, expected_defender_0),
                            'Only defending player can resolve shot');
    const target_commitment_0 = game_0.current_turn === 0 ?
                                game_0.board_commitment_p2 :
                                game_0.board_commitment_p1;
    const computed_root_0 = this._verify_merkle_root_0(this._hash_cell_leaf_0(leaf_0),
                                                       proof_0);
    __compactRuntime.assert(this._equal_7(computed_root_0, target_commitment_0),
                            'Invalid Merkle proof for defender commitment');
    const next_p1_hits_0 = ((t1) => {
                             if (t1 > 255n) {
                               throw new __compactRuntime.CompactError('battleship.compact line 313 char 24: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
                             }
                             return t1;
                           })(game_0.current_turn === 0 && pub_is_hit_0 ?
                              game_0.p1_hits_against_p2 + 1n :
                              game_0.p1_hits_against_p2);
    const next_p2_hits_0 = ((t1) => {
                             if (t1 > 255n) {
                               throw new __compactRuntime.CompactError('battleship.compact line 318 char 24: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
                             }
                             return t1;
                           })(game_0.current_turn === 1 && pub_is_hit_0 ?
                              game_0.p2_hits_against_p1 + 1n :
                              game_0.p2_hits_against_p1);
    const p1_won_0 = next_p1_hits_0 === 17n;
    const p2_won_0 = next_p2_hits_0 === 17n;
    const next_phase_0 = p1_won_0 || p2_won_0 ? 2 : 1;
    const next_winner_id_0 = p1_won_0 ?
                             game_0.player1_id :
                             p2_won_0 ? game_0.player2_id : game_0.winner_id;
    const next_winner_payout_0 = p1_won_0 ?
                                 game_0.player1_payout :
                                 p2_won_0 ?
                                 game_0.player2_payout :
                                 game_0.winner_payout;
    const next_turn_0 = next_phase_0 === 2 ?
                        game_0.current_turn :
                        game_0.current_turn === 0 ? 1 : 0;
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: game_0.player2_id,
                    player1_payout: game_0.player1_payout,
                    player2_payout: game_0.player2_payout,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: game_0.board_commitment_p2,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night: game_0.total_escrow_night,
                    p1_staked: game_0.p1_staked,
                    p2_staked: game_0.p2_staked,
                    is_payout_claimed: game_0.is_payout_claimed,
                    current_turn: next_turn_0,
                    phase: next_phase_0,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: pub_ts_0,
                    p1_hits_against_p2: next_p1_hits_0,
                    p2_hits_against_p1: next_p2_hits_0,
                    last_shot_coord: game_0.last_shot_coord,
                    pending_shot_active: false,
                    winner_id: next_winner_id_0,
                    winner_payout: next_winner_payout_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _forfeit_game_0(context, partialProofData, game_id_0) {
    const pub_game_id_0 = game_id_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(game_0.phase === 1, 'Game is not in progress');
    __compactRuntime.assert(!game_0.is_payout_claimed,
                            'Escrow payout already claimed');
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    __compactRuntime.assert(this._equal_8(caller_id_0, game_0.player1_id)
                            ||
                            this._equal_9(caller_id_0, game_0.player2_id),
                            'Not a match participant');
    const winner_id_0 = this._equal_10(caller_id_0, game_0.player1_id) ?
                        game_0.player2_id :
                        game_0.player1_id;
    const winner_payout_0 = this._equal_11(caller_id_0, game_0.player1_id) ?
                            game_0.player2_payout :
                            game_0.player1_payout;
    await this._sendUnshielded_0(context,
                                 partialProofData,
                                 this._night_token_color_0(),
                                 game_0.total_escrow_night,
                                 this._right_0(winner_payout_0));
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: game_0.player2_id,
                    player1_payout: game_0.player1_payout,
                    player2_payout: game_0.player2_payout,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: game_0.board_commitment_p2,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night: game_0.total_escrow_night,
                    p1_staked: game_0.p1_staked,
                    p2_staked: game_0.p2_staked,
                    is_payout_claimed: true,
                    current_turn: game_0.current_turn,
                    phase: 2,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: game_0.last_action_timestamp,
                    p1_hits_against_p2: game_0.p1_hits_against_p2,
                    p2_hits_against_p1: game_0.p2_hits_against_p1,
                    last_shot_coord: game_0.last_shot_coord,
                    pending_shot_active: game_0.pending_shot_active,
                    winner_id: winner_id_0,
                    winner_payout: winner_payout_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _claim_winner_payout_0(context, partialProofData, game_id_0) {
    const pub_game_id_0 = game_id_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(game_0.phase === 2, 'Game is not completed');
    __compactRuntime.assert(!game_0.is_payout_claimed, 'Payout already claimed');
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    __compactRuntime.assert(this._equal_12(caller_id_0, game_0.winner_id),
                            'Only verified winner can claim escrow pot');
    await this._sendUnshielded_0(context,
                                 partialProofData,
                                 this._night_token_color_0(),
                                 game_0.total_escrow_night,
                                 this._right_0(game_0.winner_payout));
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: game_0.player2_id,
                    player1_payout: game_0.player1_payout,
                    player2_payout: game_0.player2_payout,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: game_0.board_commitment_p2,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night: game_0.total_escrow_night,
                    p1_staked: game_0.p1_staked,
                    p2_staked: game_0.p2_staked,
                    is_payout_claimed: true,
                    current_turn: game_0.current_turn,
                    phase: game_0.phase,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: game_0.last_action_timestamp,
                    p1_hits_against_p2: game_0.p1_hits_against_p2,
                    p2_hits_against_p1: game_0.p2_hits_against_p1,
                    last_shot_coord: game_0.last_shot_coord,
                    pending_shot_active: game_0.pending_shot_active,
                    winner_id: game_0.winner_id,
                    winner_payout: game_0.winner_payout };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _claim_timeout_victory_0(context, partialProofData, game_id_0) {
    const pub_game_id_0 = game_id_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(game_0.phase === 1, 'Game is not in progress');
    __compactRuntime.assert(!game_0.is_payout_claimed,
                            'Escrow payout already claimed');
    __compactRuntime.assert(await this._blockTimeGt_0(context,
                                                      partialProofData,
                                                      ((t1) => {
                                                        if (t1 > 18446744073709551615n) {
                                                          throw new __compactRuntime.CompactError('battleship.compact line 405 char 22: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                                        }
                                                        return t1;
                                                      })(game_0.last_action_timestamp
                                                         +
                                                         60n)),
                            '60s dispute timeout not elapsed');
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    const expected_claimer_0 = game_0.pending_shot_active ?
                               game_0.current_turn === 0 ?
                               game_0.player1_id :
                               game_0.player2_id
                               :
                               game_0.current_turn === 0 ?
                               game_0.player2_id :
                               game_0.player1_id;
    __compactRuntime.assert(this._equal_13(caller_id_0, expected_claimer_0),
                            'Not eligible to claim opponent inactivity timeout');
    const winner_payout_0 = this._equal_14(caller_id_0, game_0.player1_id) ?
                            game_0.player1_payout :
                            game_0.player2_payout;
    await this._sendUnshielded_0(context,
                                 partialProofData,
                                 this._night_token_color_0(),
                                 game_0.total_escrow_night,
                                 this._right_0(winner_payout_0));
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: game_0.player2_id,
                    player1_payout: game_0.player1_payout,
                    player2_payout: game_0.player2_payout,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: game_0.board_commitment_p2,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night: game_0.total_escrow_night,
                    p1_staked: game_0.p1_staked,
                    p2_staked: game_0.p2_staked,
                    is_payout_claimed: true,
                    current_turn: game_0.current_turn,
                    phase: 2,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: game_0.last_action_timestamp,
                    p1_hits_against_p2: game_0.p1_hits_against_p2,
                    p2_hits_against_p1: game_0.p2_hits_against_p1,
                    last_shot_coord: game_0.last_shot_coord,
                    pending_shot_active: game_0.pending_shot_active,
                    winner_id: caller_id_0,
                    winner_payout: winner_payout_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _emergency_refund_0(context, partialProofData, game_id_0) {
    const pub_game_id_0 = game_id_0;
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_6.toValue(0n),
                                                                                                                  alignment: _descriptor_6.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Game does not exist');
    const game_0 = _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_6.toValue(0n),
                                                                                                         alignment: _descriptor_6.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_game_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(game_0.phase === 0 || game_0.phase === 1,
                            'Cannot refund completed game');
    __compactRuntime.assert(await this._blockTimeGt_0(context,
                                                      partialProofData,
                                                      ((t1) => {
                                                        if (t1 > 18446744073709551615n) {
                                                          throw new __compactRuntime.CompactError('battleship.compact line 436 char 22: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                                        }
                                                        return t1;
                                                      })(game_0.last_action_timestamp
                                                         +
                                                         3600n)),
                            '1-hour emergency refund timeout not elapsed');
    const caller_id_0 = this._derive_player_id_0(this._player_secret_key_0(context,
                                                                           partialProofData));
    __compactRuntime.assert(this._equal_15(caller_id_0, game_0.player1_id)
                            ||
                            this._equal_16(caller_id_0, game_0.player2_id),
                            'Only match participants can claim refund');
    const is_p1_0 = this._equal_17(caller_id_0, game_0.player1_id);
    if (is_p1_0) {
      __compactRuntime.assert(game_0.p1_staked,
                              'Player 1 stake already refunded');
      await this._sendUnshielded_0(context,
                                   partialProofData,
                                   this._night_token_color_0(),
                                   game_0.stake_amount_night,
                                   this._right_0(game_0.player1_payout));
    } else {
      __compactRuntime.assert(game_0.p2_staked,
                              'Player 2 stake already refunded');
      await this._sendUnshielded_0(context,
                                   partialProofData,
                                   this._night_token_color_0(),
                                   game_0.stake_amount_night,
                                   this._right_0(game_0.player2_payout));
    }
    const next_p1_staked_0 = is_p1_0 ? false : game_0.p1_staked;
    const next_p2_staked_0 = is_p1_0 && game_0.p2_staked;
    const next_phase_0 = !next_p1_staked_0 && !next_p2_staked_0 ?
                         3 :
                         game_0.phase;
    const tmp_0 = { game_id: game_0.game_id,
                    player1_id: game_0.player1_id,
                    player2_id: game_0.player2_id,
                    player1_payout: game_0.player1_payout,
                    player2_payout: game_0.player2_payout,
                    board_commitment_p1: game_0.board_commitment_p1,
                    board_commitment_p2: game_0.board_commitment_p2,
                    stake_amount_night: game_0.stake_amount_night,
                    total_escrow_night: game_0.total_escrow_night,
                    p1_staked: next_p1_staked_0,
                    p2_staked: next_p2_staked_0,
                    is_payout_claimed: game_0.is_payout_claimed,
                    current_turn: game_0.current_turn,
                    phase: next_phase_0,
                    created_timestamp: game_0.created_timestamp,
                    last_action_timestamp: game_0.last_action_timestamp,
                    p1_hits_against_p2: game_0.p1_hits_against_p2,
                    p2_hits_against_p1: game_0.p2_hits_against_p1,
                    last_shot_coord: game_0.last_shot_coord,
                    pending_shot_active: game_0.pending_shot_active,
                    winner_id: game_0.winner_id,
                    winner_payout: game_0.winner_payout };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_6.toValue(0n),
                                                                  alignment: _descriptor_6.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_game_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_12(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_13(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_15(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_16(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_17(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    games: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(0n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(0n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'battleship.compact line 87 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(0n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'battleship.compact line 87 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(0n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_7.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    fired_shots: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(1n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(1n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'battleship.compact line 88 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(1n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'battleship.compact line 88 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(1n),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  player_secret_key: (...args) => undefined
});
export const pureCircuits = {};
export const expectedVk = {
  'cancel_waiting_game': 'f6371047d2eff35df6541fff2a4e936e26ab30314153c62a283b7d7af8aa4bf4',
  'claim_timeout_victory': '9ff3de0c9f5c2683ba83cf40f90fdd68d9ff8ab292819888e79d404e7259f602',
  'claim_winner_payout': 'ed9838bd8b36e7186391929420ad133ef13b55e619f96fbff8e6cd0bb302c03a',
  'create_game': '08709f6dae2cb47d3c90ffe36e159e468d3148990ebe2f6b550baedf7af81b28',
  'emergency_refund': '5e452203f0076b4f72641b51a5af4f03633a2bbc5c40017e299ce046526c4f56',
  'fire_shot': 'c8afb89aaf2199e6a5faa59533f9912b8ee64ae05c274ee0480cf3221d9eb0c1',
  'forfeit_game': '4de2f9b8298c6b9680311476f8de107edd1e5d51ce9c4616cb497754a6692508',
  'join_game': '162526085f667019df4825a124c8438cfaaf155af34cf2bab56ce126fc92fedf',
  'resolve_shot': '8aa77ac4e4158ab93a9168c85918511b9ebe7342c039d87eb5a025ab68d3a134',
};

export const circuitSignatures = {
  'create_game': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}, {tag: 'Bytes', length: 32}, {tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Struct', name: 'UserAddress', elements: [{name: 'bytes', type: {tag: 'Bytes', length: 32}}]}], resultType: {tag: 'Tuple', types: []}},
  'cancel_waiting_game': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
  'join_game': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}, {tag: 'Bytes', length: 32}, {tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Struct', name: 'UserAddress', elements: [{name: 'bytes', type: {tag: 'Bytes', length: 32}}]}], resultType: {tag: 'Tuple', types: []}},
  'fire_shot': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}, {tag: 'Uint', maxval: '255'}, {tag: 'Uint', maxval: '18446744073709551615'}], resultType: {tag: 'Tuple', types: []}},
  'resolve_shot': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}, {tag: 'Uint', maxval: '255'}, {tag: 'Boolean'}, {tag: 'Struct', name: 'CellLeaf', elements: [{name: 'cell_index', type: {tag: 'Uint', maxval: '255'}}, {name: 'is_occupied', type: {tag: 'Boolean'}}, {name: 'ship_id', type: {tag: 'Enum', name: 'ShipId', elements: ['EMPTY', 'CARRIER', 'BATTLESHIP', 'CRUISER', 'SUBMARINE', 'DESTROYER']}}, {name: 'salt', type: {tag: 'Bytes', length: 32}}]}, {tag: 'Struct', name: 'MerkleProof', elements: [{name: 'path_hashes', type: {tag: 'Vector', length: 7, type: {tag: 'Bytes', length: 32}}}, {name: 'path_directions', type: {tag: 'Vector', length: 7, type: {tag: 'Boolean'}}}]}, {tag: 'Uint', maxval: '18446744073709551615'}], resultType: {tag: 'Tuple', types: []}},
  'forfeit_game': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
  'claim_winner_payout': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
  'claim_timeout_victory': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
  'emergency_refund': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
};

export const declaredInterfaces = {};

//# sourceMappingURL=index.js.map
