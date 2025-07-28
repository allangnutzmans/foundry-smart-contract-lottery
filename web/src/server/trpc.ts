import { PrismaClient } from '@/generated/prisma';
import {initTRPC} from "@trpc/server";
import superjson from "superjson";

export interface Context {
  db: PrismaClient;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
