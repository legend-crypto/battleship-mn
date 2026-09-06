import React, { useState } from 'react';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { MIDNIGHT_TESTNET } from '../config/midnightWallet';
import { CompactContractService } from '../services/compactContractService';
import { Coins, ExternalLink, Lock, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Clock } from 'lucide-react';

interface StakingPanelProps {
  matchIdBytes32: string;
  stakeAmountEth: string;
  role: 'host' | 'guest';
  hasStaked: boolean;
  onStakeConfirmed: (txHash: string) => void;
  boardCommitment?: string;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({
  matchIdBytes32,
  stakeAmountEth,
  role,
  hasStaked,
  onStakeConfirmed,
  boardCommitment = '0xaaf66062a83c21ca947f63e67f90fe68526bc4ea1124eeb18812e7b63d9f8f83d'
}) => {
  const { isConnected, connect, isConnecting } = useMidnightWallet();

  const [txHash, setTxHash] = useState<string | undefined>();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDepositStake = async () => {
    setErrorMessage(null);

    if (!isConnected) {
      try {
        await connect();
      } catch (err: any) {
        setErrorMessage(err?.message || 'Please connect Lace Wallet extension first.');
        return;
      }
    }

    setIsPending(true);

    try {
      let hash = '';
      if (role === 'host') {
        hash = await CompactContractService.createGame(matchIdBytes32, boardCommitment, stakeAmountEth);
      } else {
        hash = await CompactContractService.joinGame(matchIdBytes32, boardCommitment);
      }

      setTxHash(hash);
      setIsPending(false);
      onStakeConfirmed(hash);
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
          <span>NIGHT TOKEN ESCROW STAKE</span>
        </h3>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
          {MIDNIGHT_TESTNET.name}
        </span>
      </div>

      <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Required Wager Stake:</span>
          <span className="text-emerald-400 font-bold text-sm">{stakeAmountEth} NIGHT</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>Execution Gas Fee:</span>
          <span className="text-slate-300 font-semibold">Auto-Paid in DUST</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>Escrow Smart Contract:</span>
          <span className="text-slate-200 font-mono text-[10px]">BattleshipStaking.compact</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>Inactivity Timeout:</span>
          <span className="text-amber-400 font-mono text-[10px]">60s Dispute / 1h Refund</span>
        </div>
      </div>

      {hasStaked ? (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>NIGHT Escrow Deposit Confirmed!</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-sans">
            Your {stakeAmountEth} NIGHT stake is safely held in contract escrow. Winner receives 2x total pot ({parseFloat(stakeAmountEth) * 2} NIGHT).
          </p>
          {txHash && (
            <a
              href={`${MIDNIGHT_TESTNET.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 underline font-mono flex items-center gap-1 mt-1"
            >
              <span>View Escrow Tx on Midnight Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <button
            disabled={isPending || isConnecting}
            onClick={handleDepositStake}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SIGNING TRANSACTION IN LACE WALLET...</span>
              </>
            ) : isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CONNECTING LACE WALLET...</span>
              </>
            ) : !isConnected ? (
              <>
                <Lock className="w-4 h-4" />
                <span>CONNECT WALLET & DEPOSIT {stakeAmountEth} NIGHT STAKE</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>DEPOSIT {stakeAmountEth} NIGHT STAKE</span>
              </>
            )}
          </button>

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
