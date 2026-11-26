import React, { useState, useEffect } from 'react';
import {
  BOARD_SIZE,
  BoardState,
  CellStatus,
  FLEET_SHIPS,
  Orientation,
  Position,
  SHIP_SIZES,
  ShipType,
  ShotResultType,
  createEmptyBoard,
  createInitialAIState,
  generateRandomBoard,
  getNextAIMove,
  isFleetSunk,
  isValidPlacement,
  placeShip,
  processShot,
  updateAIState
} from '@battleship/shared';
import { BoardGrid } from './BoardGrid';
import { FleetPanel } from './FleetPanel';
import { MatchInfoPanel } from './MatchInfoPanel';
import { ShipPlacementPanel } from './ShipPlacementPanel';
import { StakingPanel } from './StakingPanel';
import { Trophy, ArrowLeft, RefreshCw, Bot, Flame, BarChart3, Eye, Play, BookOpen, MessageSquare, Settings, Info, Target, Coins, Shield, Sparkles, ExternalLink, CheckCircle2, Lock, Swords, Cpu, Zap } from 'lucide-react';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { buildBoardMerkleTree, generateCellMerkleProof } from '../utils/merkle';
import { CompactContractService } from '../services/compactContractService';

interface LocalAIGameProps {
  onBackToMenu: () => void;
}

type AIMode = 'FREE' | 'STAKED';

export const LocalAIGame: React.FC<LocalAIGameProps> = ({ onBackToMenu }) => {
  const { address, isConnected } = useMidnightWallet();

  // Mode Selection State
  const [aiMode, setAiMode] = useState<AIMode | null>(null);
  const [stakeAmountEth, setStakeAmountEth] = useState<string>('0.1');

  // Staking & Match State
  const [matchIdBytes32, setMatchIdBytes32] = useState<string | null>(null);
  const [stakeTxHash, setStakeTxHash] = useState<string | null>(null);
  const [hasStaked, setHasStaked] = useState<boolean>(false);
  const [playerMerkleTree, setPlayerMerkleTree] = useState<any>(null);
  const [boardCommitment, setBoardCommitment] = useState<string | null>(null);
  const [isAiJoiningOnChain, setIsAiJoiningOnChain] = useState(false);

  // Winner Payout Claim State
  const [payoutSignature, setPayoutSignature] = useState<string | undefined>();
  const [payoutTxHash, setPayoutTxHash] = useState<`0x${string}` | undefined>();

  // Game Phases
  const [phase, setPhase] = useState<'MODE_SELECT' | 'STAKING' | 'PLACEMENT' | 'PLAYING' | 'FINISHED'>('MODE_SELECT');
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Boards
  const [playerBoard, setPlayerBoard] = useState<BoardState>(createEmptyBoard());
  const [aiBoard, setAiBoard] = useState<BoardState>(createEmptyBoard());

  // Tracking Grids
  const [aiOceanTracking, setAiOceanTracking] = useState<CellStatus[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY))
  );
  const [playerOceanTracking, setPlayerOceanTracking] = useState<CellStatus[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY))
  );

  // AI & Turn State
  const [aiState, setAiState] = useState(createInitialAIState());
  const [currentTurn, setCurrentTurn] = useState<'PLAYER' | 'AI'>('PLAYER');
  const [winner, setWinner] = useState<'PLAYER' | 'AI' | null>(null);

  // Placement controls
  const [selectedShipType, setSelectedShipType] = useState<ShipType | null>(FLEET_SHIPS[0]);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  // Logs & Stats
  const [logs, setLogs] = useState<any[]>([]);
  const [playerShots, setPlayerShots] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [aiShots, setAiShots] = useState(0);
  const [aiHits, setAiHits] = useState(0);

  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isClaimSuccess, setIsClaimSuccess] = useState(false);

  const placedShipTypes = playerBoard.ships.map((s) => s.type);

  const addLog = (sender: 'PLAYER' | 'AI', message: string, type: 'hit' | 'miss' | 'sunk' | 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      { id: `${Date.now()}-${Math.random()}`, sender, message, timestamp, type },
      ...prev
    ]);
  };

  const handleSelectFreeMode = () => {
    setAiMode('FREE');
    setPhase('PLACEMENT');
    addLog('PLAYER', 'Midnight ZK AI Practice mode initiated. Deploy your fleet.', 'info');
  };

  const handleSelectStakedMode = () => {
    if (!isConnected || !address) {
      alert('Please connect your Lace Wallet in the top header to play Staked Midnight ZK AI Battle.');
      return;
    }
    const randomMatchId = `0xmn_ai_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 10)}`;
    setMatchIdBytes32(randomMatchId);
    setAiMode('STAKED');
    setPhase('PLACEMENT');
    addLog('PLAYER', 'Staked Midnight AI Battle selected. Deploy your fleet to generate your Merkle root before staking.', 'info');
  };

  // Called when Player 1 deposits stake on-chain after placing fleet
  const handleStakeConfirmed = async (txHash: string) => {
    setHasStaked(true);
    setStakeTxHash(txHash);
    const randomAiBoard = generateRandomBoard();
    setAiBoard(randomAiBoard);
    setPhase('PLAYING');
    setCurrentTurn('PLAYER');
    setShowStatsModal(false);
    addLog('PLAYER', `Stake deposited into Midnight Compact Escrow! (TxHash: ${txHash.slice(0, 10)}...)`, 'info');
  };

  const selectNextAvailableShip = (board: BoardState) => {
    const remaining = FLEET_SHIPS.filter((s) => !board.ships.some((p) => p.type === s));
    setSelectedShipType(remaining.length > 0 ? remaining[0] : null);
  };

  const handleCellPlacementClick = (pos: Position) => {
    if (phase !== 'PLACEMENT' || !selectedShipType) return;

    if (isValidPlacement(playerBoard, selectedShipType, pos, orientation)) {
      const updated = placeShip(playerBoard, selectedShipType, pos, orientation);
      setPlayerBoard(updated);
      selectNextAvailableShip(updated);
    }
  };

  const handleAutoPlace = () => {
    const randomBoard = generateRandomBoard();
    setPlayerBoard(randomBoard);
    setSelectedShipType(null);
  };

  const handleResetPlacement = () => {
    setPlayerBoard(createEmptyBoard());
    setSelectedShipType(FLEET_SHIPS[0]);
  };

  const handleStartBattle = async () => {
    if (placedShipTypes.length !== FLEET_SHIPS.length) return;

    // Generate ZK Merkle Tree & Board Commitment Hash for 10x10 placement
    const merkleResult = await buildBoardMerkleTree(playerBoard.ships);
    setPlayerMerkleTree(merkleResult);
    setBoardCommitment(merkleResult.root);

    if (aiMode === 'STAKED' && !hasStaked) {
      setPhase('STAKING');
      return;
    }

    const randomAiBoard = generateRandomBoard();
    setAiBoard(randomAiBoard);
    setPhase('PLAYING');
    setCurrentTurn('PLAYER');
    setShowStatsModal(false);
    addLog(
      'PLAYER',
      `Practice battle initiated! Local 100-cell Merkle commitment: ${merkleResult.root.substring(0, 16)}...`,
      'info'
    );
  };

  const handleFireShot = async (pos: Position) => {
    if (phase !== 'PLAYING' || currentTurn !== 'PLAYER') return;
    if (aiOceanTracking[pos.y][pos.x] !== CellStatus.EMPTY) return;

    const colLabel = String.fromCharCode(65 + pos.x);
    const coordStr = `${colLabel}${pos.y + 1}`;

    const { updatedBoard, result } = processShot(aiBoard, pos);
    setAiBoard(updatedBoard);

    const newTracking = aiOceanTracking.map((row) => [...row]);
    newTracking[pos.y][pos.x] = result.hit ? CellStatus.HIT : CellStatus.MISS;
    setAiOceanTracking(newTracking);

    setPlayerShots((prev) => prev + 1);

    if (aiMode === 'STAKED') {
      const targetIndex = pos.y * BOARD_SIZE + pos.x;
      const gameId = matchIdBytes32 || `0xmn_ai_${Date.now().toString(16)}`;
      await CompactContractService.fireShot(gameId, targetIndex);
    }

    const txSuffix = aiMode === 'STAKED' ? ' (On-chain fire_shot)' : '';
    if (result.hit) {
      setPlayerHits((prev) => prev + 1);
      if (result.type === ShotResultType.SUNK) {
        addLog('PLAYER', `You fired at ${coordStr} — SUNK ${result.sunkShipType}!${txSuffix}`, 'sunk');
      } else {
        addLog('PLAYER', `You fired at ${coordStr} — HIT${txSuffix}`, 'hit');
      }
    } else {
      addLog('PLAYER', `You fired at ${coordStr} — MISS${txSuffix}`, 'miss');
    }

    if (result.gameOver) {
      setWinner('PLAYER');
      setPhase('FINISHED');
      setShowStatsModal(true);
      addLog('PLAYER', 'VICTORY! Defeated Midnight ZK AI Agent! All enemy vessels destroyed!', 'sunk');
    } else {
      setCurrentTurn('AI');
    }
  };

  useEffect(() => {
    if (phase !== 'PLAYING' || currentTurn !== 'AI') return;

    const aiTimeout = setTimeout(() => {
      try {
        const { pos, nextState } = getNextAIMove(playerOceanTracking, aiState);
        const colLabel = String.fromCharCode(65 + pos.x);
        const coordStr = `${colLabel}${pos.y + 1}`;

        const { updatedBoard, result } = processShot(playerBoard, pos);
        setPlayerBoard(updatedBoard);

        const newTracking = playerOceanTracking.map((row) => [...row]);
        newTracking[pos.y][pos.x] = result.hit ? CellStatus.HIT : CellStatus.MISS;
        setPlayerOceanTracking(newTracking);

        const isSunk = result.type === ShotResultType.SUNK;
        const updatedAiState = updateAIState(nextState, pos, result.hit, isSunk, newTracking);
        setAiState(updatedAiState);

        setAiShots((prev) => prev + 1);

        if (result.hit) {
          setAiHits((prev) => prev + 1);
          if (isSunk) {
            addLog('AI', `Midnight ZK Node fired at ${coordStr} — SUNK ${result.sunkShipType}!`, 'sunk');
          } else {
            addLog('AI', `Midnight ZK Node fired at ${coordStr} — HIT`, 'hit');
          }
        } else {
          addLog('AI', `Midnight ZK Node fired at ${coordStr} — MISS`, 'miss');
        }

        if (result.gameOver) {
          setWinner('AI');
          setPhase('FINISHED');
          setShowStatsModal(true);
          addLog('AI', 'DEFEAT! Midnight ZK AI Agent destroyed your fleet.', 'sunk');
        } else {
          setCurrentTurn('PLAYER');
        }
      } catch (err) {
        console.error('AI Move Error:', err);
        setCurrentTurn('PLAYER');
      }
    }, 600);

    return () => clearTimeout(aiTimeout);
  }, [phase, currentTurn, playerBoard, playerOceanTracking, aiState]);

  const handleClaimWinnerPayout = async () => {
    if (!matchIdBytes32 || aiMode !== 'STAKED') return;
    setIsClaimPending(true);
    try {
      const hash = await CompactContractService.claimWinnerPayout(matchIdBytes32);
      setPayoutTxHash(hash as `0x${string}`);
      setIsClaimPending(false);
      setIsClaimSuccess(true);
    } catch (err: any) {
      console.error('Claim Error:', err);
      addLog('PLAYER', err?.message || 'Winner payout claim failed.', 'info');
      setIsClaimPending(false);
    }
  };

  const handleRestart = () => {
    setPlayerBoard(createEmptyBoard());
    setAiBoard(createEmptyBoard());
    setAiOceanTracking(Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)));
    setPlayerOceanTracking(Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)));
    setAiState(createInitialAIState());
    setCurrentTurn('PLAYER');
    setWinner(null);
    setSelectedShipType(FLEET_SHIPS[0]);
    setLogs([]);
    setPlayerShots(0);
    setPlayerHits(0);
    setAiShots(0);
    setAiHits(0);
    setHasStaked(false);
    setPayoutSignature(undefined);
    setPayoutTxHash(undefined);
    setPhase('MODE_SELECT');
    setShowStatsModal(false);
  };

  const handleSurrender = () => {
    setWinner('AI');
    setPhase('FINISHED');
    setShowStatsModal(true);
    addLog('PLAYER', 'Commander surrendered the match.', 'info');
  };

  const isValidHover =
    hoverPos && selectedShipType
      ? isValidPlacement(playerBoard, selectedShipType, hoverPos, orientation)
      : false;

  const playerAccuracy = playerShots > 0 ? Math.round((playerHits / playerShots) * 100) : 0;
  const aiAccuracy = aiShots > 0 ? Math.round((aiHits / aiShots) * 100) : 0;

  const playerShipsAlive = FLEET_SHIPS.length - playerBoard.ships.filter((s) => s.sunk || s.hits >= (s.length || SHIP_SIZES[s.type])).length;
  const aiShipsAlive = FLEET_SHIPS.length - aiBoard.ships.filter((s) => s.sunk || s.hits >= (s.length || SHIP_SIZES[s.type])).length;

  const totalPayoutEth = (Number(stakeAmountEth) * 2).toFixed(2);

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-80px)] w-full max-w-[1850px] mx-auto px-4 lg:px-8 py-4 space-y-5">
      {/* Top Header Navigation Bar */}
      <div className="w-full flex items-center justify-between bg-[#091015] p-3.5 rounded-xl border border-slate-800 font-mono text-xs shadow-xl">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EXIT BATTLE STATION</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Midnight ZK Engine Status Pill */}
          <div className="flex items-center space-x-2 bg-[#050B0E] px-3 py-1 rounded-lg border border-slate-800 text-[11px] font-bold text-emerald-400">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>MIDNIGHT ZK COMPUTE NODE #MN-9021</span>
          </div>

          {aiMode === 'STAKED' && (
            <span className="font-mono text-xs text-emerald-400 bg-[#050B0E] px-3 py-1 rounded-lg border border-slate-800 font-bold flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              STAKE: {stakeAmountEth} NIGHT
            </span>
          )}

          {phase === 'PLAYING' && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#050B0E] border border-slate-800 text-[11px] font-bold">
              {currentTurn === 'PLAYER' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400">YOUR TURN — Select target coordinate</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-emerald-400">MIDNIGHT ZK INFERENCING (LATENCY: 12ms)...</span>
                </>
              )}
            </div>
          )}

          {phase === 'FINISHED' && (
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                winner === 'PLAYER'
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  : 'bg-red-950 border border-red-500 text-red-400'
              }`}>
                {winner === 'PLAYER' ? <Trophy className="w-4 h-4 text-amber-400" /> : <Flame className="w-4 h-4 text-red-400" />}
                <span>WINNER: {winner === 'PLAYER' ? 'COMMANDER (YOU)' : 'MIDNIGHT ZK AI AGENT'}</span>
              </span>

              <button
                onClick={() => setShowStatsModal(true)}
                className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition shadow-md shadow-emerald-500/30 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Accuracy Report</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleRestart}
          className="flex items-center space-x-2 text-slate-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>CHANGE MODE / RESTART</span>
        </button>
      </div>

      {/* ---------------- MODE SELECTION SCREEN ---------------- */}
      {phase === 'MODE_SELECT' ? (
        <div className="flex flex-col items-center justify-center py-8 w-full max-w-4xl mx-auto space-y-6 font-mono">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-emerald-400 tracking-[0.25em] uppercase flex items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              MIDNIGHT ZERO-KNOWLEDGE AI NETWORK
            </span>
            <h2 className="text-3xl font-black text-white">BATTLE VS MIDNIGHT ZK AI AGENT</h2>
            <p className="text-xs text-slate-400 max-w-lg font-sans">
              Choose free offline practice mode or stake tokens to defeat Midnight's ZK AI Agent and earn rewards on Midnight Network.
            </p>
          </div>

          <div className="w-full p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start gap-3 shadow-lg">
            <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-300 font-sans leading-relaxed">
              <strong className="font-mono text-emerald-400 font-bold block uppercase mb-0.5">PRIZE POOL NOTICE:</strong>
              The prize pool will be increased after our upcoming funding round! Defeat Midnight's ZK AI Agent and earn tokens on-chain!
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full items-stretch">
            {/* MODE 1: FREE PRACTICE */}
            <div className="bg-[#091015] border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col justify-between space-y-6 hover:border-slate-700 transition">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Bot className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">MIDNIGHT ZK PRACTICE (FREE)</h3>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Play offline vs Midnight ZK AI Agent. Wallet connection not required. Ideal for testing fleet placement.
                  </p>
                </div>
                <div className="p-3 bg-[#050B0E] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>• Stake: <strong className="text-white">0.00 NIGHT</strong></div>
                  <div>• Wallet Required: <strong className="text-slate-300">No</strong></div>
                  <div>• AI Engine: <strong className="text-emerald-400">Midnight ZK Engine-v1</strong></div>
                </div>
              </div>

              <button
                onClick={handleSelectFreeMode}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START FREE PRACTICE</span>
              </button>
            </div>

            {/* MODE 2: STAKED AI BATTLE (Awaiting Funded AI Escrow Signer) */}
            <div className="bg-[#091015] border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden opacity-90">
              <div className="absolute top-3 right-3 text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded uppercase">
                REQUIRES AI ESCROW SIGNER
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Swords className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">STAKED MIDNIGHT ZK BATTLE</h3>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    On-chain AI staking requires a funded server-side AI signer to co-sign <code className="text-emerald-400">join_game</code> &amp; <code className="text-emerald-400">resolve_shot</code>. For live PvP staking or free PvP, use Multiplayer mode.
                  </p>
                </div>

                <div className="p-3 bg-[#050B0E] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>• Status: <strong className="text-amber-300">Pending House Escrow Signer</strong></div>
                  <div>• Alternative: <strong className="text-emerald-400">Multiplayer Lobby / Free Practice</strong></div>
                </div>
              </div>

              <button
                disabled
                className="w-full py-3.5 bg-slate-800 text-slate-400 font-black rounded-xl text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>AI ESCROW SIGNER NOT CONFIGURED</span>
              </button>
            </div>
          </div>
        </div>
      ) : phase === 'STAKING' ? (
        <div className="flex flex-col items-center justify-center py-8 w-full">
          <StakingPanel
            matchIdBytes32={matchIdBytes32 || ''}
            stakeAmountEth={stakeAmountEth}
            role="host"
            hasStaked={hasStaked}
            boardCommitment={boardCommitment || undefined}
            onStakeConfirmed={handleStakeConfirmed}
          />
        </div>
      ) : phase === 'PLACEMENT' ? (
        <div className="grid lg:grid-cols-12 gap-6 w-full items-start">
          <div className="lg:col-span-8 flex justify-center">
            <BoardGrid
              title="YOUR WATERS"
              subtitle="DEFEND YOUR FLEET — Hover to position ships"
              grid={playerBoard.grid}
              ships={playerBoard.ships}
              interactive={true}
              onCellClick={handleCellPlacementClick}
              hoverPos={hoverPos}
              hoverShipLength={selectedShipType ? SHIP_SIZES[selectedShipType] : undefined}
              hoverOrientation={orientation}
              isValidHover={isValidHover}
              onCellHover={setHoverPos}
              actionButtonLabel="PLACE / MOVE FLEET"
            />
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <ShipPlacementPanel
              selectedShipType={selectedShipType}
              onSelectShipType={setSelectedShipType}
              orientation={orientation}
              onToggleOrientation={() =>
                setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
              }
              onAutoPlace={handleAutoPlace}
              onReset={handleResetPlacement}
              onStartGame={handleStartBattle}
              placedShipTypes={placedShipTypes}
            />
          </div>
        </div>
      ) : (
        /* Widescreen Console View */
        <div className="grid grid-cols-12 gap-6 w-full items-stretch flex-1">
          <div className="col-span-12 lg:col-span-3">
            <FleetPanel ships={playerBoard.ships} onSurrender={handleSurrender} />
          </div>

          <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center justify-items-center w-full">
              <div className="w-full max-w-[480px]">
                <BoardGrid
                  title="YOUR WATERS"
                  subtitle="DEFEND YOUR FLEET"
                  grid={playerBoard.grid}
                  ships={playerBoard.ships}
                  isEnemyView={false}
                  interactive={false}
                  actionButtonLabel="YOUR WATERS (DEFENSE)"
                />
              </div>

              <div className="hidden md:flex flex-col items-center justify-center space-y-2 text-[#64748B]">
                <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#1C2C3C] to-transparent"></div>
                <div className="w-7 h-7 rounded-full border border-[#1C2C3C] flex items-center justify-center text-slate-500 bg-[#060D12]">
                  <Target className="w-3.5 h-3.5 text-[#64748B]" />
                </div>
                <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#1C2C3C] to-transparent"></div>
              </div>

              <div className="w-full max-w-[480px]">
                <BoardGrid
                  title="ENEMY WATERS"
                  subtitle={
                    phase === 'FINISHED'
                      ? 'DESTROY ENEMY FLEET (REVEALED)'
                      : currentTurn === 'PLAYER'
                      ? 'SELECT A TARGET COORDINATE'
                      : 'AWAITING MIDNIGHT ZK MOVE'
                  }
                  grid={phase === 'FINISHED' ? aiBoard.grid : aiOceanTracking}
                  ships={aiBoard.ships}
                  isEnemyView={true}
                  revealShips={phase === 'FINISHED'}
                  interactive={currentTurn === 'PLAYER' && phase === 'PLAYING'}
                  onCellClick={handleFireShot}
                  actionButtonLabel={
                    phase === 'FINISHED'
                      ? 'MATCH ENDED'
                      : currentTurn === 'PLAYER'
                      ? 'FIRE A SHOT'
                      : 'SELECT A TARGET COORDINATE'
                  }
                />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <MatchInfoPanel
              playerAddress={address || undefined}
              opponentName="MIDNIGHT ZK AI AGENT (#MN-9021)"
              isMyTurn={currentTurn === 'PLAYER'}
              playerShipsLeft={playerShipsAlive}
              opponentShipsLeft={aiShipsAlive}
              stakeAmountEth={aiMode === 'STAKED' ? stakeAmountEth : '0.00'}
              turnCount={playerShots + aiShots}
              logs={logs}
            />
          </div>
        </div>
      )}

      {/* Accuracy Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#091015] border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowStatsModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Inspect Grid"
            >
              <Eye className="w-5 h-5 text-emerald-400" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              {winner === 'PLAYER' ? (
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Flame className="w-10 h-10 text-red-500" />
              )}
            </div>

            <div className="mb-4">
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-2 ${
                winner === 'PLAYER'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                MATCH WINNER: {winner === 'PLAYER' ? 'COMMANDER (YOU)' : 'MIDNIGHT ZK AI AGENT'}
              </span>

              <h3 className="text-2xl font-black text-white">
                {winner === 'PLAYER' ? 'NAVAL VICTORY!' : 'FLEET DESTROYED!'}
              </h3>
            </div>

            <div className="space-y-3 mb-6 text-xs text-left bg-[#050B0E] p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-semibold uppercase">ACCURACY REPORT</span>
                <span className="text-emerald-400 font-bold">MATCH STATS</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${winner === 'PLAYER' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                  <span className="text-slate-300">Commander (You):</span>
                </div>
                <span className="text-emerald-300 font-bold text-sm">
                  {playerAccuracy}% <span className="text-slate-500 text-xs">({playerHits}/{playerShots})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${winner === 'AI' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  <span className="text-slate-300">Midnight ZK AI Agent:</span>
                </div>
                <span className="text-emerald-300 font-bold text-sm">
                  {aiAccuracy}% <span className="text-slate-500 text-xs">({aiHits}/{aiShots})</span>
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatsModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>INSPECT GRID</span>
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
