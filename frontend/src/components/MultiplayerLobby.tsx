import React, { useState, useEffect } from 'react';
import { WalletConnect } from './WalletConnect';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { generateMatchIdBytes32 } from '../utils/merkle';
import { Swords, Plus, LogIn, Users, ArrowLeft, Coins, Lock } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ConvexErrorBoundary } from './ConvexErrorBoundary';

interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
  onMatchReady: (matchData: {
    matchId: string;
    matchCode: string;
    matchIdBytes32: string;
    stakeAmountEth: string;
    playerToken: string;
    playerId: string;
    role: 'host' | 'guest';
    player1Name: string;
    player2Name?: string;
  }) => void;
}

const RealtimeConvexLobbies: React.FC<{
  onJoinMatch: (code: string, matchIdBytes32: string, stakeAmountEth: string) => void;
}> = ({ onJoinMatch }) => {
  const convexLobbies = useQuery(api.matches.listOpenLobbies);

  if (convexLobbies === undefined) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs font-sans">
        Loading open lobbies from Convex...
      </div>
    );
  }

  return (
    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
      {convexLobbies.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-sans">
          No open lobbies right now. Create a new game on the left!
        </div>
      ) : (
        convexLobbies.map((m: any) => {
          const code = m.matchCode || m.matchIdBytes32.slice(-6).toUpperCase();
          const hostLabel =
            m.hostName ||
            (m.hostAddress ? `${m.hostAddress.slice(0, 6)}...${m.hostAddress.slice(-4)}` : 'Commander Host');
          const isFree = Number(m.stakeAmountEth) === 0;

          return (
            <div
              key={m._id}
              className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white block">{hostLabel}</span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    {m.playerCount || 1}/2 PLAYERS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isFree ? 'Free ZK Merkle Match' : `Stake: ${m.stakeAmountEth} NIGHT`} • #{code}
                </span>
              </div>

              <button
                onClick={() => onJoinMatch(code, m.matchIdBytes32, m.stakeAmountEth)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-lg transition shadow cursor-pointer flex items-center gap-1 uppercase"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>JOIN GAME</span>
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onBackToMenu, onMatchReady }) => {
  const { address, isConnected } = useMidnightWallet();

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('mn_player_name') || 'Captain Alpha');
  const [stakeAmountEth, setStakeAmountEth] = useState('0');
  const [joinCode, setJoinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLobbyMutation = useMutation(api.matches.createLobby);
  const joinLobbyMutation = useMutation(api.matches.joinLobby);

  useEffect(() => {
    localStorage.setItem('mn_player_name', playerName);
  }, [playerName]);

  const getEffectiveAddress = () => {
    if (address) return address;
    let guestId = localStorage.getItem('mn_ephemeral_player_id');
    if (!guestId) {
      guestId = `guest_${crypto.randomUUID().slice(0, 12)}`;
      localStorage.setItem('mn_ephemeral_player_id', guestId);
    }
    return guestId;
  };

  const handleCreateMatch = async () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain callsign first.');
      return;
    }

    const isStaked = Number(stakeAmountEth) > 0;
    if (isStaked && (!isConnected || !address)) {
      setErrorMsg('Please connect your Lace wallet in the header to create a Staked Match on Midnight Network.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const matchIdBytes32 = generateMatchIdBytes32();
      const matchCode = Math.floor(100000 + Math.random() * 900000).toString();
      const token = `host_${crypto.randomUUID()}`;
      const callerAddress = getEffectiveAddress();

      localStorage.setItem(`token_${matchIdBytes32}`, token);
      localStorage.setItem(`pid_${matchIdBytes32}`, 'host');

      await createLobbyMutation({
        matchIdBytes32,
        matchCode,
        stakeAmountEth,
        hostAddress: callerAddress,
        hostName: playerName.trim(),
        hostToken: token
      });

      onMatchReady({
        matchId: matchIdBytes32,
        matchCode,
        matchIdBytes32,
        stakeAmountEth,
        playerToken: token,
        playerId: 'host',
        role: 'host',
        player1Name: playerName.trim(),
        player2Name: 'Awaiting Opponent...'
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create match in Convex.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinMatch = async (codeToJoin?: string, matchIdParam?: string, expectedStake?: string) => {
    const code = (codeToJoin || joinCode).trim().toUpperCase();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain callsign first.');
      return;
    }
    if (!matchIdParam && !code) {
      setErrorMsg('Please enter a 6-digit match code.');
      return;
    }

    const isStaked = expectedStake !== undefined && Number(expectedStake) > 0;
    if (isStaked && (!isConnected || !address)) {
      setErrorMsg('Please connect your Lace wallet in the header to join a Staked Match.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const guestToken = `guest_${crypto.randomUUID()}`;
      const callerAddress = getEffectiveAddress();

      const joined = await joinLobbyMutation({
        matchIdBytes32: matchIdParam,
        matchCode: matchIdParam ? undefined : code,
        guestAddress: callerAddress,
        guestName: playerName.trim(),
        guestToken
      });

      if (Number(joined.stakeAmountEth) > 0 && (!isConnected || !address)) {
        setErrorMsg('This is a staked match. Please connect your Lace wallet first.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem(`token_${joined.matchIdBytes32}`, guestToken);
      localStorage.setItem(`pid_${joined.matchIdBytes32}`, 'guest');

      onMatchReady({
        matchId: joined.matchIdBytes32,
        matchCode: joined.matchCode,
        matchIdBytes32: joined.matchIdBytes32,
        stakeAmountEth: joined.stakeAmountEth,
        playerToken: guestToken,
        playerId: 'guest',
        role: 'guest',
        player1Name: joined.hostName,
        player2Name: playerName.trim()
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to join match.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto space-y-6 font-mono">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-[#091015] p-4 rounded-2xl border border-slate-800/90 shadow-xl backdrop-blur">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME</span>
        </button>

        <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider">
          <Swords className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-extrabold">MULTIPLAYER</span> COMMAND LOBBY
        </h2>

        <WalletConnect />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold rounded-xl text-center shadow-lg">
          {errorMsg}
        </div>
      )}

      {/* Lobby Controls */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Create Match Form */}
        <div className="md:col-span-6 bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase">HOST NEW MATCH</h3>
              <p className="text-[11px] text-slate-400 font-sans">Real-time PvP via Convex + ZK Merkle proofs</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px]">
                Commander Callsign
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your callsign..."
                className="w-full px-4 py-3 bg-[#050B0E] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] flex justify-between">
                <span>Match Mode &amp; Wager</span>
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
              </label>
              <select
                value={stakeAmountEth}
                onChange={(e) => setStakeAmountEth(e.target.value)}
                className="w-full px-4 py-3 bg-[#050B0E] border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="0">0 NIGHT — Free PvP (Convex + Client ZK Merkle Proofs)</option>
                <option value="0.01">0.01 NIGHT — Staked Midnight Escrow (Requires Lace + Proof Server)</option>
                <option value="0.05">0.05 NIGHT — Staked Midnight Escrow (Requires Lace + Proof Server)</option>
                <option value="0.1">0.10 NIGHT — Staked Midnight Escrow (Requires Lace + Proof Server)</option>
              </select>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleCreateMatch}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'CREATING LOBBY...'
                  : Number(stakeAmountEth) === 0
                  ? 'CREATE FREE ZK PVP MATCH'
                  : `CREATE STAKED MATCH (${stakeAmountEth} NIGHT)`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Join Match by Code & Live Lobbies */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase">JOIN VIA MATCH CODE</h3>
                <p className="text-[11px] text-slate-400 font-sans">Enter 6-digit match code to join opponent</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. 849201"
                maxLength={6}
                className="flex-1 px-4 py-3 bg-[#050B0E] border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold tracking-widest text-center text-base focus:outline-none focus:border-emerald-500 uppercase"
              />
              <button
                disabled={isSubmitting}
                onClick={() => handleJoinMatch()}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                JOIN
              </button>
            </div>
          </div>

          <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>OPEN CONVEX LOBBIES</span>
              </h4>
            </div>

            <ConvexErrorBoundary
              fallback={
                <div className="text-center py-6 text-red-300 text-xs font-sans">
                  Convex backend unreachable. Ensure <code className="font-mono">npx convex dev</code> is running inside{' '}
                  <code className="font-mono">frontend/</code>.
                </div>
              }
            >
              <RealtimeConvexLobbies onJoinMatch={handleJoinMatch} />
            </ConvexErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};
