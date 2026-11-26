# ⚓ Battleship MN

**Decentralized Zero-Knowledge Naval Strategy & Token Staking Protocol on Midnight Network**

[![Midnight Network](https://img.shields.io/badge/Chain-Midnight_Network-blueviolet?style=for-the-badge)](https://preview.midnightexplorer.com)
[![Compact Language](https://img.shields.io/badge/Smart_Contract-Compact_v0.14-emerald?style=for-the-badge)](contracts/compact/battleship.compact)
[![Convex Realtime](https://img.shields.io/badge/Realtime_Sync-Convex-orange?style=for-the-badge)](frontend/convex/schema.ts)
[![Docker Proof Server](https://img.shields.io/badge/Docker-Proof_Server_6300-blue?style=for-the-badge)](SETUP.md)

A classic 10×10 Battleship strategy game built with real-time Convex multiplayer sync, an offline tactical fog-of-war AI opponent, client-side Merkle commitments, and a hardened Midnight Compact escrow specification ([`battleship.compact`](contracts/compact/battleship.compact)).

---

## 📖 Quick Links

- [🚀 Quick Setup Guide (`SETUP.md`)](SETUP.md) — Instructions for Docker Proof Server, Convex, & local dev.
- [📜 Technical Whitepaper (`WHITEPAPER.md`)](WHITEPAPER.md) — Protocol architecture, Merkle proofs, and Compact circuits.
- [🛡️ Mainnet Readiness Guide (`MAINNET.md`)](MAINNET.md) — Network environments (Preview Testnet → Preprod → Mainnet) and pre-mainnet checklist.
- [🌐 Midnight Preview Explorer](https://preview.midnightexplorer.com) — View testnet blocks and transactions.

---

## 🎮 Key Features

- **Dual-Ledger Escrow Spec (`battleship.compact`)** — Players wager equal NIGHT stakes into contract escrow (`receiveUnshielded` / `sendUnshielded`), with winner claiming 100% of the 2× pot upon verified victory or opponent forfeit/timeout.
- **In-Circuit Merkle Verification & Anti-Replay** — Fleet layouts are committed as a 100-cell salted SHA-256 Merkle root (`battleship:leaf:v1`). `resolve_shot` verifies the 7-level proof inside Compact using `persistentHash`, while `fired_shots` blocks repeat-shot farming.
- **Local ZK AI Mode (Offline)** — Play instantly offline against a tactical computer opponent using checkerboard parity hunt mode and cardinal target pursuit. No wallet required.
- **Real-Time Convex PvP Multiplayer** — Create or join 6-character match lobbies over Convex reactive queries without exposing raw ship coordinates.
- **Liveness & Griefing Protections** — Includes `cancel_waiting_game` before P2 joins, voluntary `forfeit_game` surrender, 60-second `claim_timeout_victory`, and 1-hour `emergency_refund`.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, TypeScript (Vite), Tailwind CSS | Tactical command console, Lace Wallet connector, live protocol readiness monitor. |
| **ZK Smart Contracts** | Compact (`v0.14.0+`) | 9-circuit escrow wager, turn order, anti-replay, and in-circuit Merkle proof verification. |
| **Local ZK Prover** | Docker (`midnightnetwork/proof-server:latest`) | Local proof server listening on `http://127.0.0.1:6300`. |
| **Shared Engine** | Pure TypeScript (`/shared`) | Framework-agnostic 10×10 Battleship rules and fog-of-war AI (`14/14` Vitest unit tests). |
| **Realtime Sync** | Convex (`frontend/convex/`) | Serverless real-time match synchronization, lobbies, match history, and leaderboard. |
| **Chain & Wallet** | Midnight Network & Lace Wallet | Multi-network profiles (`preview`, `preprod`, `mainnet`) supporting DUST gas and NIGHT wagers. |

---

## ⚡ Quick Start

### 1. Start Midnight Proof Server (Docker)
```bash
docker run -d --name midnight-proof-server -p 6300:6300 midnightnetwork/proof-server:latest
```

### 2. Install Dependencies & Build Shared Engine
```bash
npm install
npm run build --workspace=shared
```

### 3. Deploy Convex Dev Functions & Launch Frontend
```bash
cd frontend && npx convex dev
# In another terminal from repo root:
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

For full setup and deployment instructions, see [**`SETUP.md`**](SETUP.md) and [**`MAINNET.md`**](MAINNET.md).

---

## 📜 Smart Contract Target Status

- **Contract Spec:** [`contracts/compact/battleship.compact`](contracts/compact/battleship.compact)
- **Active Default Environment:** Midnight Preview Testnet (`VITE_MIDNIGHT_NETWORK=preview`)
- **Contract Deployment Address:** Set via `VITE_MIDNIGHT_CONTRACT_ADDRESS` (or `VITE_MIDNIGHT_MAINNET_CONTRACT_ADDRESS`) once compiled with `compactc` and deployed. See [`MAINNET.md`](MAINNET.md) for current readiness.

---

## 📄 License

MIT © 2026 Battleship MN Team. Built for Midnight Network.
