'use client';

/**
 * Providers — TanStack Query + tRPC client provider (DOC3 §8)
 *
 * Wraps the app with:
 *   - QueryClientProvider (TanStack Query v5)
 *   - trpc.Provider (type-safe API client, zero codegen)
 *
 * The tRPC client uses httpBatchLink to batch requests to /api/trpc,
 * with superjson transformer for Date/BigInt serialization.
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTRPCClient } from '@/lib/trpc/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
}
