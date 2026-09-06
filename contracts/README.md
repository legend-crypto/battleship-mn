# Battleship MN — Midnight Compact Smart Contracts

This directory contains the Midnight Compact smart contract for **Battleship MN** located at [`contracts/compact/battleship.compact`](file:///c:/Users/Siddhu/Downloads/battleship%20midnight/battleship-0g/contracts/compact/battleship.compact).

---

## 🔒 Midnight Dual-Token Architecture

### DUST vs. NIGHT Token Model Audit Distinction

| Feature | **DUST Token (tDUST)** | **NIGHT Token (tNIGHT)** |
| :--- | :--- | :--- |
| **Token Type** | Non-transferable gas token | Transferable ledger utility token |
| **Generation** | Generated automatically by holding NIGHT | Native Midnight ledger currency |
| **Purpose** | Pays execution gas fees for zero-knowledge circuit transactions | Wagered into contract-held escrow for staked matches |
| **Transferability** | **Cannot** be transferred or wagered | **Fully transferable** between wallets & contracts |
| **Escrow Role** | **N/A** (Runtime gas charge only) | **Deposited into contract** ($1 \times \text{stake}$ host + $1 \times \text{stake}$ guest = $2 \times \text{pot}$) |

---

## ⚔️ Smart Contract Circuit Lifecycle

1. **`create_game`**: Host initializes a match and deposits `stake_amount_night` in **NIGHT** tokens into contract-held escrow. (Gas paid in DUST).
2. **`join_game`**: Guest joins the match and deposits an equal `stake_amount_night` in **NIGHT** tokens. Total escrow pot becomes $2 \times \text{stake\_amount\_night}$. (Gas paid in DUST).
3. **`fire_shot`**: Active player fires at coordinate (0..99). Updates `last_action_timestamp`. (Gas paid in DUST).
4. **`resolve_shot`**: Defending player submits client-side ZK Merkle inclusion/exclusion path proof. Contract verifies proof against defender's stored Merkle root. On 17 total hits, marks game `GAME_OVER` and declares winner. (Gas paid in DUST).
5. **`claim_winner_payout`**: Verified winner claims 100% of the $2 \times \text{stake}$ pot in **NIGHT** tokens from contract escrow. (Gas paid in DUST).

---

## ⏱️ Dispute Timeout & Emergency Refund Policies

- **60-Second Dispute Timeout (`claim_timeout_victory`)**:
  If a player goes offline mid-game and fails to fire or submit a ZK proof within **60 seconds** (`DISPUTE_TIMEOUT_SECONDS = 60`), the active player can invoke `claim_timeout_victory` to claim timeout victory and receive the $2 \times \text{stake}$ escrow pot.
- **1-Hour Emergency Refund (`emergency_refund`)**:
  If a match remains incomplete for over **1 hour** (`EMERGENCY_REFUND_TIMEOUT_SECONDS = 3600`), both players can invoke `emergency_refund` to reclaim their original deposited NIGHT stake back to their wallets.

---

## 💻 Developer Scripts

```bash
# Test Compact contract compilation & Local Proof Server test harness
npm run test --workspace=contracts

# Compile Compact contract
npm run compile:compact --workspace=contracts

# Run Local Proof Server simulation harness
npm run test:proof-server --workspace=contracts
```
