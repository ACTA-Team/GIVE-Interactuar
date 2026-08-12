'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import {
  Award,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  MailCheck,
} from 'lucide-react';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import type { ClassInfo } from '@/lib/class-schedule';
import { useBatchIssueCourseCredentials } from '../../hooks/useBatchIssueCourseCredentials';
import { computeStudentAttendance } from '../../lib/computeAttendance';
import {
  computeStudentSubjectId,
  studentHasDocument,
} from '../../lib/studentSubjectId';
import { ACTA_ISSUANCE_SIMULATED } from '@/lib/acta/simulateIssuance';

export function BatchIssueCredentialsButton({
  folderName,
  students,
  classes,
  attendanceThreshold,
  existingCredentials,
  onIssued,
}: {
  folderName: string;
  students: AttendanceRecord[];
  classes: ClassInfo[];
  attendanceThreshold: number;
  existingCredentials?: Map<string, string>;
  onIssued?: () => void;
}) {
  const t = useTranslations('courses');
  const { run, sendEmails, status, items, error, emailBatchStatus } =
    useBatchIssueCourseCredentials();

  const batchInputs = useMemo(
    () =>
      students
        .filter(
          (student) =>
            studentHasDocument(student) &&
            !existingCredentials?.has(computeStudentSubjectId(student)),
        )
        .map((student) => {
          const { attended, total, percent } = computeStudentAttendance(
            classes,
            student,
          );
          return {
            student,
            classesAttended: attended,
            classesTotal: total,
            attendancePercent: percent,
          };
        }),
    [students, classes, existingCredentials],
  );

  const eligibleCount = batchInputs.filter(
    (s) => s.attendancePercent >= attendanceThreshold,
  ).length;
  const missingDocumentCount = students.filter(
    (student) => !studentHasDocument(student),
  ).length;

  const isRunning = status === 'running';
  const succeeded = items.filter((i) => i.status === 'success').length;
  const failed = items.filter((i) => i.status === 'error').length;
  const emailable = items.filter(
    (i) => i.status === 'success' && i.correo && i.emailStatus === 'idle',
  ).length;
  const emailsSent = items.filter((i) => i.emailStatus === 'sent').length;
  const emailsFailed = items.filter((i) => i.emailStatus === 'error').length;
  const isSendingEmails = emailBatchStatus === 'running';

  const autoSentRef = useRef(false);

  // Auto-send once the batch finishes, mirroring the single-issue flow.
  // The button below stays as a manual retry for anything that failed.
  useEffect(() => {
    if (status === 'done' && !autoSentRef.current) {
      autoSentRef.current = true;
      onIssued?.();
      sendEmails();
    }
    if (status === 'running') {
      autoSentRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleRun = () => {
    run(folderName, attendanceThreshold, batchInputs);
  };

  const handleSendEmails = () => {
    sendEmails();
  };

  return (
    <div className="flex flex-col gap-2 border-b pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRun}
          disabled={isRunning || eligibleCount === 0}
        >
          {isRunning ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Award className="mr-1.5 h-3.5 w-3.5" />
          )}
          {t('students.batchIssue', { count: eligibleCount })}
        </Button>
        {status === 'done' && (
          <span className="text-xs text-muted-foreground">
            {t('students.batchSummary', { succeeded, failed })}
          </span>
        )}
      </div>

      {missingDocumentCount > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {t('students.batchMissingDocument', {
            count: missingDocumentCount,
          })}
        </p>
      )}

      {status === 'done' && succeeded > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmails}
            disabled={isSendingEmails || emailable === 0}
          >
            {isSendingEmails ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t('students.batchSendEmails', { count: emailable })}
          </Button>
          {emailBatchStatus === 'done' && (
            <span className="text-xs text-muted-foreground">
              {t('students.batchEmailSummary', {
                sent: emailsSent,
                failed: emailsFailed,
              })}
            </span>
          )}
        </div>
      )}

      {ACTA_ISSUANCE_SIMULATED &&
        (status === 'running' || status === 'done') && (
          <p className="text-[11px] text-amber-600">
            {t('students.credentialSimulated')}
          </p>
        )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {items.length > 0 && (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-foreground">{item.studentName}</span>
              <span className="flex items-center gap-1.5">
                {item.status === 'issuing' && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
                {item.status === 'success' && (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {item.publicId && (
                      <Link
                        href={`/credential/${item.publicId}`}
                        target="_blank"
                        className="font-medium text-emerald-600 underline underline-offset-2"
                      >
                        {t('students.viewCredential')}
                      </Link>
                    )}
                    {item.emailStatus === 'sending' && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    )}
                    {item.emailStatus === 'sent' && (
                      <MailCheck
                        className="h-3.5 w-3.5 text-emerald-600"
                        aria-label={t('students.emailSent')}
                      />
                    )}
                    {item.emailStatus === 'error' && (
                      <span title={item.emailError}>
                        <Mail
                          className="h-3.5 w-3.5 text-muted-foreground"
                          aria-label={t('students.emailFailedNote')}
                        />
                      </span>
                    )}
                  </>
                )}
                {item.status === 'error' && (
                  <span
                    className="flex items-center gap-1 text-destructive"
                    title={item.error}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {t('students.batchItemError')}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
