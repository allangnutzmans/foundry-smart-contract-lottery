import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/trpc';
import { prisma } from '@/server/prisma';

export const userRouter = createTRPCRouter({
  getByWallet: publicProcedure
    .input(z.object({ wallet: z.string().startsWith("0x") }))
    .query(async ({ input }) => {
      return prisma.wallet.findUnique({
        where: { address: input.wallet.toLowerCase() },
        include: {
          user: true,
        },
      });
    }),

  linkWallet: protectedProcedure
    .input(z.object({
      address: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const address = input.address.toLowerCase();

      const existingWallet = await ctx.prisma.wallet.findUnique({
        where: { address },
      });

      if (existingWallet) {
        if (!existingWallet.userId) {
          await ctx.prisma.wallet.update({
            where: { address },
            data: { userId },
          });
        } else if (existingWallet.userId !== userId) {
          throw new Error('This wallet is already linked with another user.');
        }
      } else {
        await ctx.prisma.wallet.create({
          data: {
            address,
            user: { connect: { id: userId } },
          },
        });
      }

      return { success: true };
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.user.findUnique({
        where: { id: input.id },
        include: {
          wallets: true,
        },
      });
    }),
});
