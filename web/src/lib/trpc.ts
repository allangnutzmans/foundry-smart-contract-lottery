'use client';

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/api/_root';

export const api = createTRPCReact<AppRouter>();

export const client = api.createClient({
  links: [
    httpBatchLink<AppRouter>({
      url: '/api/trpc',
      transformer: superjson,
    }),
  ],
});
