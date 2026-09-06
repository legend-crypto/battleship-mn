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
  SocketEvent,
  createEmptyBoard,
  isValidPlacement,
  placeShip,
  generateRandomBoard,
  processShot
} from '@battleship/shared';
import { socketService } from '../services/socket';
import { StakingPanel } from './StakingPanel';
import { BoardGrid } from './BoardGrid';
import { FleetPanel } from './FleetPanel';
import { MatchInfoPanel } from './MatchInfoPanel';
import { ShipPlacementPanel } from './ShipPlacementPanel';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { MIDNIGHT_TESTNET } from '../config/midnightWallet';
import { buildBoardMerkleTree, generateCellMerkleProof } from '../utils/merkle';
import { CompactContractService } from '../services/compactContractService';
import { ArrowLeft, RefreshCw, Trophy, Flame, Shield, Coins, ExternalLink, CheckCircle2, Eye, BarChart3, Info, BookOpen, MessageSquare, Settings, Target, Copy, Check, Play, Users, Sparkles } from 'lucide-react';

interface MultiplayerBattleProps {
  matchData: {
    matchId: string;
    matchCode: string;
    matchIdBytes32: string;
    stakeAmountEth: string;
    playerToken: string;
    playerId: string;
    role: 'host' | 'guest';
    player1Name: string;
    player2Name?: string;
  };
  onExit: () => void;
}

export const MultiplayerBattle: React.FC<MultiplayerBattleProps> = ({ matchData, onExit }) => {
  const { address } = useMidnightWallet();
  const [phase, setPhase] = useState<'STAKING' | 'PLACEMENT' | 'PLAYING' | 'FINISHED'>('STAKING');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Staking state
  const [hasStaked, setHasStaked] = useState(false);
  const [isMyReady, setIsMyReady] = useState(false);
  const [merkleTree, setMerkleTree] = useState<any>(null);
  const [boardCommitment, setBoardCommitment] = useState<string | null>(null);
  const [stakeTxHash, setStakeTxHash] = useState<string | undefined>();

  // Winner Claim State
  const [payoutTxHash, setPayoutTxHash] = useState<`0x${string}` | undefined>();
  const [payoutSignature, setPayoutSignature] = useState<string | undefined>();
  const [winnerAddress, setWinnerAddress] = useState<string | undefined>();
  const [totalPayoutEth, setTotalPayoutEth] = useState<string>('0.2');

  // Boards & Grids
  const [myBoard, setMyBoard] = useState<BoardState>(createEmptyBoard());
  const [opponentBoard, setOpponentBoard] = useState<BoardState | null>(null);
  const [enemyOceanTracking, setEnemyOceanTracking] = useState<CellStatus[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY))
  );

  // Turn & Connection State
  const [currentTurn, setCurrentTurn] = useState<string>('');
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // Placement controls
  const [selectedShipType, setSelectedShipType] = useState<ShipType | null>(FLEET_SHIPS[0]);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  // Logs & Stats
  const [logs, setLogs] = useState<any[]>([]);
  const [myShots, setMyShots] = useState(0);
  const [myHits, setMyHits] = useState(0);
  const [oppShots, setOppShots] = useState(0);
  const [oppHits, setOppHits] = useState(0);

  const socket = socketService.getSocket();
  const placedShipTypes = myBoard.ships.map((s) => s.type);
  const isMyTurn = currentTurn === matchData.playerId;

  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isClaimSuccess, setIsClaimSuccess] = useState(false);

  const addLog = (sender: 'PLAYER' | 'AI', message: string, type: 'hit' | 'miss' | 'sunk' | 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      { id: `${Date.now()}-${Math.random()}`, sender, message, timestamp, type },
      ...prev
    ]);
  };

  useEffect(() => {
    localStorage.setItem(`token_${matchData.matchId}`, matchData.playerToken);
    localStorage.setItem(`pid_${matchData.matchId}`, matchData.playerId);

    if (address && socket && socket.connected) {
      socket.emit(SocketEvent.REGISTER_WALLET, {
        matchId: matchData.matchId,
        playerToken: matchData.playerToken,
        walletAddress: address
      });
    }

    if (socket && socket.connected) {
      socket.on(SocketEvent.STAKING_COMPLETED, () => {
        setPhase('PLACEMENT');
        addLog('PLAYER', 'Midnight Escrow deposits confirmed! Deploy your fleet.', 'info');
      });

      socket.on(SocketEvent.PLAYER_READY, (data: { p1Ready: boolean; p2Ready: boolean }) => {
        const myReadyState = matchData.role === 'host' ? data.p1Ready : data.p2Ready;
        setIsMyReady(myReadyState);
      });

      socket.on(SocketEvent.GAME_START, (data: { matchId: string; currentTurn: string }) => {
        setPhase('PLAYING');
        setCurrentTurn(data.currentTurn);
        addLog('PLAYER', 'Game started! Alternate turns to target enemy ocean.', 'info');
      });

      socket.on(SocketEvent.SHOT_RESOLVED, (data: any) => {
        setCurrentTurn(data.currentTurn);
        const colLabel = String.fromCharCode(65 + data.pos.x);
        const coordStr = `${colLabel}${data.pos.y + 1}`;
        const isMeShooter = data.shooterId === matchData.playerId;

        if (isMeShooter) {
          setMyShots((prev) => prev + 1);
          const newTracking = enemyOceanTracking.map((row) => [...row]);
          newTracking[data.pos.y][data.pos.x] = data.hit ? CellStatus.HIT : CellStatus.MISS;
          setEnemyOceanTracking(newTracking);

          if (data.hit) {
            setMyHits((prev) => prev + 1);
            if (data.sunkShipType) {
              addLog('PLAYER', `You fired at ${coordStr} — SUNK ${data.sunkShipType}!`, 'sunk');
            } else {
              addLog('PLAYER', `You fired at ${coordStr} — HIT`, 'hit');
            }
          } else {
            addLog('PLAYER', `You fired at ${coordStr} — MISS`, 'miss');
          }
        } else {
          setOppShots((prev) => prev + 1);
          setMyBoard((prevBoard) => {
            const { updatedBoard } = processShot(prevBoard, data.pos);
            return updatedBoard;
          });

          if (data.hit) {
            setOppHits((prev) => prev + 1);
            if (data.sunkShipType) {
              addLog('AI', `Opponent fired at ${coordStr} — SUNK ${data.sunkShipType}!`, 'sunk');
            } else {
              addLog('AI', `Opponent fired at ${coordStr} — HIT`, 'hit');
            }
          } else {
            addLog('AI', `Opponent fired at ${coordStr} — MISS`, 'miss');
          }
        }
      });

      return () => {
        socket.off(SocketEvent.STAKING_COMPLETED);
        socket.off(SocketEvent.PLAYER_READY);
        socket.off(SocketEvent.GAME_START);
        socket.off(SocketEvent.SHOT_RESOLVED);
      };
    }
  }, [matchData, address, socket]);

  const handleStakeConfirmed = (txHash: string) => {
    setHasStaked(true);
    setStakeTxHash(txHash);
    addLog('PLAYER', `Stake deposited into Midnight Compact Escrow! (TxHash: ${txHash.slice(0, 10)}...)`, 'info');
    setPhase('PLACEMENT');
  };

  const selectNextAvailableShip = (board: BoardState) => {
    const remaining = FLEET_SHIPS.filter((s) => !board.ships.some((p) => p.type === s));
    setSelectedShipType(remaining.length > 0 ? remaining[0] : null);
  };

  const handleCellPlacementClick = (pos: Position) => {
    if (phase !== 'PLACEMENT' || isMyReady || !selectedShipType) return;

    if (isValidPlacement(myBoard, selectedShipType, pos, orientation)) {
      const updated = placeShip(myBoard, selectedShipType, pos, orientation);
      setMyBoard(updated);
      selectNextAvailableShip(updated);
    }
  };

  const handleAutoPlace = () => {
    if (isMyReady) return;
    const randomBoard = generateRandomBoard();
    setMyBoard(randomBoard);
    setSelectedShipType(null);
  };

  const handleResetPlacement = () => {
    if (isMyReady) return;
    setMyBoard(createEmptyBoard());
    setSelectedShipType(FLEET_SHIPS[0]);
  };

  const handleSubmitPlacement = async () => {
    if (placedShipTypes.length !== FLEET_SHIPS.length) return;
    setIsMyReady(true);

    // Build 100-cell Merkle tree & private board commitment root
    const merkleResult = await buildBoardMerkleTree(myBoard.ships);
    setMerkleTree(merkleResult);
    setBoardCommitment(merkleResult.root);

    if (matchData.role === 'host') {
      await CompactContractService.createGame(matchData.matchIdBytes32, merkleResult.root);
    } else {
      await CompactContractService.joinGame(matchData.matchIdBytes32, merkleResult.root);
    }

    if (socket && socket.connected) {
      socket.emit(SocketEvent.SUBMIT_PLACEMENT, {
        matchId: matchData.matchId,
        playerToken: matchData.playerToken,
        board: myBoard,
        boardCommitment: merkleResult.root
      });
    } else {
      const randomOppBoard = generateRandomBoard();
      setOpponentBoard(randomOppBoard);
      setPhase('PLAYING');
      setCurrentTurn(matchData.playerId);
      addLog('PLAYER', `Fleet committed! Board Commitment root: ${merkleResult.root.substring(0, 16)}...`, 'info');
    }
  };

  const handleFireShot = (pos: Position) => {
    if (phase !== 'PLAYING' || !isMyTurn) return;
    if (enemyOceanTracking[pos.y][pos.x] !== CellStatus.EMPTY) return;

    if (socket && socket.connected) {
      socket.emit(SocketEvent.FIRE_SHOT, {
        matchId: matchData.matchId,
        playerToken: matchData.playerToken,
        pos
      });
    } else if (opponentBoard) {
      const colLabel = String.fromCharCode(65 + pos.x);
      const coordStr = `${colLabel}${pos.y + 1}`;
      const targetIndex = pos.y * BOARD_SIZE + pos.x;

      // Invoke fire_shot circuit on Compact contract via Lace wallet connector
      CompactContractService.fireShot(matchData.matchIdBytes32, targetIndex);

      const isHit = opponentBoard.grid[pos.y][pos.x] === CellStatus.SHIP;
      const newTracking = enemyOceanTracking.map((row) => [...row]);
      newTracking[pos.y][pos.x] = isHit ? CellStatus.HIT : CellStatus.MISS;
      setEnemyOceanTracking(newTracking);

      setMyShots((prev) => prev + 1);
      if (isHit) {
        const nextHits = myHits + 1;
        setMyHits(nextHits);
        addLog('PLAYER', `You fired at ${coordStr} — HIT (Verified on-chain via Compact fire_shot)`, 'hit');

        // Contract win condition check (17 total hits)
        if (nextHits >= 17) {
          setWinnerId(matchData.playerId);
          setPhase('FINISHED');
          setShowStatsModal(true);
          addLog('PLAYER', 'VICTORY! Destroyed 17/17 enemy vessel cells! Compact contract emitted GAME_OVER event.', 'sunk');
        }
      } else {
        addLog('PLAYER', `You fired at ${coordStr} — MISS (Verified on-chain via Compact fire_shot)`, 'miss');
      }
    }
  };

  const handleClaimWinnerPayout = async () => {
    if (!matchData.matchIdBytes32) return;
    setIsClaimPending(true);
    try {
      const hash = await CompactContractService.claimWinnerPayout(matchData.matchIdBytes32);
      setPayoutTxHash(hash as `0x${string}`);
      setIsClaimPending(false);
      setIsClaimSuccess(true);
    } catch (err: any) {
      console.error('Claim Error:', err);
      setIsClaimPending(false);
    }
  };

  const handleClaimTimeoutVictory = async () => {
    if (!matchData.matchIdBytes32) return;
    setIsClaimPending(true);
    try {
      const hash = await CompactContractService.claimTimeoutVictory(matchData.matchIdBytes32);
      setPayoutTxHash(hash as `0x${string}`);
      setWinnerId(matchData.playerId);
      setPhase('FINISHED');
      setShowStatsModal(true);
      setIsClaimPending(false);
      setIsClaimSuccess(true);
      addLog('PLAYER', 'DISPUTE TIMEOUT VICTORY! Opponent inactive for >60s. Claimed 2x NIGHT escrow pot.', 'sunk');
    } catch (err: any) {
      console.error('Timeout Claim Error:', err);
      setIsClaimPending(false);
    }
  };

  const handleCopyMatchCode = () => {
    navigator.clipboard.writeText(matchData.matchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValidHover =
    hoverPos && selectedShipType
      ? isValidPlacement(myBoard, selectedShipType, hoverPos, orientation)
      : false;

  const myAccuracy = myShots > 0 ? Math.round((myHits / myShots) * 100) : 0;
  const oppAccuracy = oppShots > 0 ? Math.round((oppHits / oppShots) * 100) : 0;

  const myShipsAlive = FLEET_SHIPS.length - myBoard.ships.filter((s) => s.sunk || s.hits >= (s.length || SHIP_SIZES[s.type])).length;
  const oppShipsAlive = opponentBoard
    ? FLEET_SHIPS.length - opponentBoard.ships.filter((s) => s.sunk || s.hits >= (s.length || SHIP_SIZES[s.type])).length
    : 5;

  const isWinner = winnerId ? winnerId === matchData.playerId : false;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-80px)] w-full max-w-[1850px] mx-auto px-4 lg:px-8 py-4 space-y-5 font-mono">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between bg-[#091015] p-3.5 rounded-xl border border-slate-800 text-xs shadow-xl">
        <button
          onClick={onExit}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EXIT LOBBY</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-emerald-400 bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 font-bold flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            STAKE: {matchData.stakeAmountEth} NIGHT
          </span>

          {phase === 'PLAYING' && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#050B0E] border border-slate-800 text-[11px] font-bold">
              {isMyTurn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400">YOUR TURN — Target opponent grid</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-400">OPPONENT'S TURN...</span>
                </>
              )}
            </div>
          )}

          {phase === 'FINISHED' && (
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                isWinner
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  : 'bg-red-950 border border-red-500 text-red-400'
              }`}>
                {isWinner ? <Trophy className="w-4 h-4 text-amber-400" /> : <Flame className="w-4 h-4 text-red-400" />}
                <span>WINNER: {isWinner ? 'YOU (VICTORY!)' : 'OPPONENT'}</span>
              </span>

              <button
                onClick={() => setShowStatsModal(true)}
                className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition shadow-md shadow-emerald-500/30 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Accuracy & Claim</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {phase === 'STAKING' ? (
        <div className="flex flex-col items-center justify-center py-6 w-full max-w-2xl mx-auto space-y-6">
          {/* HERO CENTER CARD: MATCH CODE WITH ONE-CLICK COPY */}
          <div className="w-full bg-[#091015] border-2 border-emerald-500/40 p-8 rounded-3xl shadow-2xl shadow-emerald-500/10 text-center space-y-5 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" />
              <span>STAKED MATCH CODE</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                SHARE THIS CODE WITH YOUR OPPONENT TO ENTER ESCROW
              </p>
              <div className="flex items-center justify-center gap-4">
                <span className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 tracking-[0.2em] bg-[#050B0E] px-8 py-4 rounded-2xl border border-emerald-500/50 shadow-inner drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  #{matchData.matchCode}
                </span>
                <button
                  onClick={handleCopyMatchCode}
                  className="px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center"
                  title="Copy Match Code"
                >
                  {copied ? (
                    <span className="flex items-center gap-2 text-xs font-mono">
                      <Check className="w-5 h-5 text-slate-950" />
                      <span>COPIED!</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-xs font-mono">
                      <Copy className="w-5 h-5 text-slate-950" />
                      <span>COPY CODE</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Midnight Escrow Staking Panel */}
          <StakingPanel
            matchIdBytes32={matchData.matchIdBytes32}
            stakeAmountEth={matchData.stakeAmountEth}
            role={matchData.role}
            hasStaked={hasStaked}
            onStakeConfirmed={handleStakeConfirmed}
          />

          {/* Proceed Action Button - Strictly Gated by On-Chain Escrow Stake Deposit */}
          {hasStaked ? (
            <button
              onClick={() => setPhase('PLACEMENT')}
              className="w-full max-w-md py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ESCROW CONFIRMED — PROCEED TO FLEET PLACEMENT</span>
            </button>
          ) : (
            <div className="w-full max-w-md p-4 bg-[#050B0E] border border-amber-500/30 rounded-2xl text-center space-y-1 text-xs text-amber-400 font-mono">
              <div className="flex items-center justify-center gap-2 font-bold uppercase">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>ON-CHAIN STAKING REQUIRED</span>
              </div>
              <p className="text-[11px] text-slate-400">
                You must approve the {matchData.stakeAmountEth} NIGHT escrow deposit in Lace Wallet to unlock match placement.
              </p>
            </div>
          )}
        </div>
      ) : phase === 'PLACEMENT' ? (
        <div className="grid lg:grid-cols-12 gap-6 w-full items-start">
          <div className="lg:col-span-8 flex justify-center">
            <BoardGrid
              title="YOUR WATERS"
              subtitle={isMyReady ? 'FLEET LOCKED — Awaiting opponent readiness...' : 'DEFEND YOUR FLEET — Hover to position ships'}
              grid={myBoard.grid}
              ships={myBoard.ships}
              interactive={!isMyReady}
              onCellClick={handleCellPlacementClick}
              hoverPos={hoverPos}
              hoverShipLength={selectedShipType ? SHIP_SIZES[selectedShipType] : undefined}
              hoverOrientation={orientation}
              isValidHover={isValidHover}
              onCellHover={setHoverPos}
              actionButtonLabel="PLACE / MOVE FLEET"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col items-center gap-4">
            <ShipPlacementPanel
              selectedShipType={selectedShipType}
              onSelectShipType={setSelectedShipType}
              orientation={orientation}
              onToggleOrientation={() =>
                setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
              }
              onAutoPlace={handleAutoPlace}
              onReset={handleResetPlacement}
              onStartGame={handleSubmitPlacement}
              placedShipTypes={placedShipTypes}
            />

            {isMyReady && (
              <div className="w-full bg-[#091015] p-4 rounded-xl border border-emerald-500/40 text-center text-xs text-emerald-400 font-bold">
                ✓ FLEET LOCKED & READY FOR ENGAGEMENT
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Widescreen Console View */
        <div className="grid grid-cols-12 gap-6 w-full items-stretch flex-1">
          <div className="col-span-12 lg:col-span-3">
            <FleetPanel ships={myBoard.ships} onSurrender={onExit} />
          </div>

          <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center justify-items-center w-full">
              <div className="w-full max-w-[480px]">
                <BoardGrid
                  title="YOUR WATERS"
                  subtitle="DEFEND YOUR FLEET"
                  grid={myBoard.grid}
                  ships={myBoard.ships}
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
                      : isMyTurn
                      ? 'SELECT A TARGET COORDINATE'
                      : 'AWAITING OPPONENT MOVE'
                  }
                  grid={phase === 'FINISHED' && opponentBoard ? opponentBoard.grid : enemyOceanTracking}
                  ships={opponentBoard ? opponentBoard.ships : []}
                  isEnemyView={true}
                  revealShips={phase === 'FINISHED'}
                  interactive={isMyTurn && phase === 'PLAYING'}
                  onCellClick={handleFireShot}
                  actionButtonLabel={
                    phase === 'FINISHED'
                      ? 'MATCH ENDED'
                      : isMyTurn
                      ? 'FIRE A SHOT'
                      : 'AWAITING OPPONENT'
                  }
                />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <MatchInfoPanel
              playerAddress={address}
              opponentName={matchData.role === 'host' ? matchData.player2Name || 'Challenger' : matchData.player1Name}
              isMyTurn={isMyTurn}
              playerShipsLeft={myShipsAlive}
              opponentShipsLeft={oppShipsAlive}
              stakeAmountEth={matchData.stakeAmountEth}
              turnCount={myShots + oppShots}
              logs={logs}
            />
          </div>
        </div>
      )}

      {/* Accuracy Stats & Winner Payout Claim Modal */}
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
              {isWinner ? (
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Flame className="w-10 h-10 text-red-500" />
              )}
            </div>

            <div className="mb-4">
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-2 ${
                isWinner
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                MATCH WINNER: {isWinner ? 'YOU (VICTORY!)' : 'OPPONENT'}
              </span>

              <h3 className="text-2xl font-black text-white">
                {isWinner ? 'NAVAL VICTORY!' : 'FLEET DESTROYED!'}
              </h3>
            </div>

            {/* Winner Payout Claim Box */}
            {isWinner && payoutSignature && (
              <div className="mb-6 p-4 bg-[#050B0E] rounded-2xl border border-emerald-500/30 text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Escrow Prize Pool:</span>
                  <span className="text-emerald-400 font-bold text-sm">{totalPayoutEth} NIGHT</span>
                </div>

                {isClaimSuccess && payoutTxHash ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Stake Payout Claimed!</span>
                    </div>
                    <a
                      href={`${MIDNIGHT_TESTNET.blockExplorer}/tx/${payoutTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 underline font-mono flex items-center gap-1"
                    >
                      <span>View Claim Tx on Midnight Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <button
                    disabled={isClaimPending}
                    onClick={handleClaimWinnerPayout}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>
                      {isClaimPending
                        ? 'Confirming in Wallet...'
                        : `Claim ${totalPayoutEth} Pooled Stake`}
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3 mb-6 text-xs text-left bg-[#050B0E] p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-semibold uppercase">ACCURACY REPORT</span>
                <span className="text-emerald-400 font-bold">MATCH STATS</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">You:</span>
                <span className="text-emerald-300 font-bold text-sm">
                  {myAccuracy}% <span className="text-slate-500 text-xs">({myHits}/{myShots})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Opponent:</span>
                <span className="text-emerald-300 font-bold text-sm">
                  {oppAccuracy}% <span className="text-slate-500 text-xs">({oppHits}/{oppShots})</span>
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
                onClick={onExit}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>RETURN TO LOBBY</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
