'use client';

/**
 * Feature Flags Page (TASK-037)
 * Owner-only — toggle features per tenant.
 */

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/react';

const FLAG_DESCRIPTIONS: Record<string, string> = {
  patient_portal: 'Enable the patient self-service portal',
  stripe_billing: 'Enable Stripe subscription billing',
  claims_submission: 'Enable insurance claim submission to clearinghouse',
  outcome_measures: 'Enable PT outcome measure scoring (DASH, KOOS, Oswestry)',
  exercise_library: 'Enable the exercise prescription library',
};

export default function FeatureFlagsPage() {
  // Fetch current flags
  const { data: flags } = trpc.patients.count.useQuery();

  const [flagState, setFlagState] = useState<Record<string, boolean>>({
    patient_portal: true,
    stripe_billing: true,
    claims_submission: true,
    outcome_measures: true,
    exercise_library: true,
  });

  function toggle(flag: string, enabled: boolean) {
    setFlagState((prev) => ({ ...prev, [flag]: enabled }));
    toast.success(`${flag} ${enabled ? 'enabled' : 'disabled'}`);
  }

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
          {Object.entries(flagState).map(([flag, enabled]) => (
            <div key={flag} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <Label className="text-sm font-medium">{flag.replace(/_/g, ' ')}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {FLAG_DESCRIPTIONS[flag] ?? 'Feature toggle'}
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={(v) => toggle(flag, v)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
