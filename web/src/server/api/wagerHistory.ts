import { z } from "zod";
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/server/prisma';

export const wagerHistoryRouter = createTRPCRouter({
  getHistoryByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return prisma.wagerHistory.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        wagerAmount: z.number(),
        prizeAmount: z.number(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.wagerHistory.create({
        data: {
          userId: input.userId,
          wagerAmount: input.wagerAmount,
          prizeAmount: input.prizeAmount,
          endDate: input.endDate,
        },
      });
    }),
}); 