/**
 * Settings Page (TASK-036/037)
 */

import Link from 'next/link';
import { Settings, ScrollText, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  const items = [
    { href: '/app/settings/audit-log', label: 'Audit Log', icon: ScrollText, description: 'View all PHI access logs' },
    { href: '/app/settings/feature-flags', label: 'Feature Flags', icon: Flag, description: 'Toggle features per tenant' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Clinic configuration and compliance</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="elevation-1 motion-base hover:elevation-2 cursor-pointer">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
