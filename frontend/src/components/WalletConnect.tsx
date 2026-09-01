import React from 'react';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { LogOut, WalletCards, ShieldCheck } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, isConnecting, balance, connect, disconnect, error } = useMidnightWallet();

  if (isConnected && address) {
    const truncatedAddress = address.length > 12 
      ? `${address.substring(0, 7)}...${address.substring(address.length - 4)}` 
      : address;

    return (
      <div className="flex items-center gap-2 font-mono">
        <div className="flex items-center space-x-2 bg-[#0F172A]/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs backdrop-blur shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-200 font-semibold">{truncatedAddress}</span>
          <span className="text-emerald-400 font-bold ml-1">
            {balance.formatted} {balance.symbol}
          </span>
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
            LACE
          </div>
        </div>

        <button
          onClick={() => disconnect()}
          className="p-2 bg-[#0F172A] hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition border border-slate-700 cursor-pointer"
          title="Disconnect Lace Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        disabled={isConnecting}
        onClick={() => connect()}
        className="flex items-center space-x-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition border border-slate-700/80 shadow-md cursor-pointer group disabled:opacity-50"
      >
        <span>{isConnecting ? 'CONNECTING LACE...' : 'CONNECT LACE WALLET'}</span>
        <WalletCards className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
      </button>

      {error && (
        <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-mono">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
