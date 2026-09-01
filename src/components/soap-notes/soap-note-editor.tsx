'use client';

/**
 * SOAP Note Editor (TASK-024)
 *
 * 4-section editor: Subjective, Objective, Assessment, Plan.
 *
 * Features:
 *   - Autosave (debounced 3 seconds, DOC0 §(b).5)
 *   - Optimistic locking (version field, Constraint #4)
 *   - Sign button (locks the note from further edits)
 *   - Loading/error states
 *   - Conflict handling (409 if version mismatch → reload)
 *
 * DOC2 §8: Professional UI/UX — accessible textareas with labels.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  PenLine,
  AlertCircle,
  User,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SoapNoteData {
  id: string;
  version: number;
  patientId: string;
  therapistId: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  status: string;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  patientName: string;
  patientDateOfBirth: string | null;
  therapistName: string;
}

const SECTIONS = [
  {
    key: 'subjective' as const,
    label: 'Subjective',
    description: 'Patient-reported symptoms, pain levels, history',
    placeholder: 'Patient reports... Pain rated X/10. Aggravating factors:...',
  },
  {
    key: 'objective' as const,
    label: 'Objective',
    description: 'Observable findings, measurements, test results',
    placeholder: 'Observation: ROM measurements: Strength (MMT): Special tests:',
  },
  {
    key: 'assessment' as const,
    label: 'Assessment',
    description: 'Clinical interpretation, diagnosis, progress',
    placeholder: 'Assessment: Patient is progressing with... Diagnosis:...',
  },
  {
    key: 'plan' as const,
    label: 'Plan',
    description: 'Treatment plan, interventions, next steps',
    placeholder: 'Plan: Continue treatment 2x/week for 4 weeks. Exercises:...',
  },
];

export function SoapNoteEditor({ note: initialNote }: { note: SoapNoteData }) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [formData, setFormData] = useState({
    subjective: initialNote.subjective ?? '',
    objective: initialNote.objective ?? '',
    assessment: initialNote.assessment ?? '',
    plan: initialNote.plan ?? '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSigned = note.status === 'signed';

  const updateMutation = trpc.soapNotes.update.useMutation({
    onSuccess: (data) => {
      if (data) {
        setNote((prev) => ({ ...prev, ...data }));
        setHasChanges(false);
        setLastSaved(new Date());
      }
    },
    onError: (error) => {
      if (error.message.includes('Optimistic lock failed')) {
        toast.error('This note was edited by someone else. Reloading...');
        setTimeout(() => router.refresh(), 1500);
      } else if (error.message.includes('Cannot edit a signed')) {
        toast.error('This note is signed and cannot be edited.');
      } else {
        toast.error(`Save failed: ${error.message}`);
      }
    },
  });

  const signMutation = trpc.soapNotes.sign.useMutation({
    onSuccess: (data) => {
      if (data) {
        setNote((prev) => ({ ...prev, ...data }));
        toast.success('SOAP note signed and locked');
      }
    },
    onError: (error) => {
      toast.error(`Sign failed: ${error.message}`);
    },
  });

  // Debounced autosave (3 seconds after last keystroke)
  const triggerAutosave = useCallback(() => {
    if (isSigned) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      if (!hasChanges) return;
      setIsAutosaving(true);
      updateMutation.mutate({
        id: note.id,
        version: note.version,
        subjective: formData.subjective || null,
        objective: formData.objective || null,
        assessment: formData.assessment || null,
        plan: formData.plan || null,
      });
      setIsAutosaving(false);
    }, 3000);
  }, [formData, hasChanges, note.id, note.version, isSigned, updateMutation]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Trigger autosave when form changes
  useEffect(() => {
    if (hasChanges && !isSigned) {
      triggerAutosave();
    }
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [formData, hasChanges, isSigned, triggerAutosave]);

  function handleManualSave() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    updateMutation.mutate({
      id: note.id,
      version: note.version,
      subjective: formData.subjective || null,
      objective: formData.objective || null,
      assessment: formData.assessment || null,
      plan: formData.plan || null,
    });
  }

  function handleSign() {
    if (hasChanges) {
      toast.error('Please save your changes before signing');
      return;
    }
    signMutation.mutate({ id: note.id, version: note.version });
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="motion-base">
            <Link href="/app/soap-notes">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{note.patientName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={isSigned ? 'default' : 'secondary'} className="text-xs">
                {note.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                by {note.therapistName}
              </span>
            </div>
          </div>
        </div>

        {/* Save/Sign buttons */}
        <div className="flex items-center gap-2">
          {/* Autosave indicator */}
          {isAutosaving || updateMutation.isPending ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          ) : lastSaved && !hasChanges ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Saved {lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          ) : hasChanges ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </span>
          ) : null}

          {!isSigned && (
            <>
              <Button
                variant="outline"
                onClick={handleManualSave}
                disabled={updateMutation.isPending || !hasChanges}
                className="motion-base gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
              <Button
                onClick={handleSign}
                disabled={signMutation.isPending || hasChanges}
                className="motion-base gap-2"
              >
                {signMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PenLine className="h-4 w-4" />
                )}
                Sign
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Patient info banner */}
      <Card className="elevation-1 bg-muted/30">
        <CardContent className="flex items-center gap-3 py-3">
          <User className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <span className="font-medium">{note.patientName}</span>
            {note.patientDateOfBirth && (
              <span className="text-muted-foreground ml-2">
                DOB: {new Date(note.patientDateOfBirth).toLocaleDateString('en-US')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4-section editor */}
      {SECTIONS.map((section) => (
        <Card key={section.key} className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center justify-between">
              <span>{section.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {section.description}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData[section.key]}
              onChange={(e) => handleChange(section.key, e.target.value)}
              placeholder={section.placeholder}
              disabled={isSigned}
              className="min-h-[120px] motion-base resize-y"
            />
          </CardContent>
        </Card>
      ))}

      {/* Footer info */}
      <div className="text-xs text-muted-foreground text-center pb-4">
        Note v{note.version} · Created {new Date(note.createdAt).toLocaleString()} ·
        Updated {new Date(note.updatedAt).toLocaleString()}
        {isSigned && note.signedAt && (
          <> · Signed {new Date(note.signedAt).toLocaleString()}</>
        )}
        <br />
        <span className="text-muted-foreground/70">
          All access to this clinical note is logged for HIPAA compliance
        </span>
      </div>
    </div>
  );
}
