'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Award, Loader2, CheckCircle2, Mail, MailCheck } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import { useIssueCourseCredential } from '../../hooks/useIssueCourseCredential';
import { useSendCredentialEmail } from '../../hooks/useSendCredentialEmail';

export function IssueCredentialButton({
  student,
  courseName,
  classesAttended,
  classesTotal,
  attendanceThreshold,
}: {
  student: AttendanceRecord;
  courseName: string;
  classesAttended: number;
  classesTotal: number;
  attendanceThreshold: number;
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
  const isEligible = attendancePercent >= attendanceThreshold;
  const isBusy = status === 'building_payload' || status === 'issuing';

  const handleSendEmail = () => {
    if (!result?.publicId || !student.correo) return;
    sendEmail({
      to: student.correo,
      studentName: student.nombre,
      courseName,
      publicId: result.publicId,
    });
  };

  if (status === 'success' && result) {
    return (
      <div className="flex flex-col items-start gap-0.5 sm:items-end">
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {result.publicId ? (
            <Link
              href={`/credential/${result.publicId}`}
              target="_blank"
              className="font-medium underline underline-offset-2"
            >
              {t('students.viewCredential')}
            </Link>
          ) : (
            t('students.credentialIssued')
          )}
        </div>
        {result.simulated && (
          <p className="text-[11px] text-amber-600">
            {t('students.credentialSimulated')}
          </p>
        )}
        {result.publicId && student.correo && (
          <>
            {emailStatus === 'sent' ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                <MailCheck className="h-3 w-3" />
                {t('students.emailSent')}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleSendEmail}
                disabled={emailStatus === 'sending'}
              >
                {emailStatus === 'sending' ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Mail className="mr-1 h-3 w-3" />
                )}
                {t('students.sendEmail')}
              </Button>
            )}
            {emailStatus === 'error' && (
              <p className="text-[11px] text-destructive">{emailError}</p>
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
      {!isEligible && (
        <p className="text-xs text-muted-foreground">
          {t('students.belowThreshold', { threshold: attendanceThreshold })}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
