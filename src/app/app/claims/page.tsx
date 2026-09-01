/**
 * Claims Page — list all insurance claims with status + balance
 */

import Link from 'next/link';
import { ClipboardList, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { serverTRPC } from '@/lib/trpc/server';

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock }> = {
  DRAFT: { color: 'secondary', icon: Clock },
  READY: { color: 'secondary', icon: Clock },
  SUBMITTED: { color: 'secondary', icon: Clock },
  ACCEPTED: { color: 'default', icon: CheckCircle2 },
  PAID: { color: 'default', icon: CheckCircle2 },
  REJECTED: { color: 'destructive', icon: AlertCircle },
  DENIED: { color: 'destructive', icon: AlertCircle },
};

export default async function ClaimsPage() {
  let claims: Array<{
    id: string;
    version: number;
    patientName: string;
    payerName: string;
    cptCodes: string[];
    icdCodes: string[];
    chargeAmountCents: number;
    paidAmountCents: number;
    balanceCents: number;
    status: string;
    createdAt: string;
  }> = [];

  try {
    const result = await serverTRPC((c) => c.claims.list({ limit: 50 }));
    claims = result.items;
  } catch (error) {
    console.error('Claims error:', error);
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const totalCharges = claims.reduce((s, c) => s + c.chargeAmountCents, 0);
  const totalPaid = claims.reduce((s, c) => s + c.paidAmountCents, 0);
  const totalOutstanding = claims.reduce((s, c) => s + c.balanceCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Claims
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Insurance claim management and status tracking
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="elevation-1">
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Total Charges</div>
            <div className="text-xl font-bold">{formatCurrency(totalCharges)}</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Collected</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card className="elevation-1">
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Outstanding</div>
            <div className="text-xl font-bold text-amber-600">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Claims list */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md">All Claims ({claims.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No claims yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a claim from a completed SOAP note
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Patient</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Payer</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">CPT</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Charge</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Paid</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Balance</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => {
                    const config = STATUS_CONFIG[claim.status] ?? { color: 'secondary', icon: Clock };
                    return (
                      <tr key={claim.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{claim.patientName}</td>
                        <td className="py-2 px-3 text-muted-foreground">{claim.payerName}</td>
                        <td className="py-2 px-3 text-xs">{claim.cptCodes.join(', ')}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(claim.chargeAmountCents)}</td>
                        <td className="py-2 px-3 text-right text-green-600">{formatCurrency(claim.paidAmountCents)}</td>
                        <td className="py-2 px-3 text-right text-amber-600">{formatCurrency(claim.balanceCents)}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant={config.color as 'default' | 'secondary' | 'destructive'} className="text-xs">
                            {claim.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
