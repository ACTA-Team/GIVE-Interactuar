'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Award, Loader2, CheckCircle2 } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import { useIssueCourseCredential } from '../../hooks/useIssueCourseCredential';

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

  const attendancePercent =
    classesTotal > 0 ? (classesAttended / classesTotal) * 100 : 0;
  const isEligible = attendancePercent >= attendanceThreshold;
  const isBusy = status === 'building_payload' || status === 'issuing';

  if (status === 'success' && result) {
    return (
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
