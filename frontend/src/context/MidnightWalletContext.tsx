import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MIDNIGHT_TESTNET, getLaceProvider, setEnabledLaceApi } from '../config/midnightWallet';

interface MidnightWalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  networkName: string;
  balance: { formatted: string; symbol: string };
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const MidnightWalletContext = createContext<MidnightWalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  networkName: MIDNIGHT_TESTNET.name,
  balance: { formatted: '--', symbol: 'NIGHT' },
  connect: async () => {},
  disconnect: () => {},
  error: null,
});

export const MidnightWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(() => localStorage.getItem('midnight_connected_address'));
  const [isConnected, setIsConnected] = useState<boolean>(() => !!localStorage.getItem('midnight_connected_address'));
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balanceFormatted, setBalanceFormatted] = useState<string>('--');
  const [error, setError] = useState<string | null>(null);

  const syncBalanceFromApi = useCallback(async (api: any) => {
    try {
      if (typeof api?.state === 'function') {
        const walletState = await api.state();
        if (walletState?.balances && typeof walletState.balances === 'object') {
          const firstBal = Object.values(walletState.balances)[0];
          if (firstBal !== undefined) {
            setBalanceFormatted(String(firstBal));
            return;
          }
        }
      }
      if (typeof api?.getBalance === 'function') {
        const raw = await api.getBalance();
        if (raw !== undefined && raw !== null) {
          setBalanceFormatted(String(raw));
          return;
        }
      }
      setBalanceFormatted('--');
    } catch {
      setBalanceFormatted('--');
    }
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setBalanceFormatted('0.00');
      return;
    }
    const lace = getLaceProvider();
    if (lace && typeof lace.enable === 'function') {
      lace.enable().then((api: any) => {
        setEnabledLaceApi(api);
        syncBalanceFromApi(api);
      }).catch(() => {});
    }
  }, [isConnected, syncBalanceFromApi]);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const lace = getLaceProvider();
      if (!lace || (typeof lace.enable !== 'function' && typeof lace.connect !== 'function')) {
        setAddress(null);
        setIsConnected(false);
        localStorage.removeItem('midnight_connected_address');
        const errMsg = 'Lace Wallet extension not detected in browser. Please install Lace Wallet for Midnight Network.';
        setError(errMsg);
        throw new Error(errMsg);
      }

      const api = typeof lace.connect === 'function'
        ? await lace.connect(MIDNIGHT_TESTNET.id)
        : await lace.enable();
      setEnabledLaceApi(api);

      let userAddress: string | undefined;
      if (typeof api.state === 'function') {
        const st = await api.state();
        userAddress = st?.address;
      }
      if (!userAddress) {
        const unusedAddresses = await api.getUnusedAddresses?.();
        const usedAddresses = await api.getUsedAddresses?.();
        userAddress = (unusedAddresses && unusedAddresses[0]) || (usedAddresses && usedAddresses[0]);
      }

      if (!userAddress) {
        throw new Error('No wallet address returned by Lace Wallet extension.');
      }

      setAddress(userAddress);
      setIsConnected(true);
      localStorage.setItem('midnight_connected_address', userAddress);
      await syncBalanceFromApi(api);
    } catch (err: any) {
      console.error('Lace wallet connection error:', err);
      setError(err?.message || 'Failed to connect Lace Wallet');
      setAddress(null);
      setIsConnected(false);
      localStorage.removeItem('midnight_connected_address');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setBalanceFormatted('0.00');
    setError(null);
    localStorage.removeItem('midnight_connected_address');
  };

  return (
    <MidnightWalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        networkName: MIDNIGHT_TESTNET.name,
        balance: { formatted: balanceFormatted, symbol: 'NIGHT' },
        connect,
        disconnect,
        error,
      }}
    >
      {children}
    </MidnightWalletContext.Provider>
  );
};

export const useMidnightWallet = () => useContext(MidnightWalletContext);
