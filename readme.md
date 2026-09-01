# ⚓ Battleship MN

**Decentralized Zero-Knowledge Naval Warfare — Built on Midnight Network**

A classic 10x10 Battleship game reimagined with real-time multiplayer, a
tactical ZK AI opponent, and on-chain privacy-preserving staking. Players wager tokens before a
match, battle in real time with ZK-verified board commitments, and the winner claims the pooled stake
directly from a Compact smart contract.

---

## 🎮 Features

- **Local ZK AI Mode** — play instantly against a computer opponent, fully
  offline, no wallet required. The AI uses a checkerboard-parity opening
  search followed by adjacent-cell hunt/target logic once it lands a hit.
- **Real-Time Multiplayer** — create or join a match, place your fleet, and
  battle another player live over WebSockets with ZK hit/miss proof resolution. Reconnect support for
  page refreshes mid-match.
- **On-Chain Staking (Midnight Network)** — before a multiplayer match starts, both
  players stake an equal amount into a Compact escrow smart contract. The
  winner claims the pooled stake upon verified victory.
- **Live Combat Feed** — a real-time log of every shot, hit, and miss for
  both sides, plus running accuracy stats per player.
- **End-of-Match ZK Reveal** — opponent ship positions are revealed only once
  the match concludes, alongside the win/loss result and final accuracy.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite), Tailwind CSS |
| Multiplayer server | Node.js + TypeScript, Socket.io (real-time match sync) |
| Shared game engine | Framework-agnostic TypeScript (`/shared`) — used by both frontend AI mode and backend multiplayer authority |
| Wallet / chain integration | Midnight Wallet SDK (Lace wallet) |
| Smart contracts | Compact (Midnight ZK Smart Contracts) |
| Chain | Midnight Network (Dual-Ledger: Public NIGHT + Private ZK State) |

### Midnight Network details

| Network | Ledger Model | Explorer |
|---|---|---|
| **Midnight Network** | Dual-Ledger (Public NIGHT + Private ZK State) | [explorer.midnight.network](https://explorer.midnight.network) |

---

## 📁 Project Structure

```
battleship-mn/
├── frontend/          # React app — local ZK AI mode, multiplayer lobby, wallet UI
├── backend/           # Socket.io server — authoritative multiplayer match state
├── contracts/         # Compact staking contract + test suite
├── shared/            # Shared TypeScript game engine + types (board, ship, move, match)
│   ├── src/
│   │   ├── engine.ts  # Board/ship/move resolution logic
│   │   ├── ai.ts      # Local AI targeting logic (hunt/target strategy)
│   │   └── types.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- Midnight compatible wallet (e.g. Lace Wallet)

### Installation

```bash
git clone <your-repo-url>
cd battleship-mn
npm install
```

### Run locally

```bash
# Start the shared engine build
npm run build --workspace=shared

# Start the multiplayer backend
npm run dev --workspace=backend

# Start the frontend
npm run dev --workspace=frontend
```

Local AI mode works immediately with no backend or wallet connection.
Multiplayer mode requires the backend running; staking requires a wallet
connected to Midnight Network.

---

## 🎲 Game Modes

### Play vs ZK AI (local)
Fully client-side. Place your fleet (or auto-shuffle), then alternate turns
with the AI. No network calls, no wallet required.

### Multiplayer
1. Create or join a match via a match code.
2. Both players commit their fleets to ZK board hashes.
3. *(If staking)* both players stake equal tokens into the Compact contract escrow.
4. Turns alternate in real time with ZK-proof hit/miss resolution.
5. On game over, ship positions are revealed, the winner is shown
   alongside final accuracy for both sides, and the winner can claim the
   staked pool.

---

## 📜 Staking Contract

The `BattleshipStaking.compact` contract handles escrow staking and ZK state verification:

1. `createMatch(matchId, stakeAmount)` — proposer stakes into escrow.
2. `joinMatch(matchId)` — opponent matches the stake.
3. Winner is verified via ZK-SNARK hit/miss proof state transitions.
4. `claim(matchId, proof)` — winner withdraws the pooled stake.
5. Refund path for matches that never start or time out.

---

## 📄 License

MIT