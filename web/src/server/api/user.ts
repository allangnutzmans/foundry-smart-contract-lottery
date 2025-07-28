import { z } from "zod";
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/server/prisma';


export const userRouter = createTRPCRouter({
  getByWallet: publicProcedure
    .input(z.object({ wallet: z.string() }))
    .query(async ({ input }) => {
      return prisma.user.findUnique({
        where: { wallet: input.wallet },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        wallet: z.string(),
        nickname: z.string().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          wallet: input.wallet,
          nickname: input.nickname,
          avatar: input.avatar,
        },
      });
    }),
});
