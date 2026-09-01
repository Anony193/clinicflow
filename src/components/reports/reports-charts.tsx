'use client';

/**
 * Reports Charts Component (TASK-042)
 *
 * Client component that renders recharts visualizations.
 * Recharts requires client-side rendering (uses canvas/SVG).
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CLAIM_COLORS: Record<string, string> = {
  DRAFT: '#6b7280',
  READY: '#3b82f6',
  SUBMITTED: '#f59e0b',
  ACCEPTED: '#10b981',
  PAID: '#059669',
  REJECTED: '#ef4444',
  DENIED: '#dc2626',
};

interface ReportsChartsProps {
  productivity: {
    therapists: Array<{ therapistId: string; therapistName: string; visitCount: number; completedCount: number; soapNoteCount: number }>;
  };
  claimStatus: {
    statuses: Array<{ status: string; count: number; totalChargesCents: number; totalPaidCents: number; totalBalanceCents: number }>;
  };
  outcomes: {
    measures: Array<{ type: string; count: number; avgScore: number; avgPercent: number; minScore: number; maxScore: number }>;
  };
}

export function ReportsCharts({ productivity, claimStatus, outcomes }: ReportsChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Therapist Productivity (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productivity.therapists.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productivity.therapists}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="therapistName" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitCount" name="Visits" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completedCount" name="Completed" fill="#0891b2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="soapNoteCount" name="SOAP Notes" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No therapist data this month</p>
          )}
        </CardContent>
      </Card>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Claim Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {claimStatus.statuses.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={claimStatus.statuses}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: { status: string; count: number }) => `${entry.status}: ${entry.count}`}
                >
                  {claimStatus.statuses.map((entry) => (
                    <Cell key={entry.status} fill={CLAIM_COLORS[entry.status] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No claims yet</p>
          )}
        </CardContent>
      </Card>

      <Card className="elevation-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Patient Outcomes Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outcomes.measures.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Measure</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Count</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Avg Score</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Avg %</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Range</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomes.measures.map((m) => (
                    <tr key={m.type} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium">{m.type}</td>
                      <td className="text-center py-2 px-3">{m.count}</td>
                      <td className="text-center py-2 px-3">{m.avgScore}/{m.maxScore === 100 ? 100 : m.maxScore}</td>
                      <td className="text-center py-2 px-3">{m.avgPercent}%</td>
                      <td className="text-center py-2 px-3 text-muted-foreground">{m.minScore}–{m.maxScore}</td>
                      <td className="text-center py-2 px-3">
                        <Badge variant="outline" className="text-xs">
                          {m.avgPercent < 30 ? 'Good' : m.avgPercent < 60 ? 'Moderate' : 'High disability'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No outcome measures recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
