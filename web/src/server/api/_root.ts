import { createTRPCRouter } from '@/server/trpc';
import { userRouter } from '@/server/api/user';
import { wagerHistoryRouter } from '@/server/api/wagerHistory';

export const appRouter = createTRPCRouter({
  user: userRouter,
  wagerHistory: wagerHistoryRouter,
});
export type AppRouter = typeof appRouter;