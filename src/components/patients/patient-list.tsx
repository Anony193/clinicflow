'use client';

/**
 * Patient List Component (TASK-019)
 *
 * Uses TanStack Query via tRPC React hooks (DOC3 §8).
 * Features:
 *   - Search (debounced 300ms)
 *   - Cursor pagination (DOC3 §9.2)
 *   - Loading/error states
 *   - Click row → navigate to detail
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/react';
import { Search, Users, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PatientList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Debounce search (300ms)
  const debounce = useCallback((value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setCursor(undefined); // reset pagination on new search
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading, error, isFetching } = trpc.patients.list.useQuery({
    search: debouncedSearch || undefined,
    cursor,
    limit: 20,
  });

  const patients = data?.items ?? [];
  const hasNextPage = data?.nextCursor != null;

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name, email, phone, or MRN..."
          value={search}
          onChange={(e) => debounce(e.target.value)}
          className="pl-9 motion-base"
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-50">
              <CardContent className="flex items-center gap-3 py-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-48 rounded bg-muted animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            Error loading patients: {error.message}
          </CardContent>
        </Card>
      ) : patients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No patients found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search
                ? `No patients match "${search}"`
                : 'Get started by adding your first patient'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-xs text-muted-foreground">
            {patients.length} patient{patients.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </div>
          <div className="flex flex-col gap-2">
            {patients.map((patient) => (
              <Link key={patient.id} href={`/app/patients/${patient.id}`}>
                <Card className="motion-base hover:elevation-2 cursor-pointer">
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {patient.firstName.charAt(0)}
                        {patient.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {patient.firstName} {patient.lastName}
                          </span>
                          {patient.status !== 'active' && (
                            <Badge variant="secondary" className="text-xs">
                              {patient.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {patient.email && <span className="truncate">{patient.email}</span>}
                          {patient.phone && <span>{patient.phone}</span>}
                          {patient.mrn && <span>MRN: {patient.mrn}</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setCursor(data?.nextCursor ?? undefined)}
                disabled={isFetching}
                className="motion-base"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
