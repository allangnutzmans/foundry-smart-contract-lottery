import { PrismaClient } from '@prisma/client';

export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query'],
  });

// Cache em desenvolvimento
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
