/**
 * Audit Log Page (TASK-036)
 * Owner-only — shows all AuditEvents with PHI filter.
 */

import { ScrollText, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serverTRPC } from '@/lib/trpc/server';

export default async function AuditLogPage() {
  let events: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    phi: boolean;
    actorId: string | null;
    ip: string | null;
    createdAt: string;
  }> = [];

  try {
    const result = await serverTRPC((c) => c.settings.auditList({ limit: 50 }));
    events = result.items;
  } catch (error) {
    console.error('Audit log error:', error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          Audit Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All PHI access is logged for HIPAA compliance (append-only, immutable)
        </p>
      </div>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Recent Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No audit events yet</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Action</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Entity</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">PHI</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-3 text-xs text-muted-foreground">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-xs font-medium">{e.action}</td>
                      <td className="py-2 px-3 text-xs">{e.entity}</td>
                      <td className="text-center py-2 px-3">
                        {e.phi && <Badge variant="destructive" className="text-xs">PHI</Badge>}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{e.ip ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
