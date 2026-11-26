import React from 'react';
import { ArrowLeft, ExternalLink, ShieldCheck, Cpu, Lock, FileText, Target, BookOpen } from 'lucide-react';
import { ACTIVE_MIDNIGHT_NETWORK } from '../config/midnightWallet';
import { BATTLESHIP_CONTRACT_ADDRESS, BATTLESHIP_STAKING_COMPACT_NAME } from '../config/contract';

interface WhitepaperPageProps {
  onBackToHome: () => void;
}

export const WhitepaperPage: React.FC<WhitepaperPageProps> = ({ onBackToHome }) => {
  return (
    <div className="w-full min-h-screen bg-[#050B0E] text-slate-200 font-mono flex flex-col justify-between">
      {/* Top Header Bar */}
      <div className="w-full bg-[#091015] border-b border-slate-800 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-bold transition cursor-pointer text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME</span>
        </button>

        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Battleship MN Logo" className="w-8 h-8 object-contain rounded-xl shadow-md" />
          <span className="text-xs font-black text-white tracking-widest hidden sm:inline-block">
            BATTLESHIP MN TECHNICAL WHITEPAPER
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
            V1.0 MIDNIGHT
          </span>
        </div>

        <a
          href={ACTIVE_MIDNIGHT_NETWORK.blockExplorer}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
        >
          <span className="hidden sm:inline">EXPLORER</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Page Container */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex-1 space-y-12">
        {/* Title Hero Card */}
        <div className="bg-[#091015] p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <span className="text-xs font-black tracking-[0.25em] text-emerald-400 uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              OFFICIAL PROTOCOL SPECIFICATION
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              BATTLESHIP MN WHITEPAPER
            </h1>

            <p className="text-slate-400 font-sans text-sm sm:text-base max-w-2xl leading-relaxed">
              Decentralized Zero-Knowledge Private-State Naval Strategy Engine on Midnight Network.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Author: <strong className="text-emerald-400">Battleship MN Team</strong>
              </span>
              <span className="bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Network: <strong className="text-emerald-400">{ACTIVE_MIDNIGHT_NETWORK.name}</strong>
              </span>
              <span className="bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Contract: <strong className="text-slate-200">{BATTLESHIP_STAKING_COMPACT_NAME}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-emerald-400 uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="w-5 h-5" />
            <span>EXECUTIVE SUMMARY</span>
          </h2>
          <div className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed space-y-3">
            <p>
              <strong>Battleship MN</strong> is a Web3-native tactical naval strategy game powered by <strong>Midnight Network</strong>. It combines a framework-agnostic 10x10 grid Battleship engine, Compact smart contracts for private-state commitments, zero-knowledge hit/miss resolution proofs, and on-chain escrow staking (<code className="text-emerald-400">{BATTLESHIP_STAKING_COMPACT_NAME}</code>).
            </p>
            <p>
              Players can engage in two distinct game modes:
            </p>
            <div className="grid md:grid-cols-2 gap-4 font-mono text-xs pt-2">
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-1">
                <strong className="text-white block text-sm">1. PRACTICE MODE (OFFLINE)</strong>
                <p className="text-slate-400 font-sans text-xs">
                  A wallet-free tactical environment for training and fleet placement mastery.
                </p>
              </div>
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-emerald-500/30 space-y-1">
                <strong className="text-emerald-400 block text-sm">2. STAKED AI & MULTIPLAYER</strong>
                <p className="text-slate-400 font-sans text-xs">
                  On-chain escrow staking on Midnight Network. Players claim 2x pooled stakes upon ZK-verified victory via Compact smart contract state transitions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Architecture */}
        <section className="space-y-6 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>1. MIDNIGHT DUAL-LEDGER ARCHITECTURE</span>
          </h2>

          <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <span className="text-slate-500 uppercase font-bold">System Flow Overview:</span>
            <pre className="text-emerald-400 text-[11px] leading-relaxed">
{`  [ Web3 Frontend (React + Midnight Wallet SDK) ]
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
  [ Public NIGHT Ledger ]    [ Private ZK State & Compact ]
   (Token Stakes & Escrow)   (Hidden Ships & Hit/Miss Proofs)
           │
           ▼
  [ Shared TS Core Engine ]`}
            </pre>
          </div>

          <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.1 SHARED ENGINE (/shared)</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Pure TypeScript Battleship engine with zero external dependencies. Enforces 10x10 coordinates, fleet composition (Carrier 5, Battleship 4, Cruiser 3, Submarine 3, Destroyer 2 = 17 total cells), and move processing.
              </p>
            </div>

            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.2 PRIVATE ZK STATE COMMITMENTS</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Hidden ship placements are committed to Midnight's private ZK state via Compact contracts. Player coordinates remain private until hit or revealed.
              </p>
            </div>

            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.3 COMPACT ESCROW CONTRACT (/contracts)</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Written in Midnight's Compact language. Holds token stakes on the public NIGHT ledger while evaluating private ZK proofs for payout distribution.
              </p>
            </div>

            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.4 WEB3 FRONTEND (/frontend)</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Vite + React + Tailwind + Midnight Wallet integration supporting Lace and injected Web3 browser wallets.
              </p>
            </div>
          </div>
        </section>

        {/* 2. AI Algorithm */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>2. TACTICAL AI ALGORITHM & FOG-OF-WAR AUDIT</span>
          </h2>
          <div className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed space-y-3">
            <p>
              The single-player Tactical AI (<code className="text-emerald-400">shared/src/ai.ts</code>) operates under strict fog-of-war scoping:
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">AUDITED DATA ACCESS SCOPING:</strong>
                <p className="text-slate-400 font-sans text-xs">
                  The AI targeting function receives strictly the tracking grid of prior HIT/MISS results and remaining vessel lengths. It has zero access to private player ship coordinates.
                </p>
              </div>
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">CHECKERBOARD PARITY SEARCH:</strong>
                <p className="text-slate-400 font-sans text-xs">
                  Evaluates coordinates matching optimal vessel length parity to eliminate redundant opening shots.
                </p>
              </div>
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">CARDINAL TARGET PURSUIT:</strong>
                <p className="text-slate-400 font-sans text-xs">
                  Upon scoring a hit, probes cardinal directions (N, S, E, W) to lock onto ship alignment until sunk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ZK Proof Resolution */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>3. ZERO-KNOWLEDGE HIT/MISS RESOLUTION</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
            <p>
              To ensure absolute privacy and prevent cheating, game moves generate zero-knowledge proofs verifying hit/miss accuracy against stored board commitments without revealing unshot ship locations:
            </p>
            <div className="p-4 bg-[#050B0E] rounded-2xl border border-emerald-500/40 font-mono text-xs space-y-2">
              <span className="text-emerald-400 font-bold block">Compact In-Circuit Merkle Verification:</span>
              <div className="p-3 bg-[#091015] rounded-xl border border-slate-800 text-slate-200 text-[11px] overflow-x-auto">
                resolve_shot(game_id, target_coord, is_hit, leaf, proof, current_timestamp) -&gt; Void
              </div>
            </div>
          </div>
        </section>

        {/* 4. Midnight Network Specs */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-xl">
          <h2 className="text-lg font-black text-emerald-400 uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5" />
            <span>4. MIDNIGHT NETWORK CONTRACT SPECIFICATIONS</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Escrow Contract:</span>
              <span className="text-white font-bold text-xs break-all">{BATTLESHIP_STAKING_COMPACT_NAME}</span>
            </div>
            <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Active Network:</span>
              <span className="text-emerald-400 font-bold">{ACTIVE_MIDNIGHT_NETWORK.name}</span>
            </div>
            <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Configured Address:</span>
              <span className="text-slate-200 font-bold break-all">
                {BATTLESHIP_CONTRACT_ADDRESS || 'Pending compactc deploy'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={
                BATTLESHIP_CONTRACT_ADDRESS
                  ? `${ACTIVE_MIDNIGHT_NETWORK.blockExplorer}/contract/${BATTLESHIP_CONTRACT_ADDRESS}`
                  : ACTIVE_MIDNIGHT_NETWORK.blockExplorer
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 underline hover:text-emerald-300"
            >
              <span>Open {ACTIVE_MIDNIGHT_NETWORK.shortLabel} Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="w-full bg-[#091015] border-t border-slate-800 py-6 px-6 md:px-12 font-mono text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Battleship MN Logo" className="w-6 h-6 object-contain" />
          <span>&copy; 2026 Battleship MN Team. Built for Midnight Network.</span>
        </div>

        <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition cursor-pointer"
        >
          RETURN TO HOME
        </button>
      </footer>
    </div>
  );
};
