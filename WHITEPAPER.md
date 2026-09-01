# Battleship MN Technical Whitepaper

**Decentralized On-Chain Escrow & Real-Time Tactical Zero-Knowledge Naval Strategy Engine on Midnight Network**

*Version 1.0 — August 2026*

---

## Executive Summary

**Battleship MN** is a high-performance, Web3-native tactical naval strategy game powered by **Midnight Network**. It combines a framework-agnostic 10x10 grid Battleship engine, Compact smart contracts for private-state commitments, zero-knowledge hit/miss resolution proofs, an audited Hunt-and-Target AI, and smart contract escrow staking (`BattleshipStaking.compact`).

Players can engage in two distinct game modes:
1. **Practice Mode (Offline AI):** A wallet-free tactical environment for training and fleet placement mastery.
2. **Staked Multiplayer & AI Battles:** On-chain escrow staking where players deposit native tokens on **Midnight Network** and claim 2x pooled stakes upon verified ZK victory.

---

## 1. System Architecture

Battleship MN employs Midnight's dual-ledger architecture ensuring zero client-side cheating, private board state commitments, and trustless funds settlement:

```
                  ┌──────────────────────────────────────────┐
                  │             Web3 Frontend                │
                  │ React + Tailwind + Midnight Wallet SDK   │
                  └────────────────────┬─────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
         ┌────────────────────────┐        ┌─────────────────────────┐
         │  Public NIGHT Ledger   │        │  Private ZK State &     │
         │ (Token Stakes/Escrow)  │        │ Compact Smart Contract  │
         └────────────┬───────────┘        └────────────┬────────────┘
                      │                                 │
                      └────────────────┬────────────────┘
                                       ▼
                         ┌────────────────────────┐
                         │     Shared Engine      │
                         │  TypeScript Core Rules │
                         └────────────────────────┘
```

### 1.1 Shared Game Engine (`/shared`)
- Written in pure TypeScript with zero external dependencies.
- Enforces official 10x10 grid Battleship rules:
  - Fleet composition: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2) = 17 total ship cells.
  - Coordinate system: Columns A–J (0–9), Rows 1–10 (0–9).
  - Move validation: Out-of-bounds protection, overlap detection, duplicate shot prevention.

### 1.2 Private ZK State Commitments
- Fleet ship placements are committed to Midnight's private ZK state via Compact smart contracts.
- Coordinates remain private until hit or revealed post-match.

### 1.3 Smart Contract Escrow (`/contracts`)
- Contract: `BattleshipStaking.compact`
- Deployed on **Midnight Network**.
- Written in Compact for privacy-preserving smart contract execution. Holds token stakes securely on the public NIGHT ledger until evaluated by private ZK proofs.

### 1.4 Web3 User Interface (`/frontend`)
- React + Vite + TailwindCSS + Lucide Icons.
- Midnight Wallet integration supporting Lace and injected Web3 browser wallets.
- Custom high-contrast tactical command console with radial radar sweep, dual ocean grids, live logs, and post-match accuracy analytics.

---

## 2. Artificial Intelligence Algorithm

The single-player Tactical AI algorithm (`shared/src/ai.ts`) operates under strict fog-of-war constraints:

### 2.1 Audited Data Access Scoping
- The AI algorithm receives **only** the `trackingGrid` (the 10x10 grid of previous HIT/MISS results) and the list of remaining target vessel sizes.
- **Zero Data Leak:** The AI has **no access** to private player ship coordinates prior to hits.

### 2.2 Dual-Phase Search Strategy
1. **Opening / Parity Search (Hunt Mode):**
   - Evaluates a checkerboard parity pattern (`(x + y) % 2 === 0` or shortest remaining ship length parity).
   - Minimizes unnecessary shots by prioritizing coordinates that can fit the smallest unsunk vessel.
2. **Target Mode:**
   - Upon scoring a `HIT`, switches to cardinal direction probing (North, South, East, West).
   - Identifies vessel orientation upon scoring a second consecutive hit and pursues line-firing until the ship is `SUNK`.
   - Reverts to parity opening search once the target ship is destroyed.

---

## 3. Smart Contract Staking & Zero-Knowledge Resolution

### 3.1 Escrow Workflow
1. **Match Creation:** Player 1 calls `createMatch(matchIdBytes32)` sending token stake into the contract escrow.
2. **Match Joining:** Player 2 calls `joinMatch(matchIdBytes32)` matching the exact stake amount.
3. **Escrow Lockup:** The Compact contract holds the $2\times$ pooled stake securely in escrow.

### 3.2 Zero-Knowledge Proof Hit/Miss Attestation
To eliminate per-turn gas fees and maintain full board privacy:

1. Game moves generate zero-knowledge proofs (ZK-SNARKs) verifying hit/miss accuracy against private board commitments.
2. Compact State Transition:
   $$\text{verify\_hit\_proof}(\text{boardCommitment}, \text{targetPos}, \text{resultHash}) \rightarrow \text{zkpResult}$$
3. Upon sinking all 5 enemy vessels, the winner submits final ZK proof to release the pooled stake.

---

## 4. Midnight Network Parameters

| Parameter | Value |
|---|---|
| **Network Name** | Midnight Network |
| **Escrow Contract** | `BattleshipStaking.compact` |
| **Ledger Model** | Dual-Ledger (Public NIGHT + Private ZK State) |
| **Explorer** | [https://explorer.midnight.network](https://explorer.midnight.network) |

---

## 5. Tokenomics & Staking Limits

- **Player Stake Range:** `0.01 NIGHT` to `0.10 NIGHT` per match during test-run phase.
- **Prize Pool Scaling:** Total prize pool equals `2x` the player's stake (`0.02 NIGHT` to `0.20 NIGHT`).

---

## 6. Verification & Security Audit

- **Unit Test Coverage:** 14/14 engine & AI unit tests passing (Vitest).
- **Contract Test Suite:** Smart contract unit tests passing for reentrancy guard, unauthorized claims, and refund timeouts.

---

*© 2026 Battleship MN Team. Built for Midnight Network.*
