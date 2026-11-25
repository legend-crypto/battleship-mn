import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  matches: defineTable({
    matchIdBytes32: v.string(),
    matchCode: v.optional(v.string()),
    stakeAmountEth: v.string(),
    playerCount: v.optional(v.number()),
    status: v.union(
      v.literal('OPEN'),
      v.literal('WAITING'),
      v.literal('STAKING'),
      v.literal('PLACEMENT'),
      v.literal('PLAYING'),
      v.literal('IN_PROGRESS'),
      v.literal('FINISHED'),
      v.literal('CANCELLED')
    ),
    hostAddress: v.string(),
    hostName: v.optional(v.string()),
    hostToken: v.string(),
    guestAddress: v.optional(v.string()),
    guestName: v.optional(v.string()),
    guestToken: v.optional(v.string()),

    // Escrow & ZK Commitment state (private ship coordinates stay client-side)
    hostStaked: v.optional(v.boolean()),
    guestStaked: v.optional(v.boolean()),
    hostStakeTxHash: v.optional(v.string()),
    guestStakeTxHash: v.optional(v.string()),
    hostCommitment: v.optional(v.string()),
    guestCommitment: v.optional(v.string()),
    hostReady: v.optional(v.boolean()),
    guestReady: v.optional(v.boolean()),

    // Turn & ZK-verified shot history
    currentTurn: v.optional(v.union(v.literal('host'), v.literal('guest'))),
    pendingShot: v.optional(
      v.object({
        shooter: v.union(v.literal('host'), v.literal('guest')),
        x: v.number(),
        y: v.number(),
        firedAt: v.number(),
        txHash: v.optional(v.string())
      })
    ),
    shots: v.optional(
      v.array(
        v.object({
          shooter: v.union(v.literal('host'), v.literal('guest')),
          x: v.number(),
          y: v.number(),
          hit: v.boolean(),
          sunkShipType: v.optional(v.string()),
          proofVerified: v.boolean(),
          merkleRoot: v.string(),
          resolveTxHash: v.optional(v.string()),
          timestamp: v.number()
        })
      )
    ),
    hostHits: v.optional(v.number()),
    guestHits: v.optional(v.number()),
    lastActionAt: v.optional(v.number()),

    // Legacy optional board fields kept for backward schema compatibility
    hostBoard: v.optional(v.string()),
    guestBoard: v.optional(v.string()),
    hostTracking: v.optional(v.string()),
    guestTracking: v.optional(v.string()),

    winnerRole: v.optional(v.union(v.literal('host'), v.literal('guest'))),
    winnerAddress: v.optional(v.string()),
    payoutSignature: v.optional(v.string()),
    payoutTxHash: v.optional(v.string()),

    logs: v.array(
      v.object({
        id: v.string(),
        sender: v.union(v.literal('PLAYER'), v.literal('AI'), v.literal('OPPONENT')),
        message: v.string(),
        timestamp: v.string(),
        type: v.union(v.literal('hit'), v.literal('miss'), v.literal('sunk'), v.literal('info'))
      })
    ),
    createdAt: v.number()
  })
    .index('by_status', ['status'])
    .index('by_matchId', ['matchIdBytes32'])
    .index('by_matchCode', ['matchCode'])
});
