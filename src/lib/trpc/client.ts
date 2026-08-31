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
      // Log requests in development
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      // Batch requests to /api/trpc
      httpBatchLink({
        url: '/api/trpc',
        transformer: superjson,
        // Attach the demo tenant header in development (TASK-013 will replace with session cookie)
        headers() {
          if (process.env.NODE_ENV === 'development') {
            const demoTenantId =
              typeof document !== 'undefined'
                ? document.cookie
                    .match(/demo-tenant-id=([^;]+)/)?.[1]
                : undefined;
            if (demoTenantId) {
              return { 'x-demo-tenant-id': demoTenantId };
            }
          }
          return {};
        },
      }),
    ],
  });
}
