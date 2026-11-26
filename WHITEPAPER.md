# ⚓ Battleship MN — Technical Whitepaper

**Decentralized Zero-Knowledge Naval Strategy Protocol & On-Chain Escrow Engine on Midnight Network**

*Version 1.1 — November 2026*

---

## Executive Summary

**Battleship MN** is a Web3-native, privacy-preserving naval strategy protocol designed for the **Midnight Network**. It combines zero-knowledge Merkle board commitments, serverless real-time PvP synchronization via **Convex**, an audited fog-of-war Tactical AI, and an on-chain NIGHT escrow specification written in Midnight Compact ([`contracts/compact/battleship.compact`](contracts/compact/battleship.compact)).

On transparent blockchains, hidden-information games suffer from the **Transparency Paradox**: storing private ship layouts on-chain exposes coordinates to observers. Battleship MN addresses this using Midnight’s **Dual-Ledger Model**:
1. **Public Ledger:** Tracks match lifecycles, equal NIGHT escrow wagers, turn order, replay protection (`fired_shots`), and verified hit counts.
2. **Private Witness & Merkle Commitments:** Holds 100-cell salted Merkle board commitments (`board_commitment`). Shots are proven hit or miss against the defending player’s commitment root via 7-level Merkle proofs verified inside the ZK circuit without revealing unhit cells.

---

## 1. Protocol Architecture & System Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       Web3 Command Console (React + Vite)                       │
│               Lace DApp Connector • Merkle Prover • Convex Client               │
└───────────────────────┬─────────────────────────────────┬───────────────────────┘
                        │                                 │
         ┌──────────────┴──────────────┐   ┌──────────────┴──────────────┐
         ▼                             ▼   ▼                             ▼
┌─────────────────────────┐  ┌───────────────────┐  ┌─────────────────────────┐
│ Midnight Compact Ledger │  │ Local Proof Server│  │ Convex Realtime Sync    │
│ battleship.compact      │  │ Docker (:6300)    │  │ frontend/convex/        │
└─────────────────────────┘  └───────────────────┘  └─────────────────────────┘
```

### 1.1 Core Components

| Layer | Location | Technology | Responsibility |
|---|---|---|---|
| **Smart Contracts** | `contracts/compact/battleship.compact` | Compact (`v0.14.0+`) | Enforces escrow deposits, turn order, replay guards, in-circuit Merkle verification, forfeits, timeouts, and payouts. |
| **Local ZK Prover** | Docker Container | `midnightnetwork/proof-server` | Generates client-side ZK-SNARK proofs locally on port `6300`. |
| **Shared Engine** | `shared/` | Pure TypeScript | Framework-agnostic 10×10 grid logic, ship placement rules, and fog-of-war AI targeting. |
| **Realtime Sync** | `frontend/convex/` | Convex | Reactive lobby matchmaking, live match history, leaderboard, and shot/proof message relay (zero raw fleet data stored). |
| **Web3 Frontend** | `frontend/` | React 18, Tailwind CSS, Vite | Interactive radar grids, Lace Wallet integration, and live network/prover readiness checks. |

---

## 2. Dual-Ledger ZK State & Merkle Tree Design

### 2.1 100-Cell Domain-Separated Merkle Tree
Each player’s 10×10 ocean grid consists of 100 coordinate cells ($0 \le \text{cell\_index} \le 99$).
1. Each cell produces a domain-separated `CellLeaf` with a cryptographically random 32-byte salt:
   ```compact
   struct CellLeaf {
     cell_index: Uint<8>,
     is_occupied: Boolean,
     ship_id: ShipId,
     salt: Bytes<32>
   }
   ```
2. Leaves are padded to 128 ($2^7$) and hashed up a 7-level binary Merkle tree to yield a single 32-byte `board_commitment`.

### 2.2 In-Circuit Hit/Miss Verification & Replay Protection
When Player A targets `target_coord`:
1. `fire_shot` checks `fired_shots` keyed by `persistentHash(["battleship:shot:v1", game_id, shooter, target_coord])` so no coordinate can be fired at twice to farm hits.
2. Defender calls `resolve_shot` with `leaf` and a 7-sibling `MerkleProof` (`path_hashes` + `path_directions`).
3. Inside Compact, `hash_cell_leaf(leaf)` and the unrolled 7-step `verify_merkle_root` execute via `persistentHash` and assert equality against the defender’s stored `board_commitment`.
4. Reaching `17` verified hits transitions the match to `GAME_OVER` and unlocks `claim_winner_payout`.

---

## 3. Compact Smart Contract Circuits (`battleship.compact`)

1. `create_game(game_id, board_commitment, stake_amount_night, current_timestamp)` — Locks host’s NIGHT wager into escrow.
2. `cancel_waiting_game(game_id)` — Refunds host immediately if no guest has joined yet.
3. `join_game(game_id, board_commitment, current_timestamp)` — Locks guest’s equal NIGHT stake and starts battle.
4. `fire_shot(game_id, target_coord, current_timestamp)` — Enforces bounds, active turn, and `fired_shots` anti-replay.
5. `resolve_shot(game_id, target_coord, is_hit, leaf, proof, current_timestamp)` — Verifies cell leaf & Merkle proof in-circuit; updates score & turn.
6. `forfeit_game(game_id)` — Allows either active participant to surrender and release the 2× pot to the opponent.
7. `claim_winner_payout(game_id)` — Transfers 100% of escrow pot to verified winner (guarded by `is_payout_claimed`).
8. `claim_timeout_victory(game_id)` — Enforces 60s opponent inactivity timeout via `blockTimeGreaterThan`.
9. `emergency_refund(game_id)` — Reclaims original stakes after 1 hour of stuck inactivity.

---

## 4. Artificial Intelligence Algorithm & Fog-of-War Audit

The single-player Tactical AI (`shared/src/ai.ts`) operates under strict fog-of-war constraints:
- **Zero Information Leakage:** Receives strictly prior `HIT` / `MISS` tracking results and remaining unsunk ship lengths — never private board coordinates.
- **Checkerboard Parity Search (Hunt Mode):** Targets coordinates aligned with minimum remaining vessel length parity.
- **Cardinal Pursuit (Target Mode):** Probes orthogonal neighbors upon scoring a hit and locks ship orientation until sunk.

---

## 5. Multi-Network Progression

Battleship MN configures three Midnight environments in [`frontend/src/config/midnightWallet.ts`](frontend/src/config/midnightWallet.ts):
- **Preview Testnet (`preview`):** Default development environment.
- **Preprod (`preprod`):** Staging environment authenticated via Blockfrost.
- **Mainnet (`mainnet`):** Production environment authenticated via Blockfrost once `battleship.compact` is compiled with `compactc`, bound to the canonical NIGHT token color, and deployed. See [`MAINNET.md`](MAINNET.md).

---

*© 2026 Battleship MN Team. Built for Midnight Network.*
