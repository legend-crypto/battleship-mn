import React from 'react';
import { X, Trophy, Swords, ExternalLink, ShieldCheck, Flame, Coins } from 'lucide-react';
import { MIDNIGHT_TESTNET } from '../config/midnightWallet';

interface MatchHistoryModalProps {
  onClose: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({ onClose }) => {
  // Sample match history data on Midnight Preview Network
  const sampleMatches = [
    {
      id: '0xmn_match_849201',
      code: '#849201',
      mode: 'Staked Multiplayer',
      opponent: 'Commander Host (0x714A...4A2C)',
      result: 'VICTORY',
      stake: '0.5 NIGHT',
      potWon: '1.0 NIGHT',
      date: 'Today, 15:42',
      txHash: '0xmn_claim_1a05c751c4e'
    },
    {
      id: '0xmn_match_592810',
      code: '#592810',
      mode: 'Midnight ZK AI Battle',
      opponent: 'Midnight ZK Compute Node #MN-9021',
      result: 'VICTORY',
      stake: '0.1 NIGHT',
      potWon: '0.2 NIGHT',
      date: 'Today, 14:15',
      txHash: '0xmn_claim_1a05c71e815'
    },
    {
      id: '0xmn_match_301928',
      code: '#301928',
      mode: 'Staked Multiplayer',
      opponent: 'Admiral Bravo (0x8B91...91C3)',
      result: 'DEFEAT',
      stake: '1.0 NIGHT',
      potWon: '0 NIGHT',
      date: 'Yesterday, 18:30',
      txHash: '0xmn_tx_301928'
    }
  ];

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
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span>MATCH HISTORY LOG</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Verified naval battles on Midnight Network (Preview Network)
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {sampleMatches.map((match) => (
            <div
              key={match.id}
              className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase border ${
                      match.result === 'VICTORY'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-950/80 text-red-300 border-red-500/40'
                    }`}
                  >
                    {match.result}
                  </span>
                  <span className="font-bold text-white">{match.code}</span>
                  <span className="text-[10px] text-slate-500 font-sans">({match.date})</span>
                </div>
                <span className="font-bold text-emerald-400 text-xs">
                  {match.result === 'VICTORY' ? `+${match.potWon}` : `- ${match.stake}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Opponent: <strong className="text-slate-200">{match.opponent}</strong></span>
                <span>Mode: <strong className="text-slate-300">{match.mode}</strong></span>
              </div>

              <div className="pt-1 flex justify-between items-center border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-mono">Escrow: {match.stake} Wager</span>
                <a
                  href={`${MIDNIGHT_TESTNET.blockExplorer}/tx/${match.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 underline font-mono flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>Midnight Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
