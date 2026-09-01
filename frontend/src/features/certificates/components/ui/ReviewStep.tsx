'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Loader2 } from 'lucide-react';
import type { ParsedCourseUpload } from '@/lib/course-upload';
import { computeStudentAttendance } from '@/features/courses/lib/computeAttendance';
import { studentHasDocument } from '@/features/courses/lib/studentSubjectId';
import type { useBatchIssueCourseCredentials } from '@/features/courses/hooks/useBatchIssueCourseCredentials';
import { uploadCertificateTemplate } from '../../lib/uploadClient';

export function ReviewStep({
  course,
  templateFile,
  batch,
  onIssued,
  onBack,
}: {
  course: ParsedCourseUpload;
  templateFile: File;
  batch: ReturnType<typeof useBatchIssueCourseCredentials>;
  onIssued: (courseName: string) => void;
  onBack: () => void;
}) {
  const t = useTranslations('certificados');
  const [courseName, setCourseName] = useState(course.folderName);
  // Editable — a CSV upload can never carry a "Reglas" sheet (a CSV is a
  // single flat sheet by definition, see course-upload.ts), so it always
  // starts from DEFAULT_ATTENDANCE_THRESHOLD (67%) regardless of what the
  // professor actually wants for this course. Even for .xlsx, the
  // detected value should stay correctable by hand rather than trusted
  // blindly. Stored as a string so the input can hold an empty/partial
  // value while typing without fighting number coercion.
  const [attendanceThresholdInput, setAttendanceThresholdInput] = useState(
    String(course.attendanceThreshold),
  );
  // `|| fallback` would treat a deliberate 0% threshold as invalid (0 is
  // falsy) — check numeric validity explicitly instead.
  const parsedThreshold = Number(attendanceThresholdInput);
  const attendanceThreshold =
    attendanceThresholdInput.trim() !== '' && Number.isFinite(parsedThreshold)
      ? parsedThreshold
      : course.attendanceThreshold;
  // Stays true across the whole click→issue→send-emails→transition
  // sequence — batch.status alone flips to 'done' as soon as issuance
  // finishes, *before* emails are sent, which left a silent gap where the
  // button looked idle but the page hadn't actually moved on yet.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      course.students.map((student) => {
        const { attended, total, percent } = computeStudentAttendance(
          course.classes,
          student,
        );
        return {
          student,
          classesAttended: attended,
          classesTotal: total,
          attendancePercent: percent,
          hasDocument: studentHasDocument(student),
          eligible:
            percent >= attendanceThreshold && studentHasDocument(student),
        };
      }),
    [course, attendanceThreshold],
  );

  const eligibleCount = rows.filter((r) => r.eligible).length;
  const missingDocumentCount = rows.filter((r) => !r.hasDocument).length;
  const isBusy = isSubmitting;

  const autoSentRef = useRef(false);
  const autoAdvancedRef = useRef(false);

  // batch.run()/batch.sendEmails() below must be called from effects, not
  // directly in handleIssue after awaiting run() — sendEmails is memoized
  // on `items`, and the closure handleIssue captured at click-time still
  // points at the pre-run (empty) items, so calling it directly silently
  // no-ops. Effects always see the current render's fresh closures.
  useEffect(() => {
    if (batch.status === 'done' && !autoSentRef.current) {
      autoSentRef.current = true;
      batch.sendEmails();
    }
    if (batch.status === 'running') {
      autoSentRef.current = false;
      autoAdvancedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch.status]);

  useEffect(() => {
    if (batch.status !== 'done' || autoAdvancedRef.current) return;
    const hasRecipients = batch.items.some(
      (i) => i.status === 'success' && i.correo,
    );
    const emailDone = !hasRecipients || batch.emailBatchStatus === 'done';
    if (emailDone) {
      autoAdvancedRef.current = true;
      setIsSubmitting(false);
      onIssued(courseName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch.status, batch.emailBatchStatus, batch.items]);

  // Covers run()'s early-exit path (no eligible students) — that sets
  // batch.error without ever reaching 'running'/'done', which would
  // otherwise leave isSubmitting stuck true.
  useEffect(() => {
    if (batch.error) setIsSubmitting(false);
  }, [batch.error]);

  const issuingLabel =
    batch.emailBatchStatus === 'running'
      ? t('review.sendingEmails')
      : t('review.issuing');

  const handleIssue = async () => {
    setTemplateError(null);
    setIsSubmitting(true);

    let templatePath: string;
    try {
      templatePath = await uploadCertificateTemplate(templateFile);
    } catch (err) {
      setIsSubmitting(false);
      setTemplateError(
        err instanceof Error ? err.message : 'No se pudo subir la plantilla',
      );
      return;
    }

    const batchInputs = rows
      .filter((r) => r.eligible)
      .map((r) => ({
        student: r.student,
        classesAttended: r.classesAttended,
        classesTotal: r.classesTotal,
        attendancePercent: r.attendancePercent,
      }));

    await batch.run(courseName, attendanceThreshold, batchInputs, templatePath);
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="grid gap-2 max-w-sm flex-1">
            <Label htmlFor="course-name">{t('review.courseNameLabel')}</Label>
            <Input
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          <div className="grid gap-2 w-32">
            <Label htmlFor="attendance-threshold">
              {t('review.attendanceThresholdLabel')}
            </Label>
            <div className="relative">
              <Input
                id="attendance-threshold"
                type="number"
                min={0}
                max={100}
                value={attendanceThresholdInput}
                onChange={(e) => setAttendanceThresholdInput(e.target.value)}
                className="pr-6"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>{t('review.studentCount', { count: rows.length })}</span>
          <span>{t('review.eligible', { count: eligibleCount })}</span>
          {missingDocumentCount > 0 && (
            <span>
              {t('review.missingDocument', { count: missingDocumentCount })}
            </span>
          )}
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">{t('review.columnName')}</th>
                <th className="px-3 py-2">{t('review.columnDocument')}</th>
                <th className="px-3 py-2">{t('review.columnAttendance')}</th>
                <th className="px-3 py-2">{t('review.columnEligible')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.student.cedula || r.student.correo || r.student.nombre}
                  className="border-t"
                >
                  <td className="px-3 py-2">{r.student.nombre}</td>
                  <td className="px-3 py-2">{r.student.cedula || '—'}</td>
                  <td className="px-3 py-2">
                    {r.classesAttended}/{r.classesTotal} (
                    {Math.round(r.attendancePercent)}%)
                  </td>
                  <td className="px-3 py-2">
                    {r.eligible ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {templateError && (
          <p className="text-sm text-destructive">{templateError}</p>
        )}
        {batch.error && (
          <p className="text-sm text-destructive">{batch.error}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onBack} disabled={isBusy}>
            {t('review.back')}
          </Button>
          <Button
            onClick={handleIssue}
            disabled={isBusy || eligibleCount === 0}
          >
            {isBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Award className="mr-2 h-4 w-4" />
            )}
            {isBusy
              ? issuingLabel
              : t('review.issue', { count: eligibleCount })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
