import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  isValidPlacement,
  placeShip,
  generateRandomBoard,
  processShot
} from '@battleship/shared';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { StakingPanel } from './StakingPanel';
import { BoardGrid } from './BoardGrid';
import { FleetPanel } from './FleetPanel';
import { MatchInfoPanel } from './MatchInfoPanel';
import { ShipPlacementPanel } from './ShipPlacementPanel';
import { ProofGenerationOverlay } from './ProofGenerationOverlay';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { MIDNIGHT_TESTNET } from '../config/midnightWallet';
import {
  BoardMerkleTreeResult,
  buildBoardMerkleTree,
  generateCellMerkleProof,
  verifyCellMerkleProof
} from '../utils/merkle';
import { CompactContractService } from '../services/compactContractService';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Shield,
  Coins,
  ExternalLink,
  CheckCircle2,
  Eye,
  BarChart3,
  Target,
  Copy,
  Check,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';

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
  const isFreeMatch = Number(matchData.stakeAmountEth) === 0;
  const storageKey = `mn_private_${matchData.matchIdBytes32}_${matchData.role}`;

  // Subscribe to real-time Convex match document
  const liveMatch = useQuery(api.matches.getMatchByBytes32, {
    matchIdBytes32: matchData.matchIdBytes32
  });

  const confirmStakeMutation = useMutation(api.matches.confirmStake);
  const submitCommitmentMutation = useMutation(api.matches.submitCommitment);
  const fireShotMutation = useMutation(api.matches.fireShot);
  const resolveShotMutation = useMutation(api.matches.resolveShot);
  const claimTimeoutMutation = useMutation(api.matches.claimTimeoutVictory);
  const recordPayoutMutation = useMutation(api.matches.recordPayout);
  const forfeitMatchMutation = useMutation(api.matches.forfeitMatch);

  // Private local board & Merkle tree (never uploaded to Convex)
  const [myBoard, setMyBoard] = useState<BoardState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).board;
    } catch {
      // ignore storage errors
    }
    return createEmptyBoard();
  });
  const [merkleTree, setMerkleTree] = useState<BoardMerkleTreeResult | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).merkleTree;
    } catch {
      // ignore storage errors
    }
    return null;
  });

  const [selectedShipType, setSelectedShipType] = useState<ShipType | null>(() =>
    myBoard.ships.length === FLEET_SHIPS.length ? null : FLEET_SHIPS[0]
  );
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isFiring, setIsFiring] = useState(false);

  // Proof overlay state when defending incoming shot
  const [proofStep, setProofStep] = useState<'WITNESS' | 'SNARK_PROOF' | 'VERIFY_ROOT' | 'COMPLETE' | null>(null);
  const resolvingShotKeyRef = useRef<string | null>(null);

  // Winner payout state
  const [isClaimPending, setIsClaimPending] = useState(false);
  const [payoutTxHash, setPayoutTxHash] = useState<string | undefined>();

  // Dispute 60s countdown tick
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist local private board + Merkle salts
  useEffect(() => {
    if (merkleTree) {
      localStorage.setItem(storageKey, JSON.stringify({ board: myBoard, merkleTree }));
    }
  }, [myBoard, merkleTree, storageKey]);

  const placedShipTypes = myBoard.ships.map((s) => s.type);
  const boardCommitment = merkleTree?.root;

  const isHost = matchData.role === 'host';
  const myStaked = isFreeMatch ? true : isHost ? !!liveMatch?.hostStaked : !!liveMatch?.guestStaked;
  const oppStaked = isFreeMatch ? true : isHost ? !!liveMatch?.guestStaked : !!liveMatch?.hostStaked;
  const myCommitted = isHost ? !!liveMatch?.hostReady : !!liveMatch?.guestReady;
  const oppCommitted = isHost ? !!liveMatch?.guestReady : !!liveMatch?.hostReady;

  const phase: 'PLACEMENT' | 'STAKING' | 'PLAYING' | 'FINISHED' | 'CANCELLED' = useMemo(() => {
    if (liveMatch?.status === 'CANCELLED') return 'CANCELLED';
    if (liveMatch?.status === 'FINISHED') return 'FINISHED';
    if (liveMatch?.status === 'PLAYING') return 'PLAYING';
    if (!myCommitted) return 'PLACEMENT';
    if (!isFreeMatch && !myStaked) return 'STAKING';
    return 'PLACEMENT';
  }, [liveMatch?.status, myCommitted, isFreeMatch, myStaked]);

  useEffect(() => {
    if (liveMatch?.status === 'FINISHED') {
      setShowStatsModal(true);
    }
  }, [liveMatch?.status]);

  // Derive enemy tracking grid, shots, hits, and logs from Convex shots array
  const { enemyOceanTracking, myShots, myHits, oppShots, oppHits } = useMemo(() => {
    const tracking: CellStatus[][] = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)
    );
    let mShots = 0;
    let mHits = 0;
    let oShots = 0;
    let oHits = 0;

    for (const s of liveMatch?.shots || []) {
      if (s.shooter === matchData.role) {
        mShots += 1;
        if (s.hit) mHits += 1;
        tracking[s.y][s.x] = s.hit ? CellStatus.HIT : CellStatus.MISS;
      } else {
        oShots += 1;
        if (s.hit) oHits += 1;
      }
    }

    return {
      enemyOceanTracking: tracking,
      myShots: mShots,
      myHits: mHits,
      oppShots: oShots,
      oppHits: oHits
    };
  }, [liveMatch?.shots, matchData.role]);

  // Automatically defend & submit ZK Merkle proof when opponent fires a shot
  useEffect(() => {
    const pending = liveMatch?.pendingShot;
    if (!pending || pending.shooter === matchData.role || !merkleTree) return;

    const shotKey = `${pending.shooter}:${pending.x}:${pending.y}:${pending.firedAt}`;
    if (resolvingShotKeyRef.current === shotKey) return;
    resolvingShotKeyRef.current = shotKey;

    const resolveIncoming = async () => {
      try {
        setActionError(null);
        setProofStep('WITNESS');

        const cellIndex = pending.y * BOARD_SIZE + pending.x;
        const leaf = merkleTree.leaves[cellIndex];
        const proof = generateCellMerkleProof(cellIndex, merkleTree.treeLevels);

        setProofStep('SNARK_PROOF');
        const proofVerified = await verifyCellMerkleProof(leaf, proof, merkleTree.root);
        if (!proofVerified) {
          throw new Error('Local Merkle proof verification failed for defending cell');
        }

        const { updatedBoard, result } = processShot(myBoard, { x: pending.x, y: pending.y });
        setMyBoard(updatedBoard);

        setProofStep('VERIFY_ROOT');
        let resolveTxHash: string | undefined;
        if (!isFreeMatch) {
          resolveTxHash = await CompactContractService.resolveShot(
            matchData.matchIdBytes32,
            cellIndex,
            result.hit,
            leaf,
            proof
          );
        }

        await resolveShotMutation({
          matchIdBytes32: matchData.matchIdBytes32,
          playerToken: matchData.playerToken,
          x: pending.x,
          y: pending.y,
          hit: result.hit,
          sunkShipType: result.type === ShotResultType.SUNK ? result.sunkShipType : undefined,
          proofVerified,
          merkleRoot: merkleTree.root,
          resolveTxHash
        });

        setProofStep('COMPLETE');
        setTimeout(() => setProofStep(null), 500);
      } catch (err: any) {
        console.error('Shot resolution error:', err);
        setProofStep(null);
        resolvingShotKeyRef.current = null;
        setActionError(err?.message || 'Failed to resolve incoming shot proof.');
      }
    };

    resolveIncoming();
  }, [liveMatch?.pendingShot, matchData.role, matchData.matchIdBytes32, matchData.playerToken, merkleTree, myBoard, isFreeMatch, resolveShotMutation]);

  const selectNextAvailableShip = (board: BoardState) => {
    const remaining = FLEET_SHIPS.filter((s) => !board.ships.some((p) => p.type === s));
    setSelectedShipType(remaining.length > 0 ? remaining[0] : null);
  };

  const handleCellPlacementClick = (pos: Position) => {
    if (phase !== 'PLACEMENT' || myCommitted || !selectedShipType) return;
    if (isValidPlacement(myBoard, selectedShipType, pos, orientation)) {
      const updated = placeShip(myBoard, selectedShipType, pos, orientation);
      setMyBoard(updated);
      selectNextAvailableShip(updated);
    }
  };

  const handleAutoPlace = () => {
    if (myCommitted) return;
    setMyBoard(generateRandomBoard());
    setSelectedShipType(null);
  };

  const handleResetPlacement = () => {
    if (myCommitted) return;
    setMyBoard(createEmptyBoard());
    setSelectedShipType(FLEET_SHIPS[0]);
  };

  const handleSubmitPlacement = async () => {
    if (placedShipTypes.length !== FLEET_SHIPS.length) return;
    setActionError(null);
    try {
      const merkleResult = await buildBoardMerkleTree(myBoard.ships);
      setMerkleTree(merkleResult);

      await submitCommitmentMutation({
        matchIdBytes32: matchData.matchIdBytes32,
        playerToken: matchData.playerToken,
        boardCommitment: merkleResult.root
      });

      if (isFreeMatch) {
        await confirmStakeMutation({
          matchIdBytes32: matchData.matchIdBytes32,
          playerToken: matchData.playerToken,
          txHash: 'free_zk_match'
        });
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to submit fleet commitment.');
    }
  };

  const handleStakeConfirmed = async (txHash: string) => {
    try {
      await confirmStakeMutation({
        matchIdBytes32: matchData.matchIdBytes32,
        playerToken: matchData.playerToken,
        txHash
      });
    } catch (err: any) {
      setActionError(err?.message || 'Failed to record stake confirmation.');
    }
  };

  const handleFireShot = async (pos: Position) => {
    if (phase !== 'PLAYING' || !liveMatch) return;
    if (liveMatch.currentTurn !== matchData.role || liveMatch.pendingShot || isFiring) return;
    if (enemyOceanTracking[pos.y][pos.x] !== CellStatus.EMPTY) return;

    setActionError(null);
    setIsFiring(true);

    try {
      let txHash: string | undefined;
      if (!isFreeMatch) {
        const coordIndex = pos.y * BOARD_SIZE + pos.x;
        txHash = await CompactContractService.fireShot(matchData.matchIdBytes32, coordIndex);
      }

      await fireShotMutation({
        matchIdBytes32: matchData.matchIdBytes32,
        playerToken: matchData.playerToken,
        x: pos.x,
        y: pos.y,
        txHash
      });
    } catch (err: any) {
      setActionError(err?.message || 'Failed to fire shot.');
    } finally {
      setIsFiring(false);
    }
  };

  const handleClaimTimeoutVictory = async () => {
    setActionError(null);
    setIsClaimPending(true);
    try {
      let hash: string | undefined;
      if (!isFreeMatch) {
        hash = await CompactContractService.claimTimeoutVictory(matchData.matchIdBytes32);
      }
      await claimTimeoutMutation({
        matchIdBytes32: matchData.matchIdBytes32,
        playerToken: matchData.playerToken,
        payoutTxHash: hash
      });
      if (hash) setPayoutTxHash(hash);
    } catch (err: any) {
      setActionError(err?.message || 'Timeout victory claim failed.');
    } finally {
      setIsClaimPending(false);
    }
  };

  const handleClaimWinnerPayout = async () => {
    if (isFreeMatch) return;
    setActionError(null);
    setIsClaimPending(true);
    try {
      const hash = await CompactContractService.claimWinnerPayout(matchData.matchIdBytes32);
      setPayoutTxHash(hash);
      await recordPayoutMutation({
        matchIdBytes32: matchData.matchIdBytes32,
        playerToken: matchData.playerToken,
        payoutTxHash: hash
      });
    } catch (err: any) {
      setActionError(err?.message || 'Winner payout claim failed.');
    } finally {
      setIsClaimPending(false);
    }
  };

  const handleSurrenderMatch = async () => {
    setActionError(null);
    try {
      let txHash: string | undefined;
      if (!isFreeMatch && phase === 'PLAYING') {
        txHash = await CompactContractService.forfeitGame(matchData.matchIdBytes32);
      }
      await forfeitMatchMutation({
        matchIdBytes32: matchData.matchIdBytes32,
        playerToken: matchData.playerToken,
        txHash
      });
      if (phase !== 'PLAYING') {
        onExit();
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to surrender match.');
    }
  };

  const handleCopyMatchCode = () => {
    navigator.clipboard.writeText(matchData.matchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMyTurn = liveMatch?.currentTurn === matchData.role && !liveMatch?.pendingShot;
  const waitingOnOpponentAction =
    phase === 'PLAYING' &&
    liveMatch &&
    (liveMatch.pendingShot
      ? liveMatch.pendingShot.shooter === matchData.role
      : liveMatch.currentTurn !== matchData.role);

  const inactiveSeconds = liveMatch?.lastActionAt
    ? Math.floor((nowMs - liveMatch.lastActionAt) / 1000)
    : 0;
  const canClaimTimeout = !!waitingOnOpponentAction && inactiveSeconds >= 60;

  const isWinner = liveMatch?.winnerRole === matchData.role;
  const effectivePayoutTx = payoutTxHash || liveMatch?.payoutTxHash;
  const totalPayoutNight = (Number(matchData.stakeAmountEth) * 2).toFixed(2);

  const myAccuracy = myShots > 0 ? Math.round((myHits / myShots) * 100) : 0;
  const oppAccuracy = oppShots > 0 ? Math.round((oppHits / oppShots) * 100) : 0;
  const myShipsAlive =
    FLEET_SHIPS.length -
    myBoard.ships.filter((s) => s.sunk || s.hits >= (s.length || SHIP_SIZES[s.type])).length;
  const oppShipsAlive = Math.max(0, 5 - Math.floor(myHits / 3));

  const isValidHover =
    hoverPos && selectedShipType
      ? isValidPlacement(myBoard, selectedShipType, hoverPos, orientation)
      : false;

  const opponentLabel = isHost
    ? liveMatch?.guestName || matchData.player2Name || 'Awaiting Opponent'
    : liveMatch?.hostName || matchData.player1Name;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-80px)] w-full max-w-[1850px] mx-auto px-4 lg:px-8 py-4 space-y-5 font-mono">
      <ProofGenerationOverlay
        isOpen={proofStep !== null}
        step={proofStep || 'WITNESS'}
        message="Computing 100-cell Merkle witness & verifying defending coordinate..."
      />

      {/* Header Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-[#091015] p-3.5 rounded-xl border border-slate-800 text-xs shadow-xl">
        <button
          onClick={onExit}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EXIT MATCH</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyMatchCode}
            className="text-xs text-emerald-400 bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 font-bold flex items-center gap-1.5 cursor-pointer"
            title="Copy Match Code"
          >
            <span>CODE: #{matchData.matchCode}</span>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <span className="text-xs text-emerald-400 bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 font-bold flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            {isFreeMatch ? 'FREE ZK MATCH' : `STAKE: ${matchData.stakeAmountEth} NIGHT`}
          </span>

          {phase === 'PLAYING' && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#050B0E] border border-slate-800 text-[11px] font-bold">
              {liveMatch?.pendingShot ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-400">
                    {liveMatch.pendingShot.shooter === matchData.role
                      ? 'AWAITING DEFENDER ZK MERKLE PROOF...'
                      : 'VERIFYING INCOMING SHOT PROOF...'}
                  </span>
                </>
              ) : isMyTurn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400">YOUR TURN — Target opponent grid</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-400">OPPONENT&apos;S TURN...</span>
                </>
              )}
            </div>
          )}

          {waitingOnOpponentAction && (
            <button
              disabled={!canClaimTimeout || isClaimPending}
              onClick={handleClaimTimeoutVictory}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition ${
                canClaimTimeout
                  ? 'bg-amber-500 text-slate-950 border-amber-400 cursor-pointer hover:bg-amber-400'
                  : 'bg-[#050B0E] text-slate-400 border-slate-800 cursor-not-allowed'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {canClaimTimeout
                  ? 'CLAIM 60s TIMEOUT VICTORY'
                  : `TIMEOUT (${Math.max(0, 60 - inactiveSeconds)}s)`}
              </span>
            </button>
          )}

          {phase === 'FINISHED' && (
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                  isWinner
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                    : 'bg-red-950 border border-red-500 text-red-400'
                }`}
              >
                {isWinner ? (
                  <Trophy className="w-4 h-4 text-amber-400" />
                ) : (
                  <Flame className="w-4 h-4 text-red-400" />
                )}
                <span>WINNER: {isWinner ? 'YOU (VICTORY!)' : 'OPPONENT'}</span>
              </span>

              <button
                onClick={() => setShowStatsModal(true)}
                className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition shadow-md shadow-emerald-500/30 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Accuracy &amp; Claim</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main View Area */}
      {phase === 'CANCELLED' ? (
        <div className="flex flex-col items-center justify-center py-12 w-full max-w-lg mx-auto">
          <div className="w-full bg-[#091015] border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-black text-amber-400">MATCH LOBBY CANCELLED</h3>
            <p className="text-xs text-slate-400 font-sans">
              This match lobby (#{matchData.matchCode}) was closed before battle started. Any locked waiting stake can be reclaimed via <code className="text-emerald-400">cancel_waiting_game</code>.
            </p>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
            >
              RETURN TO MULTIPLAYER LOBBY
            </button>
          </div>
        </div>
      ) : phase === 'STAKING' ? (
        <div className="flex flex-col items-center justify-center py-6 w-full max-w-2xl mx-auto space-y-6">
          <div className="w-full bg-[#091015] border-2 border-emerald-500/40 p-6 rounded-3xl shadow-2xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" />
              <span>MATCH #{matchData.matchCode}</span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Fleet commitment root ready ({boardCommitment?.slice(0, 14)}...). Deposit your NIGHT escrow stake to lock on-chain.
            </p>
          </div>

          <StakingPanel
            matchIdBytes32={matchData.matchIdBytes32}
            stakeAmountEth={matchData.stakeAmountEth}
            role={matchData.role}
            hasStaked={myStaked}
            boardCommitment={boardCommitment}
            onStakeConfirmed={handleStakeConfirmed}
          />
        </div>
      ) : phase === 'PLACEMENT' ? (
        <div className="grid lg:grid-cols-12 gap-6 w-full items-start">
          <div className="lg:col-span-8 flex justify-center">
            <BoardGrid
              title="YOUR WATERS"
              subtitle={
                myCommitted
                  ? 'FLEET COMMITTED — Awaiting opponent readiness...'
                  : 'DEFEND YOUR FLEET — Click to position 5 vessels'
              }
              grid={myBoard.grid}
              ships={myBoard.ships}
              interactive={!myCommitted}
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

            {myCommitted && (
              <div className="w-full bg-[#091015] p-4 rounded-xl border border-emerald-500/40 text-center text-xs text-emerald-400 font-bold space-y-1">
                <div>✓ FLEET COMMITTED ({boardCommitment?.slice(0, 12)}...)</div>
                <div className="text-[10px] text-slate-400 font-sans">
                  {oppCommitted
                    ? oppStaked
                      ? 'Starting battle...'
                      : 'Waiting for opponent NIGHT escrow stake...'
                    : `Waiting for ${opponentLabel} to join & deploy their fleet...`}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Widescreen Console View */
        <div className="grid grid-cols-12 gap-6 w-full items-stretch flex-1">
          <div className="col-span-12 lg:col-span-3">
            <FleetPanel ships={myBoard.ships} onSurrender={handleSurrenderMatch} />
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
                      ? 'BATTLE CONCLUDED'
                      : isMyTurn
                      ? 'SELECT A TARGET COORDINATE'
                      : 'AWAITING OPPONENT'
                  }
                  grid={enemyOceanTracking}
                  ships={[]}
                  isEnemyView={true}
                  revealShips={false}
                  interactive={!!isMyTurn && phase === 'PLAYING' && !isFiring}
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
              playerAddress={address || undefined}
              opponentName={opponentLabel}
              isMyTurn={!!isMyTurn}
              playerShipsLeft={myShipsAlive}
              opponentShipsLeft={oppShipsAlive}
              stakeAmountEth={matchData.stakeAmountEth}
              turnCount={myShots + oppShots}
              logs={liveMatch?.logs || []}
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
              <span
                className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-2 ${
                  isWinner
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                MATCH WINNER: {isWinner ? 'YOU (VICTORY!)' : 'OPPONENT'}
              </span>

              <h3 className="text-2xl font-black text-white">
                {isWinner ? 'NAVAL VICTORY!' : 'FLEET DESTROYED!'}
              </h3>
            </div>

            {isWinner && !isFreeMatch && (
              <div className="mb-6 p-4 bg-[#050B0E] rounded-2xl border border-emerald-500/30 text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Escrow Prize Pool:</span>
                  <span className="text-emerald-400 font-bold text-sm">{totalPayoutNight} NIGHT</span>
                </div>

                {effectivePayoutTx ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Stake Payout Claimed!</span>
                    </div>
                    <a
                      href={`${MIDNIGHT_TESTNET.blockExplorer}/tx/${effectivePayoutTx}`}
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
                        : `Claim ${totalPayoutNight} NIGHT Pooled Stake`}
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
