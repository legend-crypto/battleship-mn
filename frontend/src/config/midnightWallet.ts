export const MIDNIGHT_TESTNET = {
  id: 'midnight-testnet-preview',
  name: 'Midnight Testnet (Preview)',
  rpcUrl: 'https://rpc.preview.preview.midnight.network',
  blockExplorer: 'https://preview.midnightexplorer.com',
  faucetUrl: 'https://faucet.preview.midnight.network',
  nativeCurrency: {
    name: 'Testnet DUST',
    symbol: 'tDUST',
    decimals: 6,
  },
  tokenSymbol: 'NIGHT',
};

// Detection helper for Midnight Lace wallet browser extension
export const isLaceWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  const win = window as any;
  return !!(win.midnight?.lace || win.cardano?.lace || win.midnight);
};

// Get Lace connector API object
export const getLaceProvider = (): any => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  return win.midnight?.lace || win.cardano?.lace || win.midnight || null;
};
