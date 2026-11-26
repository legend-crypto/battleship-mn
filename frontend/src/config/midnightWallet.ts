export type MidnightNetworkKey = 'preview' | 'preprod' | 'mainnet';

export interface MidnightNetworkProfile {
  key: MidnightNetworkKey;
  id: string;
  name: string;
  shortLabel: string;
  rpcUrl: string;
  indexerUrl: string;
  blockExplorer: string;
  faucetUrl?: string;
  contractAddress: string;
  requiresBlockfrost: boolean;
  isProduction: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  tokenSymbol: 'NIGHT';
}

const SELECTED_NETWORK_KEY = (
  import.meta.env.VITE_MIDNIGHT_NETWORK || 'preview'
).toLowerCase() as MidnightNetworkKey;

export const MIDNIGHT_NETWORKS: Record<MidnightNetworkKey, MidnightNetworkProfile> = {
  preview: {
    key: 'preview',
    id: 'preview',
    name: 'Midnight Preview Testnet',
    shortLabel: 'PREVIEW TESTNET',
    rpcUrl: import.meta.env.VITE_MIDNIGHT_TESTNET_RPC || 'https://rpc.preview.midnight.network',
    indexerUrl:
      import.meta.env.VITE_MIDNIGHT_INDEXER_URL ||
      'https://indexer.preview.midnight.network/api/v4/graphql',
    blockExplorer: import.meta.env.VITE_MIDNIGHT_EXPLORER_URL || 'https://preview.midnightexplorer.com',
    faucetUrl: import.meta.env.VITE_MIDNIGHT_FAUCET_URL || 'https://faucet.preview.midnight.network',
    contractAddress: import.meta.env.VITE_MIDNIGHT_CONTRACT_ADDRESS || '',
    requiresBlockfrost: false,
    isProduction: false,
    nativeCurrency: { name: 'Testnet DUST', symbol: 'tDUST', decimals: 6 },
    tokenSymbol: 'NIGHT',
  },
  preprod: {
    key: 'preprod',
    id: 'preprod',
    name: 'Midnight Preprod Staging',
    shortLabel: 'PREPROD STAGING',
    rpcUrl: import.meta.env.VITE_MIDNIGHT_PREPROD_RPC || '',
    indexerUrl: import.meta.env.VITE_MIDNIGHT_PREPROD_INDEXER_URL || '',
    blockExplorer: 'https://preprod.midnightexplorer.com',
    contractAddress: import.meta.env.VITE_MIDNIGHT_PREPROD_CONTRACT_ADDRESS || import.meta.env.VITE_MIDNIGHT_CONTRACT_ADDRESS || '',
    requiresBlockfrost: true,
    isProduction: false,
    nativeCurrency: { name: 'Preprod DUST', symbol: 'tDUST', decimals: 6 },
    tokenSymbol: 'NIGHT',
  },
  mainnet: {
    key: 'mainnet',
    id: 'mainnet',
    name: 'Midnight Mainnet',
    shortLabel: 'MAINNET',
    rpcUrl: import.meta.env.VITE_MIDNIGHT_MAINNET_RPC || '',
    indexerUrl: import.meta.env.VITE_MIDNIGHT_MAINNET_INDEXER_URL || '',
    blockExplorer: 'https://midnightexplorer.com',
    contractAddress: import.meta.env.VITE_MIDNIGHT_MAINNET_CONTRACT_ADDRESS || import.meta.env.VITE_MIDNIGHT_CONTRACT_ADDRESS || '',
    requiresBlockfrost: true,
    isProduction: true,
    nativeCurrency: { name: 'Midnight DUST', symbol: 'DUST', decimals: 6 },
    tokenSymbol: 'NIGHT',
  },
};

export const ACTIVE_MIDNIGHT_NETWORK: MidnightNetworkProfile =
  MIDNIGHT_NETWORKS[SELECTED_NETWORK_KEY] || MIDNIGHT_NETWORKS.preview;

// Backward-compatible alias used across UI components
export const MIDNIGHT_TESTNET = ACTIVE_MIDNIGHT_NETWORK;

let cachedEnabledApi: any = null;

export const setEnabledLaceApi = (api: any) => {
  cachedEnabledApi = api;
};

// Detection helper for Midnight Lace wallet browser extension
export const isLaceWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  const win = window as any;
  return !!(
    win.midnight?.lace ||
    win.cardano?.lace ||
    win.midnight?.mnLace ||
    win.midnight ||
    win.cardano?.midnight
  );
};

// Get Lace connector API object
export const getLaceProvider = (): any => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  return (
    win.midnight?.lace ||
    win.cardano?.lace ||
    win.midnight?.mnLace ||
    win.midnight ||
    win.cardano?.midnight ||
    null
  );
};

// Helper to retrieve the active enabled Lace Wallet API instance
export const getEnabledLaceApi = async (): Promise<any> => {
  if (cachedEnabledApi) return cachedEnabledApi;
  const provider = getLaceProvider();
  if (!provider) return null;

  if (typeof provider.connect === 'function') {
    try {
      const api = await provider.connect(ACTIVE_MIDNIGHT_NETWORK.id);
      cachedEnabledApi = api;
      return api;
    } catch {
      return null;
    }
  }

  if (typeof provider.enable === 'function') {
    try {
      const api = await provider.enable();
      cachedEnabledApi = api;
      return api;
    } catch {
      return provider;
    }
  }

  return provider;
};
