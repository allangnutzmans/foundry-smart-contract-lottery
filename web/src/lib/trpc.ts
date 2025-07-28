'use client'

import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import {AppRouter} from "@/server/api/_root";

export const trpc = createTRPCReact<AppRouter>()

export const client = trpc.createClient({
  links: [
    httpBatchLink<AppRouter>({
      url: '/api/trpc',
      transformer: superjson,
    }),
  ],
})
