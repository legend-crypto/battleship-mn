import React, { createContext, useContext, useState } from 'react';
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
  balance: { formatted: '0.00', symbol: 'NIGHT' },
  connect: async () => {},
  disconnect: () => {},
  error: null,
});

export const MidnightWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(() => localStorage.getItem('midnight_connected_address'));
  const [isConnected, setIsConnected] = useState<boolean>(() => !!localStorage.getItem('midnight_connected_address'));
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const lace = getLaceProvider();
      if (!lace || typeof lace.enable !== 'function') {
        setAddress(null);
        setIsConnected(false);
        localStorage.removeItem('midnight_connected_address');
        const errMsg = 'Lace Wallet extension not detected in browser. Please install Lace Wallet extension to connect to Midnight Network.';
        setError(errMsg);
        throw new Error(errMsg);
      }

      const api = await lace.enable();
      setEnabledLaceApi(api);
      const unusedAddresses = await api.getUnusedAddresses?.();
      const usedAddresses = await api.getUsedAddresses?.();
      const userAddress = (unusedAddresses && unusedAddresses[0]) || (usedAddresses && usedAddresses[0]);

      if (!userAddress) {
        throw new Error('No public wallet addresses returned by Lace Wallet extension.');
      }

      setAddress(userAddress);
      setIsConnected(true);
      localStorage.setItem('midnight_connected_address', userAddress);
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
        balance: { formatted: isConnected ? '100.00' : '0.00', symbol: 'NIGHT' },
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
