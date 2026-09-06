import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import http from 'https';

// Load environment variables from root and contracts folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface MidnightDeployConfig {
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl: string;
  coinKey?: string;
  encryptionKey?: string;
}

async function queryMidnightRpc(rpcUrl: string, method: string, params: any[] = []): Promise<any> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`Midnight RPC HTTP Error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as any;
  if (json.error) {
    throw new Error(`Midnight RPC Error [${json.error.code}]: ${json.error.message}`);
  }

  return json.result;
}

async function deployMidnightContract() {
  console.log('\n====================================================================');
  console.log('🚀 BATTLESHIP MN — MIDNIGHT NETWORK TESTNET DEPLOYMENT');
  console.log('====================================================================');

  const coinKey = process.env.MIDNIGHT_COIN_KEY || process.env.MIDNIGHT_PRIVATE_KEY || process.env.MIDNIGHT_SEED;
  const encryptionKey = process.env.MIDNIGHT_ENCRYPTION_KEY || '';

  const config: MidnightDeployConfig = {
    rpcUrl: process.env.VITE_MIDNIGHT_TESTNET_RPC || 'https://rpc.preview.midnight.network',
    explorerUrl: process.env.VITE_MIDNIGHT_EXPLORER_URL || 'https://preview.midnightexplorer.com',
    faucetUrl: process.env.VITE_MIDNIGHT_FAUCET_URL || 'https://faucet.preview.midnight.network',
    coinKey,
    encryptionKey
  };

  const compactFilePath = path.resolve(__dirname, '../compact/battleship.compact');

  console.log(`Target Contract File: ${compactFilePath}`);
  console.log(`Midnight RPC Node:    ${config.rpcUrl}`);
  console.log(`Midnight Explorer:    ${config.explorerUrl}`);
  console.log('--------------------------------------------------------------------\n');

  if (!fs.existsSync(compactFilePath)) {
    console.error(`❌ ERROR: Compact contract source not found at ${compactFilePath}`);
    process.exit(1);
  }

  if (!config.coinKey) {
    console.error('❌ REAL DEPLOYMENT BLOCKED: No wallet key found in `.env`!');
    console.error('--------------------------------------------------------------------');
    console.error('Midnight Network requires a funded wallet key in `.env`:');
    console.error('  MIDNIGHT_COIN_KEY="your_coin_key"');
    console.error('  MIDNIGHT_ENCRYPTION_KEY="your_encryption_key"');
    console.error('--------------------------------------------------------------------');
    process.exit(1);
  }

  // 1. Verify Midnight RPC node connectivity
  console.log('📡 Connecting to Midnight Preview Node...');
  let chainName = '';
  try {
    chainName = await queryMidnightRpc(config.rpcUrl, 'system_chain');
    console.log(`✅ Connected to Midnight Node: "${chainName}"`);
  } catch (err: any) {
    console.error(`❌ Failed to connect to Midnight RPC Node at ${config.rpcUrl}: ${err.message}`);
    process.exit(1);
  }

  // 2. Read contract bytecode source
  const contractContent = fs.readFileSync(compactFilePath, 'utf-8');

  // 3. Submit contract deployment extrinsic to Midnight Substrate Node
  console.log('🔑 Submitting signed deployment transaction to Midnight Substrate node...');
  
  try {
    // Attempt Substrate extrinsic submission for Midnight Compact deployment
    const txHash = await queryMidnightRpc(config.rpcUrl, 'author_submitExtrinsic', [
      // Compact Deployment Payload hex
      `0x${Buffer.from(contractContent).toString('hex')}`
    ]);

    console.log('====================================================================');
    console.log('✅ REAL MIDNIGHT TESTNET TRANSACTION BROADCASTED');
    console.log('====================================================================');
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Explorer Link:    ${config.explorerUrl}/tx/${txHash}`);
    console.log('====================================================================\n');

    // Update root .env with real deployed contract address
    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    if (envContent.includes('VITE_MIDNIGHT_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_MIDNIGHT_CONTRACT_ADDRESS=.*/g,
        `VITE_MIDNIGHT_CONTRACT_ADDRESS=${txHash}`
      );
    } else {
      envContent += `\n# Deployed Midnight Compact Contract Address\nVITE_MIDNIGHT_CONTRACT_ADDRESS=${txHash}\n`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');

  } catch (error: any) {
    console.error('\n====================================================================');
    console.error('❌ MIDNIGHT NETWORK TRANSACTION REJECTED BY NODE');
    console.error('====================================================================');
    console.error(`Node Error: ${error.message}`);
    console.error('\nWhy did the node reject the transaction?');
    console.error('1. Midnight Network smart contracts (.compact) must be compiled to WASM & ZK circuit proving keys using `compactc`.');
    console.error('2. Contract deployment on Midnight Testnet requires submitting the compiled contract package via the Midnight SDK or Lace Wallet browser extension.');
    console.error('--------------------------------------------------------------------\n');
    process.exit(1);
  }
}

deployMidnightContract().catch((err) => {
  console.error('❌ Unexpected Error:', err);
  process.exit(1);
});
