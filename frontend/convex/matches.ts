import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const TOTAL_FLEET_CELLS = 17;
const DISPUTE_TIMEOUT_MS = 60_000;

function formatLogTime(): string {
  return new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
}

function formatCoord(x: number, y: number): string {
  return `${String.fromCharCode(65 + x)}${y + 1}`;
}

function resolveCallerRole(
  match: { hostToken: string; guestToken?: string },
  playerToken: string
): 'host' | 'guest' {
  if (playerToken === match.hostToken) return 'host';
  if (match.guestToken && playerToken === match.guestToken) return 'guest';
  throw new Error('Unauthorized: invalid player session token for this match');
}

// Query list of open waiting lobbies for multiplayer lobby
export const listOpenLobbies = query({
  args: {},
  handler: async (ctx) => {
    const waiting = await ctx.db
      .query('matches')
      .withIndex('by_status', (q) => q.eq('status', 'WAITING'))
      .order('desc')
      .take(20);

    const open = await ctx.db
      .query('matches')
      .withIndex('by_status', (q) => q.eq('status', 'OPEN'))
      .order('desc')
      .take(20);

    return [...open, ...waiting].sort((a, b) => b.createdAt - a.createdAt);
  }
});

// Query active (in-progress / staking / placement) matches
export const listActiveMatches = query({
  args: {},
  handler: async (ctx) => {
    const statuses = ['OPEN', 'WAITING', 'STAKING', 'PLACEMENT', 'PLAYING', 'IN_PROGRESS'] as const;
    const results = await Promise.all(
      statuses.map((status) =>
        ctx.db
          .query('matches')
          .withIndex('by_status', (q) => q.eq('status', status))
          .order('desc')
          .take(15)
      )
    );
    return results.flat().sort((a, b) => b.createdAt - a.createdAt).slice(0, 25);
  }
});

// Query finished matches for match history modal
export const listMatchHistory = query({
  args: { address: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const finished = await ctx.db
      .query('matches')
      .withIndex('by_status', (q) => q.eq('status', 'FINISHED'))
      .order('desc')
      .take(50);

    if (!args.address) return finished.slice(0, 20);
    return finished
      .filter((m) => m.hostAddress === args.address || m.guestAddress === args.address)
      .slice(0, 20);
  }
});

// Aggregate leaderboard from finished Convex matches
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const finished = await ctx.db
      .query('matches')
      .withIndex('by_status', (q) => q.eq('status', 'FINISHED'))
      .order('desc')
      .take(200);

    const stats = new Map<
      string,
      { address: string; wins: number; matches: number; totalNightWon: number; totalHits: number; totalShots: number }
    >();

    for (const match of finished) {
      const stake = Number(match.stakeAmountEth) || 0;
      const hostEntry = stats.get(match.hostAddress) || {
        address: match.hostAddress,
        wins: 0,
        matches: 0,
        totalNightWon: 0,
        totalHits: 0,
        totalShots: 0
      };
      hostEntry.matches += 1;

      const shots = match.shots || [];
      for (const s of shots) {
        if (s.shooter === 'host') {
          hostEntry.totalShots += 1;
          if (s.hit) hostEntry.totalHits += 1;
        }
      }

      if (match.winnerAddress === match.hostAddress) {
        hostEntry.wins += 1;
        hostEntry.totalNightWon += stake * 2;
      }
      stats.set(match.hostAddress, hostEntry);

      if (match.guestAddress) {
        const guestEntry = stats.get(match.guestAddress) || {
          address: match.guestAddress,
          wins: 0,
          matches: 0,
          totalNightWon: 0,
          totalHits: 0,
          totalShots: 0
        };
        guestEntry.matches += 1;

        for (const s of shots) {
          if (s.shooter === 'guest') {
            guestEntry.totalShots += 1;
            if (s.hit) guestEntry.totalHits += 1;
          }
        }

        if (match.winnerAddress === match.guestAddress) {
          guestEntry.wins += 1;
          guestEntry.totalNightWon += stake * 2;
        }
        stats.set(match.guestAddress, guestEntry);
      }
    }

    return Array.from(stats.values())
      .sort((a, b) => b.wins - a.wins || b.totalNightWon - a.totalNightWon)
      .slice(0, 20)
      .map((entry) => ({
        ...entry,
        accuracy: entry.totalShots > 0 ? Math.round((entry.totalHits / entry.totalShots) * 100) : 0
      }));
  }
});

// Query single match state by matchIdBytes32
export const getMatchByBytes32 = query({
  args: { matchIdBytes32: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();
  }
});

// Query single match by 6-char matchCode
export const getMatchByCode = query({
  args: { matchCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('matches')
      .withIndex('by_matchCode', (q) => q.eq('matchCode', args.matchCode.toUpperCase()))
      .first();
  }
});

// Mutation to host a new open game lobby
export const createLobby = mutation({
  args: {
    matchIdBytes32: v.string(),
    matchCode: v.optional(v.string()),
    stakeAmountEth: v.string(),
    hostAddress: v.string(),
    hostName: v.optional(v.string()),
    hostToken: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (existing) return existing._id;

    const code = (args.matchCode || args.matchIdBytes32.slice(-6)).toUpperCase();
    const now = Date.now();

    return await ctx.db.insert('matches', {
      matchIdBytes32: args.matchIdBytes32,
      matchCode: code,
      stakeAmountEth: args.stakeAmountEth,
      playerCount: 1,
      status: 'OPEN',
      hostAddress: args.hostAddress,
      hostName: args.hostName || 'Host Admiral',
      hostToken: args.hostToken,
      hostStaked: false,
      guestStaked: false,
      hostReady: false,
      guestReady: false,
      hostHits: 0,
      guestHits: 0,
      shots: [],
      lastActionAt: now,
      logs: [
        {
          id: `${now}-1`,
          sender: 'PLAYER',
          message: `Open match #${code} created by ${args.hostAddress.slice(0, 6)}...${args.hostAddress.slice(-4)}`,
          timestamp: formatLogTime(),
          type: 'info'
        }
      ],
      createdAt: now
    });
  }
});

// Mutation for guest to join match by matchIdBytes32 or matchCode
export const joinLobby = mutation({
  args: {
    matchIdBytes32: v.optional(v.string()),
    matchCode: v.optional(v.string()),
    guestAddress: v.string(),
    guestName: v.optional(v.string()),
    guestToken: v.string()
  },
  handler: async (ctx, args) => {
    let match = args.matchIdBytes32
      ? await ctx.db
          .query('matches')
          .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32!))
          .first()
      : null;

    if (!match && args.matchCode) {
      match = await ctx.db
        .query('matches')
        .withIndex('by_matchCode', (q) => q.eq('matchCode', args.matchCode!.toUpperCase()))
        .first();
    }

    if (!match) {
      throw new Error('Match not found. Verify the 6-character match code.');
    }
    if (match.guestAddress && match.guestAddress !== args.guestAddress) {
      throw new Error('Match already has 2 players.');
    }
    if (match.hostAddress === args.guestAddress) {
      throw new Error('Host cannot join their own match as guest.');
    }

    const now = Date.now();
    await ctx.db.patch(match._id, {
      guestAddress: args.guestAddress,
      guestName: args.guestName || 'Challenger',
      guestToken: args.guestToken,
      playerCount: 2,
      status: match.hostStaked ? 'STAKING' : 'STAKING',
      lastActionAt: now,
      logs: [
        {
          id: `${now}-join`,
          sender: 'OPPONENT',
          message: `Challenger (${args.guestAddress.slice(0, 6)}...${args.guestAddress.slice(-4)}) joined match!`,
          timestamp: formatLogTime(),
          type: 'info'
        },
        ...match.logs
      ]
    });

    return {
      matchDocId: match._id,
      matchIdBytes32: match.matchIdBytes32,
      matchCode: match.matchCode || match.matchIdBytes32.slice(-6).toUpperCase(),
      stakeAmountEth: match.stakeAmountEth,
      hostName: match.hostName || 'Host Admiral'
    };
  }
});

// Record escrow stake tx confirmation for host or guest
export const confirmStake = mutation({
  args: {
    matchIdBytes32: v.string(),
    playerToken: v.string(),
    txHash: v.string()
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');
    const role = resolveCallerRole(match, args.playerToken);
    const now = Date.now();

    const hostStaked = role === 'host' ? true : !!match.hostStaked;
    const guestStaked = role === 'guest' ? true : !!match.guestStaked;
    const bothStaked = hostStaked && guestStaked;

    await ctx.db.patch(match._id, {
      hostStaked,
      guestStaked,
      hostStakeTxHash: role === 'host' ? args.txHash : match.hostStakeTxHash,
      guestStakeTxHash: role === 'guest' ? args.txHash : match.guestStakeTxHash,
      status: bothStaked ? 'PLACEMENT' : match.status === 'OPEN' ? 'OPEN' : 'STAKING',
      lastActionAt: now,
      logs: [
        {
          id: `${now}-stake-${role}`,
          sender: role === 'host' ? 'PLAYER' : 'OPPONENT',
          message: `${role === 'host' ? 'Host' : 'Guest'} stake confirmed (${args.txHash.slice(0, 10)}...)`,
          timestamp: formatLogTime(),
          type: 'info'
        },
        ...match.logs
      ]
    });
  }
});

// Commit 100-cell Merkle root (private ship placement remains on player's device)
export const submitCommitment = mutation({
  args: {
    matchIdBytes32: v.string(),
    playerToken: v.string(),
    boardCommitment: v.string()
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');
    const role = resolveCallerRole(match, args.playerToken);
    const now = Date.now();

    const hostReady = role === 'host' ? true : !!match.hostReady;
    const guestReady = role === 'guest' ? true : !!match.guestReady;
    const bothReady = hostReady && guestReady;

    await ctx.db.patch(match._id, {
      hostCommitment: role === 'host' ? args.boardCommitment : match.hostCommitment,
      guestCommitment: role === 'guest' ? args.boardCommitment : match.guestCommitment,
      hostReady,
      guestReady,
      status: bothReady ? 'PLAYING' : 'PLACEMENT',
      currentTurn: bothReady ? 'host' : match.currentTurn,
      lastActionAt: now,
      logs: [
        {
          id: `${now}-commit-${role}`,
          sender: role === 'host' ? 'PLAYER' : 'OPPONENT',
          message: bothReady
            ? 'Both fleets committed via ZK Merkle roots! Battle engaged — Host fires first.'
            : `${role === 'host' ? 'Host' : 'Guest'} committed private fleet (${args.boardCommitment.slice(0, 12)}...).`,
          timestamp: formatLogTime(),
          type: 'info'
        },
        ...match.logs
      ]
    });
  }
});

// Fire a shot at opponent coordinate (x, y in 0..9)
export const fireShot = mutation({
  args: {
    matchIdBytes32: v.string(),
    playerToken: v.string(),
    x: v.number(),
    y: v.number(),
    txHash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');
    if (match.status !== 'PLAYING') throw new Error('Match is not in PLAYING phase');
    if (match.pendingShot) throw new Error('Previous shot is awaiting defender proof resolution');

    const role = resolveCallerRole(match, args.playerToken);
    if (match.currentTurn !== role) throw new Error('Not your turn');
    if (args.x < 0 || args.x > 9 || args.y < 0 || args.y > 9) throw new Error('Invalid coordinates');

    const existingShots = match.shots || [];
    if (existingShots.some((s) => s.shooter === role && s.x === args.x && s.y === args.y)) {
      throw new Error('Coordinate already targeted');
    }

    const now = Date.now();
    await ctx.db.patch(match._id, {
      pendingShot: {
        shooter: role,
        x: args.x,
        y: args.y,
        firedAt: now,
        txHash: args.txHash
      },
      lastActionAt: now
    });
  }
});

// Defender submits Merkle-verified shot outcome
export const resolveShot = mutation({
  args: {
    matchIdBytes32: v.string(),
    playerToken: v.string(),
    x: v.number(),
    y: v.number(),
    hit: v.boolean(),
    sunkShipType: v.optional(v.string()),
    proofVerified: v.boolean(),
    merkleRoot: v.string(),
    resolveTxHash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');
    if (match.status !== 'PLAYING' || !match.pendingShot) {
      throw new Error('No pending shot to resolve');
    }

    const defenderRole = resolveCallerRole(match, args.playerToken);
    if (defenderRole === match.pendingShot.shooter) {
      throw new Error('Only the defending player can resolve a shot');
    }
    if (match.pendingShot.x !== args.x || match.pendingShot.y !== args.y) {
      throw new Error('Pending shot coordinate mismatch');
    }

    const expectedCommitment =
      defenderRole === 'host' ? match.hostCommitment : match.guestCommitment;
    if (expectedCommitment && args.merkleRoot !== expectedCommitment) {
      throw new Error('Merkle root does not match committed board root');
    }
    if (!args.proofVerified) {
      throw new Error('Merkle proof verification failed');
    }

    const shooter = match.pendingShot.shooter;
    const hostHits = (match.hostHits || 0) + (shooter === 'host' && args.hit ? 1 : 0);
    const guestHits = (match.guestHits || 0) + (shooter === 'guest' && args.hit ? 1 : 0);
    const isGameOver = hostHits >= TOTAL_FLEET_CELLS || guestHits >= TOTAL_FLEET_CELLS;

    const winnerRole = isGameOver ? shooter : undefined;
    const winnerAddress = isGameOver
      ? shooter === 'host'
        ? match.hostAddress
        : match.guestAddress
      : undefined;

    const coord = formatCoord(args.x, args.y);
    const now = Date.now();
    const outcomeText = args.hit
      ? args.sunkShipType
        ? `SUNK ${args.sunkShipType}!`
        : 'HIT'
      : 'MISS';

    await ctx.db.patch(match._id, {
      pendingShot: undefined,
      shots: [
        ...(match.shots || []),
        {
          shooter,
          x: args.x,
          y: args.y,
          hit: args.hit,
          sunkShipType: args.sunkShipType,
          proofVerified: args.proofVerified,
          merkleRoot: args.merkleRoot,
          resolveTxHash: args.resolveTxHash,
          timestamp: now
        }
      ],
      hostHits,
      guestHits,
      currentTurn: isGameOver ? match.currentTurn : shooter === 'host' ? 'guest' : 'host',
      status: isGameOver ? 'FINISHED' : 'PLAYING',
      winnerRole,
      winnerAddress,
      lastActionAt: now,
      logs: [
        {
          id: `${now}-res`,
          sender: shooter === 'host' ? 'PLAYER' : 'OPPONENT',
          message: `${shooter === 'host' ? 'Host' : 'Guest'} fired at ${coord} — ${outcomeText} (ZK Merkle Proof Verified)`,
          timestamp: formatLogTime(),
          type: args.hit ? (args.sunkShipType ? 'sunk' : 'hit') : 'miss'
        },
        ...match.logs
      ]
    });
  }
});

// Claim 60-second inactivity timeout victory when opponent fails to act
export const claimTimeoutVictory = mutation({
  args: {
    matchIdBytes32: v.string(),
    playerToken: v.string(),
    payoutTxHash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');
    if (match.status !== 'PLAYING') throw new Error('Match is not active');

    const callerRole = resolveCallerRole(match, args.playerToken);
    const now = Date.now();
    const elapsed = now - (match.lastActionAt || match.createdAt);

    // Waiting on opponent: either opponent's turn to fire, or opponent is defender on pendingShot
    const waitingOnOpponent = match.pendingShot
      ? match.pendingShot.shooter === callerRole
      : match.currentTurn !== callerRole;

    if (!waitingOnOpponent) {
      throw new Error('Cannot claim timeout while it is your own action');
    }
    if (elapsed < DISPUTE_TIMEOUT_MS) {
      const remaining = Math.ceil((DISPUTE_TIMEOUT_MS - elapsed) / 1000);
      throw new Error(`Dispute timeout requires 60s opponent inactivity (${remaining}s remaining).`);
    }

    const winnerAddress = callerRole === 'host' ? match.hostAddress : match.guestAddress;

    await ctx.db.patch(match._id, {
      status: 'FINISHED',
      winnerRole: callerRole,
      winnerAddress,
      payoutTxHash: args.payoutTxHash,
      lastActionAt: now,
      logs: [
        {
          id: `${now}-timeout`,
          sender: 'PLAYER',
          message: `60s Dispute Timeout claimed by ${callerRole === 'host' ? 'Host' : 'Guest'}.`,
          timestamp: formatLogTime(),
          type: 'sunk'
        },
        ...match.logs
      ]
    });
  }
});

// Record winner escrow claim transaction hash
export const recordPayout = mutation({
  args: {
    matchIdBytes32: v.string(),
    playerToken: v.string(),
    payoutTxHash: v.string()
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');
    const role = resolveCallerRole(match, args.playerToken);
    if (match.winnerRole !== role) {
      throw new Error('Only the verified winner can record payout');
    }

    await ctx.db.patch(match._id, {
      payoutTxHash: args.payoutTxHash
    });
  }
});

// Voluntary forfeit / surrender in an active match
export const forfeitMatch = mutation({
  args: {
    matchIdBytes32: v.string(),
    playerToken: v.string(),
    txHash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');
    if (match.status === 'FINISHED' || match.status === 'CANCELLED') {
      return;
    }

    const callerRole = resolveCallerRole(match, args.playerToken);
    const now = Date.now();

    if (match.status === 'OPEN' || match.status === 'WAITING') {
      await ctx.db.patch(match._id, {
        status: 'CANCELLED',
        lastActionAt: now,
        logs: [
          {
            id: `${now}-cancel`,
            sender: 'PLAYER',
            message: 'Host cancelled open match lobby.',
            timestamp: formatLogTime(),
            type: 'info'
          },
          ...match.logs
        ]
      });
      return;
    }

    const winnerRole: 'host' | 'guest' = callerRole === 'host' ? 'guest' : 'host';
    const winnerAddress = winnerRole === 'host' ? match.hostAddress : match.guestAddress;

    await ctx.db.patch(match._id, {
      status: 'FINISHED',
      winnerRole,
      winnerAddress,
      payoutTxHash: args.txHash,
      lastActionAt: now,
      logs: [
        {
          id: `${now}-forfeit`,
          sender: callerRole === 'host' ? 'PLAYER' : 'OPPONENT',
          message: `${callerRole === 'host' ? 'Host' : 'Guest'} surrendered — ${winnerRole === 'host' ? 'Host' : 'Guest'} wins!`,
          timestamp: formatLogTime(),
          type: 'sunk'
        },
        ...match.logs
      ]
    });
  }
});

