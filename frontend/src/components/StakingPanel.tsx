import React, { useState } from 'react';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { MIDNIGHT_TESTNET } from '../config/midnightWallet';
import { Coins, ExternalLink, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface StakingPanelProps {
  matchIdBytes32: string;
  stakeAmountEth: string;
  role: 'host' | 'guest';
  hasStaked: boolean;
  onStakeConfirmed: (txHash: string) => void;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({
  matchIdBytes32,
  stakeAmountEth,
  role,
  hasStaked,
  onStakeConfirmed
}) => {
  const { isConnected } = useMidnightWallet();

  const [txHash, setTxHash] = useState<string | undefined>();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDepositStake = async () => {
    setErrorMessage(null);
    setIsPending(true);

    try {
      // TODO: Compact contract call for BattleshipStaking.compact escrow deposit
      // Execution circuit: BattleshipStaking.compact -> create_match / join_match
      console.log(`[Compact Contract Call Placeholder] Staking ${stakeAmountEth} NIGHT for match ${matchIdBytes32} as ${role}`);

      // Simulate on-chain confirmation for preview
      setTimeout(() => {
        const mockTxHash = `0xmn_${Date.now().toString(16)}`;
        setTxHash(mockTxHash);
        setIsPending(false);
        onStakeConfirmed(mockTxHash);
      }, 1200);
    } catch (err: any) {
      console.error('Staking error:', err);
      setErrorMessage(err?.message || 'Deposit transaction failed');
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-2xl font-mono text-left space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>MIDNIGHT TOKEN ESCROW STAKE</span>
        </h3>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
          {MIDNIGHT_TESTNET.name}
        </span>
      </div>

      <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Required Match Stake:</span>
          <span className="text-emerald-400 font-bold text-sm">{stakeAmountEth} NIGHT</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Escrow Smart Contract:</span>
          <span className="text-slate-200 font-mono text-[10px]">BattleshipStaking.compact</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Target Network:</span>
          <span className="text-emerald-400 font-semibold">{MIDNIGHT_TESTNET.name}</span>
        </div>
      </div>

      {hasStaked ? (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Midnight Escrow Deposit Confirmed!</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-sans">
            Your stake is safely escrowed in the Compact smart contract on Midnight Network.
          </p>
          {txHash && (
            <a
              href={`${MIDNIGHT_TESTNET.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 underline font-mono flex items-center gap-1 mt-1"
            >
              <span>View Transaction on Midnight Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {!isConnected ? (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs rounded-xl text-center">
              Connect Lace Wallet in top header to deposit stake.
            </div>
          ) : (
            <button
              disabled={isPending}
              onClick={handleDepositStake}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>CONFIRMING ON MIDNIGHT...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>DEPOSIT {stakeAmountEth} NIGHT STAKE</span>
                </>
              )}
            </button>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-[11px] rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
