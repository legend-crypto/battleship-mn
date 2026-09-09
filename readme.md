# ⚓ Battleship MN

**Decentralized Zero-Knowledge Naval Strategy & Token Staking Protocol on Midnight Network**

[![Midnight Network](https://img.shields.io/badge/Chain-Midnight_Network-blueviolet?style=for-the-badge)](https://preview.midnightexplorer.com)
[![Compact Language](https://img.shields.io/badge/Smart_Contract-Compact_v0.14-emerald?style=for-the-badge)](https://preview.midnightexplorer.com/contract/0x0d8e9c14664f3757558a5fa5e3304f5c3807f7a6)
[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel_Deployed-black?style=for-the-badge)](https://vercel.com)
[![Docker Proof Server](https://img.shields.io/badge/Docker-Proof_Server_6300-blue?style=for-the-badge)](SETUP.md)

A classic 10x10 Battleship strategy game reimagined with real-time multiplayer, a tactical ZK AI opponent, and privacy-preserving on-chain token wagers powered by Midnight Compact smart contracts (`BattleshipStaking.compact`).

---

## 📖 Quick Links

- [🚀 Quick Setup Guide (`SETUP.md`)](SETUP.md) — Step-by-step instructions for Docker Proof Server, node environment, & local running.
- [📜 Technical Whitepaper (`WHITEPAPER.md`)](WHITEPAPER.md) — Comprehensive protocol architecture, Merkle tree math, and Compact circuit specifications.
- [🌐 Midnight Block Explorer](https://preview.midnightexplorer.com) — View live testnet blocks, extrinsics, and transaction hashes.

---

## 🎮 Key Features

- **On-Chain Token Escrow Staking** — Players stake equal NIGHT wagers before a match. The winner claims 100% of the $2\times$ pooled pot directly from contract escrow upon verified victory.
- **Zero-Knowledge Board Commitments** — Fleet coordinates are hashed into a 100-cell Merkle tree root (`board_commitment`). Ship locations remain 100% private and invisible to block explorers and opponents.
- **ZK Hit/Miss Proof Resolution** — Shots fired generate client-side ZK inclusion/exclusion path proofs verifying outcomes without revealing un-targeted grid positions.
- **Local ZK AI Mode** — Play instantly offline against a tactical computer opponent using checkerboard parity opening searches and cardinal pursuit logic. No wallet or backend required.
- **Real-Time Multiplayer** — Match creation via 6-character match codes over WebSockets with automatic reconnect support.
- **Dispute Timeout & Emergency Safeguards** — Enforces a 60-second inactivity timeout (`claim_timeout_victory`) for AFK opponents, plus a 1-hour emergency refund window (`emergency_refund`).

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, TypeScript (Vite), Tailwind CSS | Tactical command console, Lace Wallet connector, interactive radar grids. |
| **ZK Smart Contracts** | Compact Language (`v0.14.0+`) | Contract-held escrow wagers, turn state transitions, and ZK Merkle proof verification. |
| **Local ZK Prover** | Docker (`midnightnetwork/proof-server:latest`) | Local Actix Web proof server listening on `http://localhost:6300`. |
| **Shared Engine** | Framework-agnostic TypeScript (`/shared`) | Core 10x10 Battleship rules, Merkle tree constructor, and fog-of-war AI. |
| **Backend & Sync** | Node.js, Socket.io, Convex | Real-time match synchronization, lobby room management, and state persistence. |
| **Chain & Wallet** | Midnight Network, Lace Wallet Extension | Dual-Ledger architecture (Public NIGHT ledger + Private ZK State). |

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

### 3. Launch Development Server
```bash
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser with Lace Wallet extension connected.*

For complete developer instructions, see [**`SETUP.md`**](SETUP.md).

---

## 📜 Deployed Smart Contract Details

- **Contract Spec**: `BattleshipStaking.compact`
- **Configured Address**: `0x0d8e9c14664f3757558a5fa5e3304f5c3807f7a6`
- **Network**: Midnight Network (Preview Testnet)
- **RPC Endpoint**: `https://rpc.preview.midnight.network`
- **Explorer**: [https://preview.midnightexplorer.com](https://preview.midnightexplorer.com)

---

## 📄 License

MIT © 2026 Battleship MN Team. Built for Midnight Network.