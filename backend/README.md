# Midnight Decentralized DApp Architecture

The centralized Node.js + Socket.io referee server and EIP-191 ECDSA attestation signing backend have been removed.

---

## 🛡️ Trustless Zero-Knowledge Architecture

In the Midnight Network model:
- **No Central Referee:** Game state integrity and fog-of-war compliance are enforced on-chain via **Compact smart contracts** and **private-state board commitments**.
- **ZK Hit/Miss Proofs:** Players generate zero-knowledge proofs (ZK-SNARKs) directly on their client device to verify shot outcomes against stored commitments without relying on a centralized referee server.
- **P2P State Synchronization:** Peer-to-peer DApp connections sync real-time moves while payouts are trustlessly unlocked via Compact state transitions.
