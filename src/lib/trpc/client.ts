/**
 * tRPC Client (ADR-0004, DOC3 §8)
 *
 * Creates the tRPC React hooks with full type inference from the backend.
 * The frontend types are inferred from AppRouter — zero codegen.
 *
 * Usage in client components:
 *   const stats = trpc.stats.overview.useQuery();
 *   const createPatient = trpc.patients.create.useMutation({
 *     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
 *   });
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

/**
 * Create the tRPC client instance.
 * Called once in the Providers component (src/app/providers.tsx).
 */
export function createTRPCClient() {
  return trpc.createClient({
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
          return {
            'idempotency-key': typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          };
        },
      }),
    ],
  });
}
