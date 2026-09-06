export const MIDNIGHT_TESTNET = {
  id: 'midnight-testnet-preview',
  name: 'Midnight Testnet (Preview)',
  rpcUrl: import.meta.env.VITE_MIDNIGHT_TESTNET_RPC || 'https://rpc.preview.midnight.network',
  blockExplorer: import.meta.env.VITE_MIDNIGHT_EXPLORER_URL || 'https://preview.midnightexplorer.com',
  faucetUrl: import.meta.env.VITE_MIDNIGHT_FAUCET_URL || 'https://faucet.preview.midnight.network',
  contractAddress: import.meta.env.VITE_MIDNIGHT_CONTRACT_ADDRESS || '',
  nativeCurrency: {
    name: 'Testnet DUST',
    symbol: 'tDUST',
    decimals: 6,
  },
  tokenSymbol: 'NIGHT',
};

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
