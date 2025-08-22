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
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        walletId: z.string(),
        wagerAmount: z.number(),
        prizeAmount: z.number(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.wagerHistory.create({
        data: {
          walletId: input.walletId,
          wagerAmount: input.wagerAmount,
          prizeAmount: input.prizeAmount,
          endDate: input.endDate,
        },
      });
    }),
});
