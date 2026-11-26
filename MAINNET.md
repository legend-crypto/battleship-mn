# Midnight Network Deployment & Mainnet Readiness Guide

> **Current Status:** **NOT ON MAINNET YET.**  
> **Active Default Target:** Midnight **Preview Testnet** (`VITE_MIDNIGHT_NETWORK=preview`)  
> **Staging Target:** Midnight **Preprod** (`VITE_MIDNIGHT_NETWORK=preprod`, Blockfrost RPC/Indexer)  
> **Production Target:** Midnight **Mainnet** (`VITE_MIDNIGHT_NETWORK=mainnet`, Blockfrost RPC/Indexer)

---

## 1. Network Architecture & Configuration

**Battleship MN** supports multi-environment switching via [`midnightWallet.ts`](frontend/src/config/midnightWallet.ts) and [`.env.example`](.env.example):

| Environment | `VITE_MIDNIGHT_NETWORK` | Token / Gas | RPC / Indexer Requirement | Explorer |
|---|---|---|---|---|
| **Preview Testnet** | `preview` (default) | `tNIGHT` / `tDUST` | Public preview endpoints (`rpc.preview.midnight.network`) | [preview.midnightexplorer.com](https://preview.midnightexplorer.com) |
| **Preprod Staging** | `preprod` | `tNIGHT` / `tDUST` | Dedicated **Blockfrost** Preprod Midnight endpoints + `VITE_BLOCKFROST_PROJECT_ID` | [preprod.midnightexplorer.com](https://preprod.midnightexplorer.com) |
| **Midnight Mainnet** | `mainnet` | `NIGHT` / `DUST` | Dedicated **Blockfrost** Mainnet endpoints + `VITE_BLOCKFROST_PROJECT_ID` | [midnightexplorer.com](https://midnightexplorer.com) |

---

## 2. Smart Contract Specification (`contracts/compact/battleship.compact`)

- **Language:** Midnight Compact (`pragma language_version >= 0.14.0`)
- **Dual-Ledger Escrow:** Uses `receiveUnshielded` and `sendUnshielded` for NIGHT wagers, with DUST handling transaction fees.
- **In-Circuit Cryptographic Verification:** `resolve_shot` executes `persistentHash` directly inside the ZK circuit (`hash_cell_leaf`, `verify_merkle_root`) across 7 unrolled Merkle levels so defenders cannot forge hits or misses.
- **Anti-Replay & Liveness Circuits:**
  - `create_game` / `cancel_waiting_game` — Host initializes escrow or cancels for full refund prior to P2 joining.
  - `join_game` — P2 matches wager and starts battle.
  - `fire_shot` — Tracks `(game_id, shooter, target_coord)` in `fired_shots` to prevent repeat-shot hit farming.
  - `resolve_shot` — Verifies cell leaf + 7-sibling Merkle proof against committed root.
  - `forfeit_game` — Voluntary surrender settles 2× pot to opponent immediately.
  - `claim_winner_payout` — Releases 2× escrow to winner with `is_payout_claimed` reentrancy guard.
  - `claim_timeout_victory` — Enforces 60-second AFK timeout via `blockTimeGreaterThan`.
  - `emergency_refund` — Enforces 1-hour stuck-match refund window.

---

## 3. Mandatory Gate Before Going Live on Mainnet

Do **not** switch `VITE_MIDNIGHT_NETWORK=mainnet` until every item below is complete:

1. **Compile `battleship.compact` with `compactc`:**
   - Start Docker Desktop and run `npm run setup:stack --workspace=contracts`.
   - Compile [`contracts/compact/battleship.compact`](contracts/compact/battleship.compact) to produce ZKIR artifacts, proving/verifying keys, and TypeScript `managed/` bindings.
2. **Bind Canonical Mainnet `NIGHT` Token Color:**
   - Replace the placeholder `escrow_token_color()` in [`contracts/compact/battleship.compact`](contracts/compact/battleship.compact) with Midnight's canonical native/unshielded NIGHT token color before compilation.
3. **Wire `@midnight-ntwrk/midnight-js-contracts`:**
   - Update [`deploy-midnight.ts`](contracts/scripts/deploy-midnight.ts) (`deployContract`) and [`compactContractService.ts`](frontend/src/services/compactContractService.ts) (`findDeployedContract` + `deployed.callTx.*`) using the generated `managed/` module and Lace DApp Connector balancing/submission.
4. **Provision Mainnet Blockfrost Endpoints:**
   - Configure `VITE_MIDNIGHT_MAINNET_RPC`, `VITE_MIDNIGHT_MAINNET_INDEXER_URL`, and `VITE_BLOCKFROST_PROJECT_ID` (keeping server/deployer keys out of client bundles).
5. **Deploy & Verify on Preprod First, Then Mainnet:**
   - Run full E2E staked match + timeout + forfeit + emergency refund verification on `preview`/`preprod` with funded `tNIGHT`/`tDUST` wallets before setting `VITE_MIDNIGHT_MAINNET_CONTRACT_ADDRESS`.
6. **Deploy Convex Production Schema & Rotate Keys:**
   - Deploy `frontend/convex/schema.ts` and `frontend/convex/matches.ts` to Convex production, and rotate any keys previously exposed in git history.

---

*© 2026 Battleship MN Team. Built for Midnight Network.*
