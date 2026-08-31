/**
 * Patient List Page (TASK-019)
 *
 * DOC0 §(b).3: Patient management — list with search.
 * DOC2 §8: Professional UI/UX — Major Third type scale, elevation, motion.
 */

import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientList } from '@/components/patients/patient-list';

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Patients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage patient demographics, insurance, and medical history
          </p>
        </div>
        <Button asChild className="motion-base gap-2">
          <Link href="/app/patients/new">
            <Plus className="h-4 w-4" />
            New Patient
          </Link>
        </Button>
      </div>

      <PatientList />
    </div>
  );
}
