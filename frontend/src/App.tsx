import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LocalAIGame } from './components/LocalAIGame';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerBattle } from './components/MultiplayerBattle';
import { WhitepaperPage } from './components/WhitepaperPage';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { X, ShieldCheck } from 'lucide-react';
import { BATTLESHIP_STAKING_ADDRESS } from './config/contract';

export type GameMode = 'LANDING' | 'LOCAL_AI' | 'MULTIPLAYER_LOBBY' | 'MULTIPLAYER_BATTLE' | 'WHITEPAPER';
export type NavTab = 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'WHITEPAPER' | 'ABOUT';

export const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('LANDING');
  const [activeTab, setActiveTab] = useState<NavTab>('PLAY');
  const [activeModal, setActiveModal] = useState<NavTab | null>(null);

  // Multiplayer session data
  const [multiplayerData, setMultiplayerData] = useState<any>(null);

  // Check URL pathname on initial load for /whitepaper
  useEffect(() => {
    if (window.location.pathname === '/whitepaper' || window.location.hash === '#whitepaper') {
      setMode('WHITEPAPER');
      setActiveTab('WHITEPAPER');
    }
  }, []);

  const handleGoHome = () => {
    setMode('LANDING');
    setActiveTab('PLAY');
    setActiveModal(null);
    if (window.location.pathname === '/whitepaper') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'PLAY') {
      handleGoHome();
    } else if (tab === 'WHITEPAPER') {
      setMode('WHITEPAPER');
      setActiveModal(null);
      window.history.pushState({}, '', '/whitepaper');
    } else {
      setActiveModal(tab);
    }
  };

  const handleStartLocalAI = () => {
    setMode('LOCAL_AI');
    setActiveTab('PLAY');
    setActiveModal(null);
  };

  const handleStartMultiplayer = () => {
    setMode('MULTIPLAYER_LOBBY');
    setActiveTab('PLAY');
    setActiveModal(null);
  };

  const handleMatchJoined = (matchData: any) => {
    setMultiplayerData(matchData);
    setMode('MULTIPLAYER_BATTLE');
  };

  const handleExitToLanding = () => {
    setMode('LANDING');
    setMultiplayerData(null);
    setActiveTab('PLAY');
    setActiveModal(null);
  };

  const isDarkConsoleMode = mode === 'LOCAL_AI' || mode === 'MULTIPLAYER_BATTLE' || mode === 'MULTIPLAYER_LOBBY' || mode === 'WHITEPAPER';

  // If in WHITEPAPER full page mode, render standalone WhitepaperPage
  if (mode === 'WHITEPAPER') {
    return <WhitepaperPage onBackToHome={handleGoHome} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkConsoleMode ? 'bg-[#050B0E] text-slate-100' : 'bg-[#F4F7F6] text-slate-900'
    }`}>
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onGoHome={handleGoHome}
        isDarkTheme={isDarkConsoleMode}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col items-center w-full">
        {mode === 'LANDING' && (
          <LandingPage
            onStartLocalAI={handleStartLocalAI}
            onStartMultiplayer={handleStartMultiplayer}
          />
        )}

        {mode === 'LOCAL_AI' && (
          <LocalAIGame onBackToMenu={handleExitToLanding} />
        )}

        {mode === 'MULTIPLAYER_LOBBY' && (
          <div className="w-full max-w-4xl px-4 py-8">
            <MultiplayerLobby
              onMatchReady={handleMatchJoined}
              onBackToMenu={handleExitToLanding}
            />
          </div>
        )}

        {mode === 'MULTIPLAYER_BATTLE' && multiplayerData && (
          <MultiplayerBattle
            matchData={multiplayerData}
            onExit={handleExitToLanding}
          />
        )}
      </main>

      {/* MATCHES HISTORY Modal */}
      {activeModal === 'MATCHES' && (
        <MatchHistoryModal
          onClose={() => setActiveModal(null)}
          onOpenLobby={() => {
            setActiveModal(null);
            setMode('MULTIPLAYER_LOBBY');
          }}
        />
      )}

      {/* LEADERBOARD Modal */}
      {activeModal === 'LEADERBOARD' && (
        <LeaderboardModal onClose={() => setActiveModal(null)} />
      )}

      {/* ABOUT / DOCS Modal */}
      {activeModal === 'ABOUT' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl max-w-lg w-full text-left shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ABOUT BATTLESHIP MN</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
              Decentralized zero-knowledge naval warfare built on Midnight Network. Wager tokens, battle in real-time with ZK-verified board commitments, and claim pooled stake escrow payouts.
            </p>

            <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300 font-sans">
              <div className="flex justify-between items-center">
                <span className="font-mono text-slate-500">Escrow Contract:</span>
                <span className="font-mono text-emerald-400 text-[10px] break-all">{BATTLESHIP_STAKING_ADDRESS}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-slate-500">Network:</span>
                <span className="font-mono text-slate-200">Midnight Network</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 uppercase cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
