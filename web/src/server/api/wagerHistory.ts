import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/server/prisma';

export const wagerHistoryRouter = createTRPCRouter({
  getHistoryByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return prisma.wagerHistory.findMany({
        where: {
          wallet: {
            userId: input.userId,
          },
        },
        include: {
          wallet: {
            select: {
              address: true,
            },
          },
          raffleRound: {
            select: {
              roundId: true,
              prizeAmount: true,
              winner: true,
              endedAt: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getCurrentRoundWallets: publicProcedure.query(async () => {
    const currentRound = await prisma.raffleRound.findFirst({
      where: {
        endedAt: null, // Round still active
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!currentRound) {
      return [];
    }

    return prisma.wagerHistory.findMany({
      where: {
        raffleRoundId: currentRound.id,
      },
      include: {
        wallet: {
          select: {
            address: true,
          },
        },
        raffleRound: {
          select: {
            roundId: true,
            prizeAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        walletId: z.string(),
        wagerAmount: z.number(),
        raffleRoundId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.wagerHistory.create({
        data: {
          walletId: input.walletId,
          wagerAmount: input.wagerAmount,
          raffleRoundId: input.raffleRoundId,
        },
      });
    }),

  createRaffleRound: publicProcedure
    .input(
      z.object({
        roundId: z.number(),
        prizeAmount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.raffleRound.create({
        data: {
          roundId: input.roundId,
          prizeAmount: input.prizeAmount,
        },
      });
    }),

  upsertRaffleRound: publicProcedure
    .input(
      z.object({
        roundId: z.number(),
        prizeAmount: z.number(),
        endedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const now = new Date();
      return prisma.raffleRound.upsert({
        where: {
          roundId: input.roundId,
        },
        update: {
          prizeAmount: input.prizeAmount,
          updatedAt: new Date(),
        },
        create: {
          roundId: input.roundId,
          prizeAmount: input.prizeAmount,
          endedAt: new Date(now.getTime() + 5 * 60000), // 5 minutes from now - As the contract says
        },
      });
    }),

  getRaffleRounds: publicProcedure.query(async () => {
    return prisma.raffleRound.findMany({
      include: {
        winnerWallet: {
          select: {
            address: true,
          },
        },
        _count: {
          select: {
            wagerHistory: true,
          },
        },
      },
      orderBy: { roundId: 'desc' },
    });
  }),

  getTotalWagers: publicProcedure.query(async () => {
    return prisma.wagerHistory.count();
  }),
});
