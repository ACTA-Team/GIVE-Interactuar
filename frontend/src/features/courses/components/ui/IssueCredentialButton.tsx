'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Award, Loader2, CheckCircle2, MailCheck } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import { useIssueCourseCredential } from '../../hooks/useIssueCourseCredential';
import { useSendCredentialEmail } from '../../hooks/useSendCredentialEmail';
import { ACTA_ISSUANCE_SIMULATED } from '@/lib/acta/simulateIssuance';
import { studentHasDocument } from '../../lib/studentSubjectId';

export function IssueCredentialButton({
  student,
  courseName,
  classesAttended,
  classesTotal,
  attendanceThreshold,
  existingPublicId,
  onIssued,
}: {
  student: AttendanceRecord;
  courseName: string;
  classesAttended: number;
  classesTotal: number;
  attendanceThreshold: number;
  existingPublicId?: string;
  onIssued?: () => void;
}) {
  const t = useTranslations('courses');
  const { issueCourseCredential, status, error, result } =
    useIssueCourseCredential();
  const {
    send: sendEmail,
    status: emailStatus,
    error: emailError,
  } = useSendCredentialEmail();

  const attendancePercent =
    classesTotal > 0 ? (classesAttended / classesTotal) * 100 : 0;
  const hasDocument = studentHasDocument(student);
  const isEligible = attendancePercent >= attendanceThreshold && hasDocument;
  const isBusy = status === 'building_payload' || status === 'issuing';

  const justIssuedRef = useRef(false);

  // Auto-send the email right after a fresh issuance in this session —
  // never for `existingPublicId` (a credential from a previous visit),
  // so reopening the page doesn't re-send mail.
  useEffect(() => {
    if (
      status === 'success' &&
      result?.publicId &&
      student.correo &&
      !justIssuedRef.current
    ) {
      justIssuedRef.current = true;
      onIssued?.();
      sendEmail({
        to: student.correo,
        studentName: student.nombre,
        courseName,
        publicId: result.publicId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, result?.publicId]);

  const publicId = result?.publicId ?? existingPublicId;
  const isIssued = (status === 'success' && !!result) || !!existingPublicId;
  const isSimulated = result?.simulated ?? ACTA_ISSUANCE_SIMULATED;

  if (isIssued) {
    return (
      <div className="flex flex-col items-start gap-0.5 sm:items-end">
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {publicId ? (
            <Link
              href={`/credential/${publicId}`}
              target="_blank"
              className="font-medium underline underline-offset-2"
            >
              {t('students.viewCredential')}
            </Link>
          ) : (
            t('students.credentialIssued')
          )}
        </div>
        {isSimulated && (
          <p className="text-[11px] text-amber-600">
            {t('students.credentialSimulated')}
          </p>
        )}
        {student.correo && (
          <>
            {emailStatus === 'sending' && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t('students.sendEmail')}
              </span>
            )}
            {emailStatus === 'sent' && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                <MailCheck className="h-3 w-3" />
                {t('students.emailSent')}
              </span>
            )}
            {emailStatus === 'error' && (
              <p
                className="text-[11px] text-muted-foreground"
                title={emailError ?? undefined}
              >
                {t('students.emailFailedNote')}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  const handleIssue = () => {
    issueCourseCredential({
      student,
      courseName,
      classesAttended,
      classesTotal,
      attendancePercent,
      attendanceThreshold,
    });
  };

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Button
        variant="outline"
        size="sm"
        onClick={handleIssue}
        disabled={!isEligible || isBusy}
      >
        {isBusy ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Award className="mr-1.5 h-3.5 w-3.5" />
        )}
        {t('students.issueCredential')}
      </Button>
      {!hasDocument && (
        <p className="text-xs text-muted-foreground">
          {t('students.missingDocument')}
        </p>
      )}
      {hasDocument && !isEligible && (
        <p className="text-xs text-muted-foreground">
          {t('students.belowThreshold', { threshold: attendanceThreshold })}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
