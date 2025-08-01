import { createTRPCRouter } from '@/server/trpc';
import { userRouter } from '@/server/api/user';
import { walletRouter } from '@/server/api/walletRouter';
import { wagerHistoryRouter } from '@/server/api/wagerHistory';

export const appRouter = createTRPCRouter({
  user: userRouter,
  wallet: walletRouter,
  wagerHistory: wagerHistoryRouter,
});
export type AppRouter = typeof appRouter;