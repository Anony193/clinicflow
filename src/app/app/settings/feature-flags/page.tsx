'use client';

/**
 * Feature Flags Page (TASK-037)
 * Owner-only — toggle features per tenant. Uses settings router.
 */

import { Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/react';
import { toast } from 'sonner';

const FLAG_DESCRIPTIONS: Record<string, string> = {
  patient_portal: 'Enable the patient self-service portal',
  stripe_billing: 'Enable Stripe subscription billing',
  claims_submission: 'Enable insurance claim submission to clearinghouse',
  outcome_measures: 'Enable PT outcome measure scoring (DASH, KOOS, Oswestry)',
  exercise_library: 'Enable the exercise prescription library',
};

export default function FeatureFlagsPage() {
  const { data: flags, refetch } = trpc.settings.getFlags.useQuery();
  const toggleMutation = trpc.settings.toggleFlag.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Feature flag updated');
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          Feature Flags
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle features for your clinic (takes effect within 5 minutes)
        </p>
      </div>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md">Available Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {flags ? (
            Object.entries(flags).map(([flag, enabled]) => (
              <div key={flag} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm font-medium">{flag.replace(/_/g, ' ')}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {FLAG_DESCRIPTIONS[flag] ?? 'Feature toggle'}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(v) => toggleMutation.mutate({ key: flag, enabled: v })}
                  disabled={toggleMutation.isPending}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading flags...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
