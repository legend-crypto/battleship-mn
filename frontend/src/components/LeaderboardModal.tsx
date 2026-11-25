import React from 'react';
import { X, Trophy } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ConvexErrorBoundary } from './ConvexErrorBoundary';

interface LeaderboardModalProps {
  onClose: () => void;
}

const LeaderboardList: React.FC = () => {
  const leaders = useQuery(api.matches.getLeaderboard);

  if (leaders === undefined) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 font-sans">
        Loading commander rankings from Convex...
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="p-6 bg-[#050B0E] border border-slate-800 rounded-2xl text-center text-xs text-slate-400 font-sans">
        No finished multiplayer matches recorded yet. Complete a match to rank on the leaderboard!
      </div>
    );
  }

  return (
    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
      {leaders.map((entry: any, idx: number) => {
        const shortAddr =
          entry.address.length > 14
            ? `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`
            : entry.address;

        return (
          <div
            key={entry.address}
            className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-3">
              <span
                className={`font-black text-sm ${
                  idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                #{idx + 1}
              </span>
              <div>
                <span className="font-bold text-slate-200 block">{shortAddr}</span>
                <span className="text-[10px] text-slate-500">
                  {entry.wins} Wins / {entry.matches} Matches • {entry.accuracy}% Accuracy
                </span>
              </div>
            </div>
            <span className="font-bold text-emerald-400">
              +{entry.totalNightWon.toFixed(2)} NIGHT
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
      <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl max-w-lg w-full text-left shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>COMMANDER LEADERBOARD</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-sans">
          Rankings computed from completed Convex matches on Midnight Network
        </p>

        <ConvexErrorBoundary
          fallback={
            <div className="p-4 bg-[#050B0E] border border-red-900/50 rounded-2xl text-xs text-red-300 font-sans">
              Convex backend unreachable. Deploy Convex functions to view live rankings.
            </div>
          }
        >
          <LeaderboardList />
        </ConvexErrorBoundary>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 uppercase cursor-pointer"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
