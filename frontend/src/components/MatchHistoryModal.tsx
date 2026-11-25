import React from 'react';
import { X, Swords, ExternalLink, Clock, PlusCircle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MIDNIGHT_TESTNET } from '../config/midnightWallet';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { ConvexErrorBoundary } from './ConvexErrorBoundary';

interface MatchHistoryModalProps {
  onClose: () => void;
  onOpenLobby?: () => void;
}

const MatchesContent: React.FC<{ onOpenLobby?: () => void }> = ({ onOpenLobby }) => {
  const { address } = useMidnightWallet();
  const activeMatches = useQuery(api.matches.listActiveMatches);
  const finishedMatches = useQuery(api.matches.listMatchHistory, { address: address || undefined });

  const isLoading = activeMatches === undefined || finishedMatches === undefined;

  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 font-sans">
        Loading matches from Convex...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
      {/* Active Matches */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>ACTIVE LOBBIES & BATTLES ({activeMatches.length})</span>
          </span>
          {onOpenLobby && (
            <button
              onClick={onOpenLobby}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>LOBBY</span>
            </button>
          )}
        </div>

        {activeMatches.length === 0 ? (
          <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl text-center text-xs text-slate-500 font-sans">
            No active multiplayer matches on Convex right now.
          </div>
        ) : (
          activeMatches.map((m: any) => (
            <div
              key={m._id}
              className="p-3.5 bg-[#050B0E] border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-emerald-400 block">
                  MATCH #{m.matchCode || m.matchIdBytes32.slice(-6).toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400">
                  STAKE: {m.stakeAmountEth} NIGHT • {m.playerCount || 1}/2 PLAYERS
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                {m.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Finished Match History */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold text-slate-300 uppercase">
          COMPLETED MATCHES ({finishedMatches.length})
        </div>

        {finishedMatches.length === 0 ? (
          <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl text-center text-xs text-slate-500 font-sans">
            No completed matches recorded yet.
          </div>
        ) : (
          finishedMatches.map((match: any) => {
            const didWin = address && match.winnerAddress === address;
            const pot = (Number(match.stakeAmountEth) * 2).toFixed(2);
            const code = match.matchCode || match.matchIdBytes32.slice(-6).toUpperCase();
            const opponent =
              address && match.hostAddress === address
                ? match.guestAddress || 'Unknown'
                : match.hostAddress;

            return (
              <div
                key={match._id}
                className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase border ${
                        didWin
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      {address ? (didWin ? 'VICTORY' : 'DEFEAT') : 'FINISHED'}
                    </span>
                    <span className="font-bold text-white">#{code}</span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-400 text-xs">
                    {pot} NIGHT POT
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>
                    Opponent:{' '}
                    <strong className="text-slate-200">
                      {opponent.length > 14 ? `${opponent.slice(0, 6)}...${opponent.slice(-4)}` : opponent}
                    </strong>
                  </span>
                  <span>Stake: {match.stakeAmountEth} NIGHT</span>
                </div>

                {match.payoutTxHash && (
                  <div className="pt-1 flex justify-end items-center border-t border-slate-800/60">
                    <a
                      href={`${MIDNIGHT_TESTNET.blockExplorer}/tx/${match.payoutTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 underline font-mono flex items-center gap-1 hover:text-emerald-300"
                    >
                      <span>Midnight Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({ onClose, onOpenLobby }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
      <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl max-w-xl w-full text-left shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              MATCHES &amp; HISTORY
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Live Convex match registry &amp; completed Midnight battles
            </p>
          </div>
        </div>

        <ConvexErrorBoundary
          fallback={
            <div className="p-4 bg-[#050B0E] border border-red-900/50 rounded-2xl text-xs text-red-300 font-sans">
              Convex backend unreachable. Run <code className="font-mono">npx convex dev</code> inside{' '}
              <code className="font-mono">frontend/</code> to sync live matches.
            </div>
          }
        >
          <MatchesContent onOpenLobby={onOpenLobby} />
        </ConvexErrorBoundary>

        {onOpenLobby && (
          <button
            onClick={onOpenLobby}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition uppercase cursor-pointer"
          >
            CREATE OR JOIN MATCH
          </button>
        )}
      </div>
    </div>
  );
};
