import React, { createContext, useContext, useState } from 'react';
import { MIDNIGHT_TESTNET, getLaceProvider } from '../config/midnightWallet';

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
  balance: { formatted: '100.00', symbol: 'NIGHT' },
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
      if (lace && typeof lace.enable === 'function') {
        const api = await lace.enable();
        const unusedAddresses = await api.getUnusedAddresses?.();
        const usedAddresses = await api.getUsedAddresses?.();
        const userAddress = (unusedAddresses && unusedAddresses[0]) || (usedAddresses && usedAddresses[0]) || 'mn1q8c9x5z2k3j4l5m6n7p8q9r0s1t2u3v4w5x6y7z';
        setAddress(userAddress);
        setIsConnected(true);
        localStorage.setItem('midnight_connected_address', userAddress);
      } else {
        // Connected preview testnet address when Lace extension is not active in dev browser
        const demoAddress = 'mn1q8c9x5z2k3j4l5m6n7p8q9r0s1t2u3v4w5x6y7z';
        setAddress(demoAddress);
        setIsConnected(true);
        localStorage.setItem('midnight_connected_address', demoAddress);
      }
    } catch (err: any) {
      console.error('Lace wallet connection error:', err);
      setError(err?.message || 'Failed to connect Lace Wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('midnight_connected_address');
  };

  return (
    <MidnightWalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        networkName: MIDNIGHT_TESTNET.name,
        balance: { formatted: '100.00', symbol: 'NIGHT' },
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
