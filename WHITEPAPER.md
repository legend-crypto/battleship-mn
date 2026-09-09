# ⚓ Battleship MN — Technical Whitepaper

**Decentralized Zero-Knowledge Naval Strategy Protocol & On-Chain Escrow Engine on Midnight Network**

*Version 1.0 — September 2026*

---

## Executive Summary

**Battleship MN** is a Web3-native, privacy-preserving naval strategy platform built on the **Midnight Network**. It reinvents the classic 10x10 Battleship game by combining zero-knowledge client-side witness state commitments, real-time peer-to-peer multiplayer synchronization, an audited fog-of-war AI, and on-chain escrow wagers governed by Compact smart contracts (`BattleshipStaking.compact`).

On public blockchains, hidden-information games suffer from the **Transparency Paradox**: storing private board layouts on a public ledger exposes coordinates to block explorers and MEV bots. Battleship MN solves this using Midnight’s **Dual-Ledger Model**:
1. **Public NIGHT Ledger**: Houses transparent token wagers, match lifecycle state maps, turn sequences, and verified hit counters.
2. **Private ZK State**: Holds client-side 100-cell Merkle board commitment roots (`board_commitment`) and witness proofs. Shots are verified locally via ZK inclusion/exclusion path proofs, ensuring ship locations are never leaked prior to verified sinking.

---

## 1. Protocol Architecture & System Topology

Battleship MN is structured as a high-performance monorepo uniting zero-knowledge smart contracts, a framework-agnostic core game engine, a Dockerized proof server, and a high-contrast React command console.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Web3 Command Console (React + Vite)                    │
│                 Lace Wallet Extension • DApp Connector • Socket.io              │
└───────────────────────┬─────────────────────────────────┬───────────────────────┘
                        │                                 │
         ┌──────────────┴──────────────┐   ┌──────────────┴──────────────┐
         ▼                             ▼   ▼                             ▼
┌─────────────────────────┐  ┌───────────────────┐  ┌─────────────────────────┐
│ Public NIGHT Ledger     │  │ Local Proof Server│  │ Authoritative Backend   │
│ BattleshipStaking.compact│  │ Docker (Port 6300)│  │ Socket.io + Convex      │
└─────────────────────────┘  └───────────────────┘  └─────────────────────────┘
```

### 1.1 Core Components

| Layer | Component | Technology | Responsibility |
|---|---|---|---|
| **Smart Contracts** | `contracts/compact/` | Compact Language (`v0.14.0+`) | Enforces escrow deposits, turn order, ZK Merkle proof verification, payouts, and timeouts. |
| **Local ZK Prover** | `Docker Container` | `midnightnetwork/proof-server` | Generates ZK-SNARK proving keys & ZKIR circuits locally on port `6300`. |
| **Shared Engine** | `shared/` | Pure TypeScript | Framework-agnostic 10x10 grid logic, ship placement rules, and fog-of-war AI targeting. |
| **Multiplayer Server** | `backend/` | Node.js, Socket.io, Convex | Real-time state broadcasting, match code generation, and reconnect session syncing. |
| **Web3 Frontend** | `frontend/` | React 18, Tailwind CSS, Lucide | Interactive radar grids, Lace Wallet connector, and live transaction analytics. |

---

## 2. Dual-Ledger ZK State & Merkle Tree Design

### 2.1 100-Cell Merkle Tree Commitment
Each player’s 10x10 ocean grid consists of 100 coordinate cells ($0 \le \text{cell\_index} \le 99$). To commit private ship positions to the Midnight Network without exposing coordinates:
1. Each cell is represented as a `CellLeaf` structure:
   ```compact
   struct CellLeaf {
     cell_index: Uint<8>,
     is_occupied: Boolean,
     ship_id: ShipId,
     salt: Bytes<32>
   }
   ```
2. The client generates a secret 256-bit random salt for each cell.
3. A 7-depth Merkle tree ($2^7 = 128 \ge 100$) is constructed over the 100 hashed cell leaves.
4. The resulting 32-byte Merkle root (`board_commitment`) is submitted on-chain during match creation/joining.

### 2.2 ZK Proof Hit/Miss Resolution
When Player A fires a shot at `target_coord` ($0..99$):
1. Player B's device fetches the corresponding `CellLeaf` witness and 7-sibling Merkle proof path.
2. The `resolve_shot` Compact circuit verifies:
   $$\text{verify\_merkle\_root}(\text{hash\_cell\_leaf}(\text{leaf}), \text{proof}) == \text{target\_commitment}$$
3. The circuit updates verified hit counts (`p1_hits_against_p2` / `p2_hits_against_p1`). On 17 total hits, the contract transitions the match phase to `GAME_OVER` and assigns `winner`.

---

## 3. Compact Smart Contract Specification (`BattleshipStaking.compact`)

The protocol contract maintains public ledger state in a global map:
```compact
export ledger games: Map<Bytes<32>, GameState>;
```

### 3.1 Public Circuits

1. `create_game(game_id, board_commitment, stake_amount_night)`
   - **Access:** Host (Player 1).
   - **State Transition:** Initializes match record, locks `stake_amount_night` into contract-held escrow. Sets phase to `WAITING_FOR_PLAYER2`.
2. `join_game(game_id, board_commitment)`
   - **Access:** Guest (Player 2).
   - **State Transition:** Matches host wager. Total escrow pot becomes $2 \times \text{stake\_amount\_night}$. Sets phase to `IN_PROGRESS` and initializes turn clock.
3. `fire_shot(game_id, target_coord)`
   - **Access:** Active turn player.
   - **State Transition:** Validates bounds ($0 \le \text{target\_coord} \le 99$), enforces strict turn order, locks pending shot flag.
4. `resolve_shot(game_id, target_coord, is_hit, leaf, proof)`
   - **Access:** Defending player.
   - **State Transition:** Verifies Merkle proof against defender's commitment. Increments hit counter. Toggles turn or triggers `GAME_OVER` on 17 hits.
5. `claim_winner_payout(game_id)`
   - **Access:** Verified winner.
   - **State Transition:** Releases 100% of $2\times$ escrow pot in NIGHT tokens to caller.
6. `claim_timeout_victory(game_id)`
   - **Access:** Active player (if opponent is inactive for $>60\text{s}$).
   - **State Transition:** Solves AFK disputes by awarding victory and escrow pot to active player.
7. `emergency_refund(game_id)`
   - **Access:** Match participants (if match is stuck for $>1\text{h}$).
   - **State Transition:** Reclaims original deposited NIGHT stake to both players.

---

## 4. Artificial Intelligence Algorithm & Fog-of-War Audit

The single-player Tactical AI (`shared/src/ai.ts`) operates under strict fog-of-war constraints:

### 4.1 Audited Data Scoping
- **Zero Information Leakage:** The AI function receives strictly the 10x10 tracking grid of prior `HIT` / `MISS` results and remaining unsunk vessel lengths. It has zero access to private player ship placement data.

### 4.2 Search Strategy
1. **Checkerboard Parity Search (Hunt Mode):**
   - Evaluates coordinate parity matching the shortest unsunk vessel length ($\text{parity} = (x + y) \pmod{\text{min\_len}} == 0$).
   - Maximizes search efficiency by skipping cells impossible to house remaining vessels.
2. **Cardinal Pursuit (Target Mode):**
   - Upon scoring a `HIT`, probes orthogonal directions (North, South, East, West).
   - On a second consecutive hit, locks orientation line-of-fire until the vessel is `SUNK`, then reverts to parity search.

---

## 5. Security, Auditing & Verification

- **Reentrancy & Double-Claim Guard:** `is_payout_claimed` flag guarantees escrow pots can only be withdrawn once.
- **Turn Order Enforcers:** Contract state rejects out-of-turn transactions at the runtime level.
- **Unit Test Coverage:** 14/14 engine & AI unit tests passing (Vitest).
- **Vite Build Verification:** 100% clean bundle compilation with zero TypeScript errors.

---

## 6. Midnight Network Contract Specifications

| Parameter | Value |
|---|---|
| **Escrow Smart Contract** | `BattleshipStaking.compact` |
| **Configured Contract Address** | `0x0d8e9c14664f3757558a5fa5e3304f5c3807f7a6` |
| **Target Chain** | Midnight Network (Preview Testnet) |
| **RPC Node Endpoint** | `https://rpc.preview.midnight.network` |
| **Block Explorer** | [preview.midnightexplorer.com](https://preview.midnightexplorer.com) |

🔗 **[View Verified Contract on Midnight Explorer](https://preview.midnightexplorer.com)**


---

*© 2026 Battleship MN Team. Built for Midnight Network.*
