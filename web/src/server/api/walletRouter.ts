import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/trpc';
import { prisma } from '@/server/prisma';

export const walletRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.wallet.create({
        data: {
          address: input.address.toLowerCase(),
        },
      });
    }),

  getByAddress: publicProcedure
    .input(z.object({ address: z.string().startsWith('0x') }))
    .query(async ({ input }) => {
      return prisma.wallet.findUnique({
        where: { address: input.address.toLowerCase() },
      });
    }),

  getTop10Wagers: publicProcedure.query(async () => {
    // Get the active round
    let currentRound = await prisma.raffleRound.findFirst({
      where: {
        endedAt: null, // Round still active - TODO FIX THIS, now the contract upserts the ended at, so compare with the date or something like this
      },
      orderBy: { createdAt: 'desc' },
    });

    // No active round, get the last round
    if (!currentRound) {
      currentRound = await prisma.raffleRound.findFirst({
        where: {
          endedAt: { not: null },
        },
        orderBy: { endedAt: 'desc' },
      });
    }

    if (!currentRound) {
      return [];
    }

    // Agrupa as apostas do round atual por wallet
    const topWallets = await prisma.wagerHistory.groupBy({
      by: ['walletId'],
      where: {
        raffleRoundId: currentRound.id,
      },
      _sum: {
        wagerAmount: true,
      },
      _max: {
        createdAt: true,
      },
      orderBy: {
        _sum: {
          wagerAmount: 'desc',
        },
      },
      take: 10,
    });

    const walletIds = topWallets.map((w) => w.walletId);

    const wallets = await prisma.wallet.findMany({
      where: {
        id: { in: walletIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return topWallets.map((top) => {
      const wallet = wallets.find((w) => w.id === top.walletId);
      return {
        walletId: top.walletId,
        totalWager: top._sum.wagerAmount ?? 0,
        user: wallet?.user ?? null,
        address: wallet?.address ?? null,
        timeLastWager: top._max.createdAt ?? new Date(),
        roundId: currentRound.roundId, // Include round info
      };
    });
  }),
  connectWallet: protectedProcedure
    .input(z.object({ wallet: z.string().startsWith('0x') }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;

      const existingWallet = await prisma.wallet.findUnique({
        where: { address: input.wallet.toLowerCase() },
      });

      if (existingWallet && existingWallet.userId !== user.id) {
        throw new Error('This wallet is already linked with another user.');
      }

      if (existingWallet) return existingWallet;

      return prisma.wallet.create({
        data: {
          address: input.wallet.toLowerCase(),
          userId: user.id,
        },
      });
    }),
});
