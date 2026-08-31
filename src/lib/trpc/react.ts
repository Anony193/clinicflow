'use client';

/**
 * tRPC React Hook (ADR-0004, DOC3 §8)
 *
 * Provides the typed tRPC client for use in client components.
 * The types are inferred from the backend AppRouter — zero codegen.
 *
 * Usage:
 *   const trpc = useTRPC();
 *   const { data } = useQuery(trpc.patients.list.infiniteQueryOptions({ ... }));
 *   const mutation = useMutation(trpc.patients.create.mutationOptions({ ... }));
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

/** Hook to access the tRPC client (must be used inside <trpc.Provider>) */
export function useTRPC() {
  return trpc;
}
