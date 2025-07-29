import { PrismaClient } from '@/generated/prisma';
import {initTRPC} from "@trpc/server";
import superjson from "superjson";
import { ZodError } from 'zod';

export interface Context {
  db: PrismaClient;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const createTRPCContext = async ({
  headers,
}: {
  headers: Headers;
}) => {
  const db = new PrismaClient();
  return {
    db,
  };
};
