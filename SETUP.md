# 🛠️ Battleship MN — Complete Setup & Developer Guide

This guide provides step-by-step instructions for setting up your local environment, running the **Midnight Proof Server in Docker**, configuring your environment variables, and launching **Battleship MN**.

---

## 📋 Prerequisites

Before getting started, make sure you have the following installed on your machine:

1. **Node.js**: `v18.0.0` or higher ([nodejs.org](https://nodejs.org))
2. **npm**: `v9.0.0` or higher (comes with Node.js)
3. **Docker Desktop**: Required to run the local Midnight Proof Server ([docker.com](https://www.docker.com))
4. **Lace Wallet Browser Extension**: Midnight Network compatible Web3 wallet extension installed in your Chrome/Brave browser ([lace.io](https://www.lace.io))

---

## 🐳 1. Set Up & Launch Midnight Proof Server (Docker)

Battleship MN generates zero-knowledge proofs locally using the official Midnight Proof Server container.

### Step 1.1: Pull and Run the Docker Container
Open your terminal and run the following command:

```bash
docker run -d \
  --name midnight-proof-server \
  -p 6300:6300 \
  midnightnetwork/proof-server:latest
```

### Step 1.2: Verify Container Health
Check that the proof server is running and listening on port `6300`:

```bash
docker ps
```

You should see an output similar to:
```text
CONTAINER ID   IMAGE                                 COMMAND                  STATUS         PORTS
4bf8e51cde1b   midnightnetwork/proof-server:latest   "/nix/store/..."         Up 5 minutes   0.0.0.0:6300->6300/tcp
```

Verify that the Actix HTTP web workers are initialized by viewing container logs:
```bash
docker logs --tail 20 midnight-proof-server
```
*Expected log:* `INFO actix_server::server: starting service: "actix-web-service-0.0.0.0:6300", workers: 14`

---

## 📦 2. Clone Repository & Install Dependencies

### Step 2.1: Clone Repository
```bash
git clone https://github.com/your-username/battleship-mn.git
cd battleship-mn
```

### Step 2.2: Install Monorepo Dependencies
Install node modules across all workspace packages (`shared`, `contracts`, `backend`, `frontend`):

```bash
npm install
```

### Step 2.3: Build Shared Game Engine
Build the core TypeScript game engine before launching the frontend:

```bash
npm run build --workspace=shared
```

---

## ⚙️ 3. Environment Variable Setup (`.env`)

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Ensure your `.env` contains the Midnight Preview Testnet settings:

```env
# Midnight Testnet Configuration
VITE_MIDNIGHT_TESTNET_RPC=https://rpc.preview.midnight.network
VITE_MIDNIGHT_EXPLORER_URL=https://preview.midnightexplorer.com
VITE_MIDNIGHT_FAUCET_URL=https://faucet.preview.midnight.network

# Deployed Midnight Compact Contract Address
VITE_MIDNIGHT_CONTRACT_ADDRESS=0x0d8e9c14664f3757558a5fa5e3304f5c3807f7a6

# Convex Backend Realtime Sync
VITE_CONVEX_URL=https://fine-rooster-248.convex.cloud

# Optional Wallet Deployment Keys
MIDNIGHT_COIN_KEY="0c962161fd8aaedee1fdf223c1c84763a094a112bed378d46b4f2be028ced8f8"
MIDNIGHT_ENCRYPTION_KEY="ee6a7e258b5b7a4986b19d1dedd422ee8fe5ee3b5ebf44e986ac7c6bac14ea5d"
```

---

## 🚀 4. Running the Project Locally

### Mode A: Launch Frontend (Single-Player ZK AI & Staking UI)
To start the React command console on `http://localhost:5173`:

```bash
npm run dev
```

### Mode B: Launch Full Stack (Backend + Frontend)
To run both the Socket.io real-time multiplayer backend and Vite frontend concurrently:

```bash
npm run dev:all
```

---

## 📜 5. Testing & Compiling Smart Contracts (`/contracts`)

The Compact smart contract source file is located at:
`contracts/compact/battleship.compact`

### Run Engine & Smart Contract Unit Tests
Execute the Vitest suite covering board placement, Merkle proofs, and game state transitions:

```bash
npm run test --workspace=shared
```

---

## 🛠️ 6. Troubleshooting Guide

### Issue 1: `Lace Wallet Required` or Signature Prompt Error
- **Cause**: Lace Wallet browser extension is locked or not connected.
- **Fix**: Open your Lace Wallet browser extension, connect to **Midnight Preview Testnet**, and approve the connection request when clicking **DEPOSIT NIGHT STAKE**.

### Issue 2: `Proof Server Error` or Port 6300 Unreachable
- **Cause**: Docker container `midnight-proof-server` is stopped or port 6300 is blocked.
- **Fix**: Restart the container:
  ```bash
  docker restart midnight-proof-server
  ```

### Issue 3: TypeScript Import Error on `@battleship/shared`
- **Cause**: The shared package hasn't built its TypeScript declaration outputs.
- **Fix**: Run `npm run build --workspace=shared` in the project root.

---

## 🌐 7. Vercel Production Deployment

To build for production or deploy on Vercel:

```bash
npm run build --workspace=shared
npm run build --workspace=frontend
```

Configuration is handled automatically via `vercel.json`. For full deployment details, see [`readme.md`](readme.md).
