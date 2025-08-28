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
  const currentRound = await prisma.raffleRound.findFirst({
    where: {
      OR: [
        { endedAt: null },           // active round
        { endedAt: { not: null } },  // ended round
      ],
    },
    orderBy: [
      { endedAt: "desc" },           // priority to rounds recent ended rounds
      { createdAt: "desc" },         // fallback to rounds recent open rounds
    ],
  });

    if (!currentRound) {
      return [];
    }

    const topWallets = await prisma.wagerHistory.groupBy({
      by: ["walletId"],
      where: { raffleRoundId: currentRound.id },
      _sum: { wagerAmount: true },
      _max: { createdAt: true },
      orderBy: { _sum: { wagerAmount: "desc" } },
      take: 10,
    });

    type TopWallet = (typeof topWallets)[number];

    const walletIds = topWallets.map((w: TopWallet) => w.walletId);

    const wallets = await prisma.wallet.findMany({
      where: { id: { in: walletIds } },
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

    type GetTop10WagersOutput = {
      walletId: TopWallet["walletId"];
      totalWager: number;
      user: typeof wallets[number]["user"] | null;
      address: string | null;
      timeLastWager: Date;
      roundId: number;
    };

    const result: GetTop10WagersOutput[] = topWallets.map((top: TopWallet) => {
      const wallet = wallets.find((w: typeof wallets[number]) => w.id === top.walletId);
      return {
        walletId: top.walletId,
        totalWager: top._sum.wagerAmount ?? 0,
        user: wallet?.user ?? null,
        address: wallet?.address ?? null,
        timeLastWager: top._max.createdAt ?? new Date(),
        roundId: currentRound?.roundId ?? 0,
      };
    });

    return result;
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
