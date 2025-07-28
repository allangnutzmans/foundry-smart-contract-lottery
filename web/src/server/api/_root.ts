import {z} from "zod";
import { createTRPCRouter } from '@/server/trpc';

export const appRouter = createTRPCRouter({
    hello: publicProcedure
        .input(z.object({name: z.string().optional()}))
        .query(({input}) => {
            return {message: `Hello, ${input.name ?? 'world'}!`}
        }),
})
export type AppRouter = typeof appRouter