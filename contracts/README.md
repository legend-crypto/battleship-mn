# Midnight Compact Smart Contracts

The EVM Solidity contract (`BattleshipStaking.sol`) and Hardhat configuration have been removed as part of the transition to **Midnight Network**.

This directory is designated for **Midnight Compact smart contracts** (`BattleshipStaking.compact`).

---

## 🔒 Midnight Architecture Specifications

Compact smart contracts leverage Midnight's dual-ledger model:
- **Public NIGHT Ledger:** Holds token escrow deposits and handles payout distribution.
- **Private ZK State:** Maintains hidden board commitments and evaluates ZK-SNARK hit/miss state transitions without revealing unshot ship coordinates.

---

## 📜 Planned Compact Contract Interface

```compact
// BattleshipStaking.compact
// Smart contract interface for private-state board commitments & ZK resolution

export ledger match_escrow: Map<Bytes<32>, EscrowDetails>;

export circuit create_match(match_id: Bytes<32>, board_commitment: Bytes<32>): Void;
export circuit join_match(match_id: Bytes<32>, board_commitment: Bytes<32>): Void;
export circuit verify_hit_proof(match_id: Bytes<32>, target_pos: Uint<8>, proof: ZkProof): Boolean;
export circuit claim_winner_payout(match_id: Bytes<32>, victory_proof: ZkProof): Void;
```
