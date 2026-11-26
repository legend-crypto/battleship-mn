import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface NetworkEndpoints {
  networkId: string;
  rpcUrl: string;
  indexerUrl: string;
  explorerUrl: string;
}

function getTargetNetworkEndpoints(): NetworkEndpoints {
  const network = (process.env.VITE_MIDNIGHT_NETWORK || 'preview').toLowerCase();
  if (network === 'mainnet') {
    return {
      networkId: 'mainnet',
      rpcUrl: process.env.VITE_MIDNIGHT_MAINNET_RPC || '',
      indexerUrl: process.env.VITE_MIDNIGHT_MAINNET_INDEXER_URL || '',
      explorerUrl: 'https://midnightexplorer.com',
    };
  }
  if (network === 'preprod') {
    return {
      networkId: 'preprod',
      rpcUrl: process.env.VITE_MIDNIGHT_PREPROD_RPC || '',
      indexerUrl: process.env.VITE_MIDNIGHT_PREPROD_INDEXER_URL || '',
      explorerUrl: 'https://preprod.midnightexplorer.com',
    };
  }
  return {
    networkId: 'preview',
    rpcUrl: process.env.VITE_MIDNIGHT_TESTNET_RPC || 'https://rpc.preview.midnight.network',
    indexerUrl:
      process.env.VITE_MIDNIGHT_INDEXER_URL ||
      'https://indexer.preview.midnight.network/api/v4/graphql',
    explorerUrl: process.env.VITE_MIDNIGHT_EXPLORER_URL || 'https://preview.midnightexplorer.com',
  };
}

function toWebSocketUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) return `wss://${httpUrl.slice('https://'.length)}`;
  if (httpUrl.startsWith('http://')) return `ws://${httpUrl.slice('http://'.length)}`;
  return httpUrl;
}

async function deployMidnightContract() {
  const endpoints = getTargetNetworkEndpoints();
  const proofServerUrl = process.env.VITE_MIDNIGHT_PROOF_SERVER_URL || 'http://127.0.0.1:6300';
  const managedDir = path.resolve(__dirname, '../managed/battleship');
  const compiledEntry = path.join(managedDir, 'contract', 'index.js');

  console.log('\n====================================================================');
  console.log('🚀 BATTLESHIP MN — MIDNIGHT.JS v5 CONTRACT DEPLOYMENT CHECK');
  console.log('====================================================================');
  console.log(`Target Network:  ${endpoints.networkId}`);
  console.log(`RPC Endpoint:    ${endpoints.rpcUrl || '(NOT CONFIGURED)'}`);
  console.log(`Indexer GraphQL: ${endpoints.indexerUrl || '(NOT CONFIGURED)'}`);
  console.log(`Proof Server:    ${proofServerUrl}`);
  console.log(`Managed Assets:  ${managedDir}`);
  console.log('--------------------------------------------------------------------\n');

  if (!fs.existsSync(compiledEntry)) {
    console.error('❌ Compiled contract artifacts not found.');
    console.error('   Run: npm run compile:compact --workspace=contracts');
    process.exit(1);
  }

  if (!endpoints.rpcUrl || !endpoints.indexerUrl) {
    console.error(`❌ Endpoints missing for network "${endpoints.networkId}".`);
    console.error('   Configure Blockfrost RPC & Indexer URLs in `.env`.');
    process.exit(1);
  }

  // Verify local Proof Server is online
  try {
    const res = await fetch(`${proofServerUrl}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log('✅ Proof Server Online:', proofServerUrl);
  } catch (err: any) {
    console.error(`❌ Proof Server unreachable at ${proofServerUrl}: ${err?.message || err}`);
    console.error('   Start Docker Desktop and run: npm run setup:stack --workspace=contracts');
    process.exit(1);
  }

  // Verify Midnight Indexer GraphQL connectivity & protocol version
  setNetworkId(endpoints.networkId);
  const zkConfigProvider = new NodeZkConfigProvider(managedDir);
  const publicDataProvider = indexerPublicDataProvider(
    endpoints.indexerUrl,
    toWebSocketUrl(endpoints.indexerUrl)
  );
  const proofProvider = httpClientProofProvider(proofServerUrl, zkConfigProvider);
  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: () => `MnDeploy#${crypto.randomBytes(12).toString('hex')}!`,
    accountId: 'cli-deployer',
  });

  try {
    const protocolVersion = await publicDataProvider.queryLatestProtocolVersion();
    console.log(`✅ Indexer Online (Latest Protocol Version: ${protocolVersion})`);
  } catch (err: any) {
    console.error(`❌ Indexer GraphQL unreachable: ${err?.message || err}`);
  } finally {
    await publicDataProvider.dispose().catch(() => {});
  }

  console.log('\n✅ Midnight.js v5 Providers Initialized:', {
    hasZkConfig: !!zkConfigProvider,
    hasProofProvider: !!proofProvider,
    hasPrivateStateProvider: !!privateStateProvider,
  });

  const coinKey = process.env.MIDNIGHT_COIN_KEY || process.env.MIDNIGHT_SEED;
  if (!coinKey) {
    console.log('\nℹ️  No headless CLI wallet seed (`MIDNIGHT_COIN_KEY` / `MIDNIGHT_SEED`) configured.');
    console.log('   Recommended & zero-key-exposure deployment method:');
    console.log('   Call `CompactContractService.deployContractWithLace()` inside the web app');
    console.log('   with Lace Wallet connected & funded with DUST/NIGHT.');
    process.exit(1);
  }

  console.error(
    '\n❌ Headless Node deploy requires `@midnight-ntwrk/wallet-sdk-facade` seed wallet balancing.\n' +
      '   Use `CompactContractService.deployContractWithLace()` in the frontend or install `@midnight-ntwrk/wallet-sdk-facade`.'
  );
  process.exit(1);
}

deployMidnightContract().catch((err) => {
  console.error('❌ Deployment check error:', err);
  process.exit(1);
});
