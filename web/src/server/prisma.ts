import { PrismaClient } from '@prisma/client';

export const prisma: PrismaClient =
  global.prisma ??
  new PrismaClient({
    log: ['query'],
  });

// Cache em desenvolvimento
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
