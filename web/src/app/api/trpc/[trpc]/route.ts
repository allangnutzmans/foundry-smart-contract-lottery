import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/_root';
import { createTRPCContext } from '@/server/trpc';

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })
}
export const config = {
  regions: ['gru1'], // São Paulo
};


export { handler as GET, handler as POST }
