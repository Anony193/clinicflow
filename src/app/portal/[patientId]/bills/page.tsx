/**
 * Patient Portal — Bills (TASK-040)
 *
 * Shows outstanding claims with balances + a simple "Pay" button.
 * In production, this would integrate Stripe Checkout.
 */

import Link from 'next/link';
import { CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { baseDb } from '@/lib/db';
import { resolvePortalSession } from '@/lib/portal-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PortalBillsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const headerList = await headers();
  const req = new Request('http://localhost:3000', { headers: headerList });
  const session = await resolvePortalSession(req);

  if (!session || session.patientId !== patientId) {
    redirect('/portal/login');
  }

  const claims = await baseDb.claim.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: { payments: true },
  });

  const formatCurrency = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalOutstanding = claims.reduce((sum, c) => sum + c.balanceCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/portal/${patientId}`}><ArrowLeft className="h-4 w-4" />Back</Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Bills & Payments
        </h1>
      </div>

      {totalOutstanding > 0 && (
        <Card className="elevation-2 border-amber-500/30 bg-amber-50/50">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">Outstanding Balance</p>
              <p className="text-2xl font-bold text-amber-700">{formatCurrency(totalOutstanding)}</p>
            </div>
            <Button className="motion-base gap-2">
              <CreditCard className="h-4 w-4" />
              Pay Now
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="elevation-1">
        <CardHeader><CardTitle className="text-md">Claim History</CardTitle></CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No claims on file</p>
          ) : (
            <div className="flex flex-col gap-3">
              {claims.map((claim) => (
                <div key={claim.id} className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium">{claim.payerName}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(claim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <Badge variant={claim.balanceCents > 0 ? 'destructive' : 'default'} className="text-xs">
                      {claim.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Charged</div>
                      <div className="font-medium">{formatCurrency(claim.chargeAmountCents)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Paid</div>
                      <div className="font-medium text-green-600">{formatCurrency(claim.paidAmountCents)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Balance</div>
                      <div className={`font-medium ${claim.balanceCents > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {formatCurrency(claim.balanceCents)}
                      </div>
                    </div>
                  </div>
                  {claim.balanceCents > 0 && (
                    <Button size="sm" variant="outline" className="motion-base mt-3 gap-2">
                      <CreditCard className="h-3 w-3" />
                      Pay {formatCurrency(claim.balanceCents)}
                    </Button>
                  )}
                  {claim.balanceCents === 0 && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Paid in full
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
