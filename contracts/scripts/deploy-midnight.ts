import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import crypto from 'crypto';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import * as bip39 from 'bip39';
import type {
  Ledger9UnboundTransaction,
  MidnightProviders,
} from '@midnight-ntwrk/midnight-js-types';
import type { DefaultConfiguration, FacadeState, ResolvedConfiguration } from '@midnight-ntwrk/wallet-sdk-facade';
import type {
  Contract as CompiledBattleshipContract,
  Witnesses,
} from '../managed/battleship/contract/index.js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface NetworkEndpoints {
  key: 'preview' | 'preprod' | 'mainnet' | 'undeployed';
  networkId: string;
  rpcUrl: string;
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
  explorerUrl?: string;
  faucetUrl?: string;
  contractEnvKey: string;
}

interface BattleshipPrivateState {
  secretKey: Uint8Array;
}

const importEsm = new Function('specifier', 'return import(specifier)') as <T = any>(
  specifier: string
) => Promise<T>;

function toWebSocketUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) return `wss://${httpUrl.slice('https://'.length)}`;
  if (httpUrl.startsWith('http://')) return `ws://${httpUrl.slice('http://'.length)}`;
  return httpUrl;
}

function defaultIndexerWsUrl(httpUrl: string, override?: string): string {
  if (override && override.trim()) return override.trim();
  const wsBase = toWebSocketUrl(httpUrl.replace(/\/+$/, ''));
  return wsBase.endsWith('/ws') ? wsBase : `${wsBase}/ws`;
}

function parseArgs(): { network: string; checkOnly: boolean } {
  const args = process.argv.slice(2);
  let network =
    process.env.MIDNIGHT_NETWORK ||
    process.env.VITE_MIDNIGHT_NETWORK ||
    'preview';
  let checkOnly = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--check' || arg === '--balance-only') {
      checkOnly = true;
    } else if (arg === '--network' && args[i + 1]) {
      network = args[++i];
    } else if (arg.startsWith('--network=')) {
      network = arg.slice('--network='.length);
    }
  }

  return { network: network.toLowerCase(), checkOnly };
}

function resolveNetworkEndpoints(networkKey: string): NetworkEndpoints {
  const proofServerUrl =
    process.env.PROOF_SERVER_URL ||
    process.env.VITE_MIDNIGHT_PROOF_SERVER_URL ||
    'http://127.0.0.1:6300';

  if (networkKey === 'mainnet') {
    const rpcUrl = process.env.VITE_MIDNIGHT_MAINNET_RPC || '';
    const indexerUrl = process.env.VITE_MIDNIGHT_MAINNET_INDEXER_URL || '';
    return {
      key: 'mainnet',
      networkId: 'mainnet',
      rpcUrl,
      indexerUrl,
      indexerWsUrl: defaultIndexerWsUrl(indexerUrl, process.env.VITE_MIDNIGHT_MAINNET_INDEXER_WS_URL),
      proofServerUrl,
      explorerUrl: 'https://midnightexplorer.com',
      contractEnvKey: 'VITE_MIDNIGHT_MAINNET_CONTRACT_ADDRESS',
    };
  }

  if (networkKey === 'preprod') {
    const rpcUrl = process.env.VITE_MIDNIGHT_PREPROD_RPC || '';
    const indexerUrl = process.env.VITE_MIDNIGHT_PREPROD_INDEXER_URL || '';
    return {
      key: 'preprod',
      networkId: 'preprod',
      rpcUrl,
      indexerUrl,
      indexerWsUrl: defaultIndexerWsUrl(indexerUrl, process.env.VITE_MIDNIGHT_PREPROD_INDEXER_WS_URL),
      proofServerUrl,
      explorerUrl: 'https://preprod.midnightexplorer.com',
      contractEnvKey: 'VITE_MIDNIGHT_PREPROD_CONTRACT_ADDRESS',
    };
  }

  if (networkKey === 'undeployed' || networkKey === 'local') {
    const rpcUrl = process.env.MIDNIGHT_LOCAL_RPC || 'http://127.0.0.1:9944';
    const indexerUrl = process.env.MIDNIGHT_LOCAL_INDEXER_URL || 'http://127.0.0.1:8088/api/v3/graphql';
    return {
      key: 'undeployed',
      networkId: 'undeployed',
      rpcUrl,
      indexerUrl,
      indexerWsUrl: defaultIndexerWsUrl(indexerUrl, process.env.MIDNIGHT_LOCAL_INDEXER_WS_URL),
      proofServerUrl,
      contractEnvKey: 'VITE_MIDNIGHT_CONTRACT_ADDRESS',
    };
  }

  const rpcUrl = process.env.VITE_MIDNIGHT_TESTNET_RPC || 'https://rpc.preview.midnight.network';
  const indexerUrl =
    process.env.VITE_MIDNIGHT_INDEXER_URL ||
    'https://indexer.preview.midnight.network/api/v4/graphql';
  return {
    key: 'preview',
    networkId: 'preview',
    rpcUrl,
    indexerUrl,
    indexerWsUrl: defaultIndexerWsUrl(indexerUrl, process.env.VITE_MIDNIGHT_INDEXER_WS_URL),
    proofServerUrl,
    explorerUrl: process.env.VITE_MIDNIGHT_EXPLORER_URL || 'https://preview.midnightexplorer.com',
    faucetUrl: process.env.VITE_MIDNIGHT_FAUCET_URL || 'https://faucet.preview.midnight.network',
    contractEnvKey: 'VITE_MIDNIGHT_CONTRACT_ADDRESS',
  };
}

function fetchText(url: string, timeoutMs = 3000): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += String(chunk);
      });
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        resolve({ ok: status >= 200 && status < 300, status, body: body.trim() });
      });
    });
    req.on('error', () => resolve({ ok: false, status: 0, body: '' }));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ ok: false, status: 0, body: '' });
    });
  });
}

function parseHexSeed(raw: string, varName: string): Uint8Array {
  const cleaned = raw.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]+$/.test(cleaned) || (cleaned.length !== 64 && cleaned.length !== 128)) {
    throw new Error(
      `${varName} must be a 32-byte (64 hex chars) or 64-byte (128 hex chars) hexadecimal seed.`
    );
  }
  return Uint8Array.from(Buffer.from(cleaned, 'hex'));
}

function resolveMasterSeed(): { masterSeed: Uint8Array; sourceLabel: string; isHexKeyFallback: boolean } {
  const mnemonic = process.env.MIDNIGHT_MNEMONIC?.trim();
  if (mnemonic) {
    const normalized = mnemonic.split(/\s+/).join(' ');
    if (!bip39.validateMnemonic(normalized)) {
      throw new Error('MIDNIGHT_MNEMONIC is not a valid BIP-39 mnemonic phrase.');
    }
    const seed = bip39.mnemonicToSeedSync(normalized);
    return {
      masterSeed: Uint8Array.from(seed),
      sourceLabel: 'MIDNIGHT_MNEMONIC (BIP-39 -> 64-byte seed)',
      isHexKeyFallback: false,
    };
  }

  const seedHex = process.env.MIDNIGHT_SEED?.trim();
  if (seedHex) {
    const seed = parseHexSeed(seedHex, 'MIDNIGHT_SEED');
    return {
      masterSeed: seed,
      sourceLabel: `MIDNIGHT_SEED (${seed.length}-byte hex seed)`,
      isHexKeyFallback: false,
    };
  }

  const coinKeyHex = process.env.MIDNIGHT_COIN_KEY?.trim();
  if (coinKeyHex) {
    const seed = parseHexSeed(coinKeyHex, 'MIDNIGHT_COIN_KEY');
    return {
      masterSeed: seed,
      sourceLabel: `MIDNIGHT_COIN_KEY (${seed.length}-byte hex seed fallback)`,
      isHexKeyFallback: true,
    };
  }

  throw new Error(
    'No Midnight wallet credential found in .env. Set MIDNIGHT_MNEMONIC (24-word Lace phrase) or MIDNIGHT_SEED.'
  );
}

function upsertEnvVar(envPath: string, key: string, value: string): void {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  const updated = pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`;
  fs.writeFileSync(envPath, updated, 'utf8');
}

function formatBalances(balances: Record<string, bigint>): string {
  const entries = Object.entries(balances);
  if (entries.length === 0) return '0';
  return entries
    .map(([tokenType, amount]) => {
      const label = /^0+$/.test(tokenType) ? 'NIGHT (raw units)' : tokenType.slice(0, 12) + '…';
      return `${amount.toString()} ${label}`;
    })
    .join(', ');
}

async function main() {
  const { network, checkOnly } = parseArgs();
  const endpoints = resolveNetworkEndpoints(network);

  console.log('======================================================================');
  console.log(`MIDNIGHT HEADLESS WALLET & CONTRACT DEPLOYER (${endpoints.key.toUpperCase()})`);
  console.log('======================================================================');
  console.log(`Network ID     : ${endpoints.networkId}`);
  console.log(`Node RPC       : ${endpoints.rpcUrl || '(not configured)'}`);
  console.log(`Indexer HTTP   : ${endpoints.indexerUrl || '(not configured)'}`);
  console.log(`Indexer WS     : ${endpoints.indexerWsUrl || '(not configured)'}`);
  console.log(`Proof Server   : ${endpoints.proofServerUrl}`);

  if (!endpoints.rpcUrl || !endpoints.indexerUrl) {
    console.error(`\nMissing RPC/Indexer endpoints for network "${endpoints.key}".`);
    process.exit(1);
  }

  const zkAssetsDir = path.resolve(__dirname, '../managed/battleship');
  const compiledEntry = path.resolve(zkAssetsDir, 'contract/index.js');
  if (!fs.existsSync(compiledEntry)) {
    console.error(`\nCompiled Compact contract missing at ${compiledEntry}`);
    console.error('Run: npm run compile:compact --workspace=contracts');
    process.exit(1);
  }

  const { masterSeed, sourceLabel, isHexKeyFallback } = resolveMasterSeed();
  const account = Number.parseInt(process.env.MIDNIGHT_WALLET_ACCOUNT || '0', 10) || 0;
  const addressIndex = Number.parseInt(process.env.MIDNIGHT_WALLET_INDEX || '0', 10) || 0;
  console.log(`Credential Src : ${sourceLabel} (account=${account}, index=${addressIndex})`);
  if (isHexKeyFallback) {
    console.warn(
      'Notice         : Using 32-byte MIDNIGHT_COIN_KEY fallback. If your Lace wallet uses a 24-word mnemonic, set MIDNIGHT_MNEMONIC in .env to derive the exact same Lace HD addresses.'
    );
  }

  const [
    { WalletFacade, WalletEntrySchema, mergeWalletEntries },
    { WalletSeeds },
    { ShieldedWallet },
    { UnshieldedWallet, PublicKey, createKeystore },
    { DustWallet, CustomForkingDustWallet, dustVariantConfigurations, dustWalletProbes },
    dustV1,
    dustV2,
    { InMemoryTransactionHistoryStorage },
    { MidnightBech32m },
    { firstValueFrom },
    { setNetworkId },
    { deployContract },
    { indexerPublicDataProvider },
    { httpClientProofProvider },
    { NodeZkConfigProvider },
    { levelPrivateStateProvider },
    { createLedger9WalletProvider, createLedger9MidnightProvider },
    { CompiledContract },
    contractMod,
  ] = await Promise.all([
    importEsm<typeof import('@midnight-ntwrk/wallet-sdk-facade')>('@midnight-ntwrk/wallet-sdk-facade'),
    importEsm<typeof import('@midnight-ntwrk/wallet-sdk-hd')>('@midnight-ntwrk/wallet-sdk-hd'),
    importEsm<typeof import('@midnight-ntwrk/wallet-sdk-shielded')>('@midnight-ntwrk/wallet-sdk-shielded'),
    importEsm<typeof import('@midnight-ntwrk/wallet-sdk-unshielded-wallet')>('@midnight-ntwrk/wallet-sdk-unshielded-wallet'),
    importEsm<typeof import('@midnight-ntwrk/wallet-sdk-dust-wallet')>('@midnight-ntwrk/wallet-sdk-dust-wallet'),
    importEsm<any>('@midnight-ntwrk/wallet-sdk-dust-wallet/v1'),
    importEsm<any>('@midnight-ntwrk/wallet-sdk-dust-wallet/v2'),
    importEsm<typeof import('@midnight-ntwrk/wallet-sdk-abstractions')>('@midnight-ntwrk/wallet-sdk-abstractions'),
    importEsm<typeof import('@midnight-ntwrk/wallet-sdk-address-format')>('@midnight-ntwrk/wallet-sdk-address-format'),
    importEsm<typeof import('rxjs')>('rxjs'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-network-id')>('@midnight-ntwrk/midnight-js-network-id'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-contracts')>('@midnight-ntwrk/midnight-js-contracts'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-indexer-public-data-provider')>('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-http-client-proof-provider')>('@midnight-ntwrk/midnight-js-http-client-proof-provider'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-node-zk-config-provider')>('@midnight-ntwrk/midnight-js-node-zk-config-provider'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-level-private-state-provider')>('@midnight-ntwrk/midnight-js-level-private-state-provider'),
    importEsm<typeof import('@midnight-ntwrk/midnight-js-types')>('@midnight-ntwrk/midnight-js-types'),
    importEsm<typeof import('@midnight-ntwrk/compact-js')>('@midnight-ntwrk/compact-js'),
    importEsm<{ Contract: typeof CompiledBattleshipContract }>(pathToFileURL(compiledEntry).href),
  ]);

  setNetworkId(endpoints.networkId);

  const seeds = WalletSeeds.fromMasterSeed(masterSeed, { account, addressIndex });
  const keystore = createKeystore({ kind: 'schnorr', secret: seeds.unshielded }, endpoints.networkId);
  const txHistoryStorage = new InMemoryTransactionHistoryStorage(
    WalletEntrySchema,
    mergeWalletEntries
  );

  const walletConfig: DefaultConfiguration = {
    networkId: endpoints.networkId,
    indexerClientConnection: {
      indexerHttpUrl: endpoints.indexerUrl,
      indexerWsUrl: endpoints.indexerWsUrl,
    },
    txHistoryStorage,
    relayURL: new URL(toWebSocketUrl(endpoints.rpcUrl)),
    provingServerUrl: new URL(endpoints.proofServerUrl),
    skipLedgerV8DustHistory: true,
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
  };

  console.log('\nInitializing WalletFacade & syncing against Midnight Indexer...');
  console.log(`Derived Unshielded Addr (immediate): ${keystore.getBech32Address().toString()}`);
  const facade = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg: ResolvedConfiguration) => ShieldedWallet(cfg as any).startWithSeed(seeds.shielded),
    unshielded: (cfg: ResolvedConfiguration) =>
      UnshieldedWallet(cfg as any).startWithPublicKey(PublicKey.fromKeyStore(keystore)),
    dust: (cfg: ResolvedConfiguration) => {
      if (typeof dustV2?.makeEventLessSyncService === 'function') {
        const { v1, v2, migration } = dustVariantConfigurations(cfg as any);
        const withProbes = { ...(cfg as any), ...dustWalletProbes(cfg as any) };
        return CustomForkingDustWallet(
          withProbes,
          { builder: new dustV1.V1Builder().withDefaults(), configuration: v1 },
          {
            builder: new dustV2.V2Builder()
              .withDefaults()
              .withSync(dustV2.makeEventLessSyncService, dustV2.makeEventLessSyncCapability)
              .withMigration(migration),
            configuration: v2,
          }
        ).startWithSeed(seeds.dust);
      }
      return DustWallet(cfg as any).startWithSeed(seeds.dust);
    },
  });

  let publicDataProvider: ReturnType<typeof indexerPublicDataProvider> | null = null;
  try {
    await facade.start(seeds);

    const initialState = await firstValueFrom(facade.state());
    console.log(
      `Derived Shielded Addr   (immediate): ${MidnightBech32m.encode(endpoints.networkId, initialState.shielded.address).toString()}`
    );
    console.log(
      `Derived Dust Addr       (immediate): ${MidnightBech32m.encode(endpoints.networkId, initialState.dust.address).toString()}`
    );

    let lastLog = 0;
    const progressSub = facade.state().subscribe((s: FacadeState) => {
      const now = Date.now();
      if (now - lastLog < 5000) return;
      lastLog = now;
      const sp = s.shielded.progress;
      const up = s.unshielded.progress;
      const dp = s.dust.progress;
      console.log(
        `Syncing... epoch=${s.activeProtocolVersion.toString()} | ` +
          `shielded=${sp.appliedIndex}/${sp.highestIndex} (conn=${sp.isConnected}, v=${s.shielded.protocolVersion}) | ` +
          `unshielded=${up.appliedId}/${up.highestTransactionId} (conn=${up.isConnected}, v=${s.unshielded.protocolVersion}) | ` +
          `dust=${dp.appliedIndex}/${dp.highestIndex} (conn=${dp.isConnected}, v=${s.dust.protocolVersion})`
      );
    });

    const [unshieldedEarly, shieldedEarly] = await Promise.all([
      facade.unshielded.waitForSyncedState(),
      facade.shielded.waitForSyncedState(),
    ]);
    console.log(
      `\nUnshielded & Shielded synced: NIGHT=${formatBalances(unshieldedEarly.balances)} (${unshieldedEarly.availableCoins.length} UTXOs), Shielded=${formatBalances(shieldedEarly.balances)}`
    );

    const synced = await facade.waitForSyncedState().finally(() => progressSub.unsubscribe());

    const unshieldedAddr = keystore.getBech32Address().toString();
    const shieldedAddr = MidnightBech32m.encode(endpoints.networkId, synced.shielded.address).toString();
    const dustAddr = MidnightBech32m.encode(endpoints.networkId, synced.dust.address).toString();
    const dustBalance = synced.dust.balance(new Date());
    const registeredCount = synced.unshielded.availableCoins.filter(
      (c: { meta: { registeredForDustGeneration: boolean } }) => c.meta.registeredForDustGeneration
    ).length;

    console.log('\n--- Derived Midnight Wallet Public State (No Secrets Exposed) ---');
    console.log(`Unshielded Addr : ${unshieldedAddr}`);
    console.log(`Shielded Addr   : ${shieldedAddr}`);
    console.log(`Dust Addr       : ${dustAddr}`);
    console.log(`Protocol Epoch  : ${synced.activeProtocolVersion.toString()}`);
    console.log(`Unshielded Bal  : ${formatBalances(synced.unshielded.balances)} (${synced.unshielded.availableCoins.length} UTXOs, ${registeredCount} registered for DUST)`);
    console.log(`Shielded Bal    : ${formatBalances(synced.shielded.balances)} (${synced.shielded.availableCoins.length} coins)`);
    console.log(`DUST Balance    : ${dustBalance.toString()} Specks (${synced.dust.availableCoins.length} dust UTXOs)`);

    if (checkOnly) {
      console.log('\nBalance check completed (--check / --balance-only).');
      return;
    }

    if (dustBalance <= 0n) {
      console.error('\nCannot deploy: derived wallet has 0 Specks of DUST on-chain for transaction fees.');
      if (endpoints.faucetUrl) {
        console.error(`Request testnet funds at ${endpoints.faucetUrl} for unshielded address:\n  ${unshieldedAddr}`);
      }
      if (isHexKeyFallback) {
        console.error(
          'Or set MIDNIGHT_MNEMONIC="<your 24-word Lace phrase>" in .env if your funded Lace wallet was created from a mnemonic.'
        );
      }
      process.exitCode = 1;
      return;
    }

    const [healthRes, versionRes] = await Promise.all([
      fetchText(`${endpoints.proofServerUrl}/health`),
      fetchText(`${endpoints.proofServerUrl}/version`),
    ]);
    const proofVersion = versionRes.body || 'unknown';
    console.log(`\nProof Server    : ${healthRes.ok ? 'ONLINE' : 'OFFLINE'} (version: ${proofVersion})`);
    if (!healthRes.ok) {
      console.error(`Proof server unreachable at ${endpoints.proofServerUrl}. Run: npm run setup:stack --workspace=contracts`);
      process.exitCode = 1;
      return;
    }
    if (!proofVersion.startsWith('9.')) {
      console.error(
        `Proof server version "${proofVersion}" does not match Midnight Ledger v9 (9.0.x).`
      );
      console.error('Upgrade container cleanly via: npm run setup:stack --workspace=contracts');
      process.exitCode = 1;
      return;
    }

    const zkConfigProvider = new NodeZkConfigProvider(zkAssetsDir);
    publicDataProvider = indexerPublicDataProvider(endpoints.indexerUrl, endpoints.indexerWsUrl);
    const proofProvider = httpClientProofProvider(endpoints.proofServerUrl, zkConfigProvider);

    const coinPublicKeyHex = synced.shielded.coinPublicKey.toHexString();
    const encryptionPublicKeyHex = synced.shielded.encryptionPublicKey.toHexString();
    const privateStatePassword =
      process.env.MIDNIGHT_PRIVATE_STATE_PASSWORD ||
      `Mn#${crypto.randomBytes(18).toString('hex')}A9!`;

    const walletProvider = createLedger9WalletProvider({
      balanceTx: async (tx: Ledger9UnboundTransaction) => {
        const unboundHandle = facade.adoptTransaction(tx.serialize(), 'Unbound');
        const recipe = await facade.balanceUnboundTransaction(unboundHandle, {
          ttl: new Date(Date.now() + 30 * 60 * 1000),
        });
        const signedRecipe = await facade.signRecipe(recipe, (data: Uint8Array) => keystore.signDataAsync(data));
        const finalizedHandle = await facade.finalizeRecipe(signedRecipe);
        return finalizedHandle.serialize();
      },
      getCoinPublicKey: () => coinPublicKeyHex,
      getEncryptionPublicKey: () => encryptionPublicKeyHex,
    });

    const midnightProvider = createLedger9MidnightProvider(async (tx: { serialize: () => Uint8Array }) => {
      const finalizedHandle = facade.adoptTransaction(tx.serialize(), 'Finalized');
      return await facade.submitTransaction(finalizedHandle);
    });

    const deployerSecretKey = crypto.randomBytes(32);
    const witnesses: Witnesses<BattleshipPrivateState> = {
      player_secret_key: (context) => {
        const sk =
          context.privateState?.secretKey instanceof Uint8Array &&
            context.privateState.secretKey.length === 32
            ? context.privateState.secretKey
            : deployerSecretKey;
        return [{ secretKey: sk }, sk];
      },
    };

    const compiledContract = CompiledContract.make('battleship', contractMod.Contract).pipe(
      CompiledContract.withWitnesses(witnesses),
      CompiledContract.withCompiledFileAssets(zkAssetsDir)
    );

    const providers: MidnightProviders<any, string, BattleshipPrivateState> = {
      privateStateProvider: levelPrivateStateProvider({
        midnightDbName: path.resolve(__dirname, '../.midnight-level-db'),
        privateStoragePasswordProvider: () => privateStatePassword,
        accountId: coinPublicKeyHex,
      }),
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
      config: {
        networkId: endpoints.networkId,
        ttlSeconds: 300,
      },
    };

    console.log('\nProving, balancing, and submitting Battleship Compact contract deployment...');
    const deployed = await deployContract(providers as any, {
      compiledContract,
      privateStateId: `battleship_cli_deploy_${endpoints.key}_v1`,
      initialPrivateState: { secretKey: deployerSecretKey },
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;
    const txId = deployed.deployTxData.public.txId;

    console.log('\n======================================================================');
    console.log('BATTLESHIP COMPACT CONTRACT DEPLOYED ON MIDNIGHT');
    console.log('======================================================================');
    console.log(`Contract Address : ${contractAddress}`);
    console.log(`Transaction ID   : ${txId}`);
    if (endpoints.explorerUrl) {
      console.log(`Explorer         : ${endpoints.explorerUrl}`);
    }

    const rootEnvPath = path.resolve(__dirname, '../../.env');
    upsertEnvVar(rootEnvPath, endpoints.contractEnvKey, contractAddress);
    console.log(`Updated .env     : ${endpoints.contractEnvKey}=${contractAddress}`);
  } finally {
    if (publicDataProvider) {
      await publicDataProvider.dispose().catch(() => undefined);
    }
    await facade.stop().catch(() => undefined);
  }
}

main().catch((err) => {
  console.error('\nMidnight deployment failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
