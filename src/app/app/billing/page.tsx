/**
 * Billing Page — subscription overview + seat usage
 */

import { CreditCard, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serverTRPC } from '@/lib/trpc/server';

export default async function BillingPage() {
  let subscription: { planName: string; therapistSeats: number; supportSeats: number; status: string; stripeSubscriptionId: string | null; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } | null = null;
  let usage: { therapistsUsed: number; supportUsed: number; therapistSeats: number; supportSeats: number } | null = null;

  try {
    subscription = await serverTRPC((c) => c.billing.getSubscription());
    usage = await serverTRPC((c) => c.billing.usage());
  } catch (error) {
    console.error('Billing error:', error);
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Subscription status and seat usage
        </p>
      </div>

      {/* Current Plan */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Plan</div>
                <div className="text-sm font-medium">{subscription.planName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Current Period End</div>
                <div className="text-sm font-medium">
                  {subscription.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cancel at Period End</div>
                <div className="text-sm font-medium">
                  {subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active subscription</p>
          )}
        </CardContent>
      </Card>

      {/* Seat Usage */}
      {usage && (
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Seat Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Therapist Seats</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.therapistsUsed} / {usage.therapistSeats}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${usage.therapistSeats > 0 ? (usage.therapistsUsed / usage.therapistSeats) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  $49/therapist/month
                </div>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Support Staff Seats</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.supportUsed} / {usage.supportSeats}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${usage.supportSeats > 0 ? (usage.supportUsed / usage.supportSeats) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  $19/support staff/month
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Patient Portal is always free
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing reminder */}
      <Card className="elevation-1 bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Estimated Monthly Cost</p>
              <p className="text-xs text-muted-foreground">
                {usage ? `${usage.therapistSeats} therapists × $49 + ${usage.supportSeats} support × $19 = $${usage.therapistSeats * 49 + usage.supportSeats * 19}/month` : '—'}
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {usage ? `$${usage.therapistSeats * 49 + usage.supportSeats * 19}` : '—'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
