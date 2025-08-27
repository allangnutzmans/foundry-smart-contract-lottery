import { PrismaClient } from '@prisma/client';

// Fix for the deployment
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // opcional, para debugging
  });

// sempre cache em desenvolvimento
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
