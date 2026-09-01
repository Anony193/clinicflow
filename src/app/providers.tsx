'use client';

/**
 * Providers — TanStack Query + tRPC client provider (DOC3 §8)
 *
 * Wraps the app with:
 *   - QueryClientProvider (TanStack Query v5)
 *   - trpc.Provider (type-safe API client, zero codegen)
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import { trpc } from '@/lib/trpc/react';
import type { AppRouter } from '@/server/routers/_app';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
          headers() {
            // Generate an Idempotency-Key for each batch of mutations (Constraint #3)
            // This prevents duplicate records from double-clicks or network retries
            return {
              'idempotency-key': typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
