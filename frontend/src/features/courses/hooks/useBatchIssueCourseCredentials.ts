'use client';

import { useState, useCallback } from 'react';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import { requestIssueCourseCredential } from '../lib/requestIssueCourseCredential';
import { requestCredentialEmail } from '../lib/requestCredentialEmail';

export type BatchStatus = 'idle' | 'running' | 'done';
export type BatchItemStatus = 'pending' | 'issuing' | 'success' | 'error';
export type BatchEmailStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface BatchStudentInput {
  student: AttendanceRecord;
  classesAttended: number;
  classesTotal: number;
  attendancePercent: number;
}

export interface BatchItemResult {
  key: string;
  studentName: string;
  correo: string;
  status: BatchItemStatus;
  publicId?: string | null;
  vcId?: string;
  issuerDid?: string;
  error?: string;
  emailStatus: BatchEmailStatus;
  emailError?: string;
}

function studentKey(student: AttendanceRecord): string {
  return student.cedula || student.correo || student.nombre;
}

export function useBatchIssueCourseCredentials() {
  const [status, setStatus] = useState<BatchStatus>('idle');
  const [items, setItems] = useState<BatchItemResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [emailBatchStatus, setEmailBatchStatus] = useState<BatchStatus>('idle');
  const [courseName, setCourseName] = useState<string>('');

  const run = useCallback(
    async (
      course: string,
      attendanceThreshold: number,
      students: BatchStudentInput[],
      templatePath?: string,
    ) => {
      setError(null);
      setCourseName(course);

      const eligible = students.filter(
        (s) => s.attendancePercent >= attendanceThreshold,
      );

      if (eligible.length === 0) {
        setError('Ningún estudiante cumple el umbral de asistencia todavía.');
        return;
      }

      setStatus('running');
      setEmailBatchStatus('idle');
      setItems(
        eligible.map((s) => ({
          key: studentKey(s.student),
          studentName: s.student.nombre,
          correo: s.student.correo,
          status: 'pending',
          emailStatus: 'idle',
        })),
      );

      for (const entry of eligible) {
        const key = studentKey(entry.student);
        setItems((prev) =>
          prev.map((it) =>
            it.key === key ? { ...it, status: 'issuing' } : it,
          ),
        );

        try {
          const outcome = await requestIssueCourseCredential({
            student: entry.student,
            courseName: course,
            classesAttended: entry.classesAttended,
            classesTotal: entry.classesTotal,
            attendancePercent: entry.attendancePercent,
            attendanceThreshold,
            templatePath,
          });

          setItems((prev) =>
            prev.map((it) =>
              it.key === key
                ? {
                    ...it,
                    status: 'success',
                    publicId: outcome.publicId,
                    vcId: outcome.vcId,
                    issuerDid: outcome.issuerDid,
                  }
                : it,
            ),
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Error desconocido';
          setItems((prev) =>
            prev.map((it) =>
              it.key === key ? { ...it, status: 'error', error: message } : it,
            ),
          );
        }
      }

      setStatus('done');
    },
    [],
  );

  const sendEmails = useCallback(async () => {
    const recipients = items.filter(
      (it) => it.status === 'success' && it.publicId && it.correo,
    );
    if (recipients.length === 0) return;

    setEmailBatchStatus('running');

    for (const item of recipients) {
      setItems((prev) =>
        prev.map((it) =>
          it.key === item.key ? { ...it, emailStatus: 'sending' } : it,
        ),
      );

      const result = await requestCredentialEmail({
        to: item.correo,
        studentName: item.studentName,
        courseName,
        publicId: item.publicId as string,
      });

      setItems((prev) =>
        prev.map((it) =>
          it.key === item.key
            ? {
                ...it,
                emailStatus: result.ok ? 'sent' : 'error',
                emailError: result.ok ? undefined : result.error,
              }
            : it,
        ),
      );
    }

    setEmailBatchStatus('done');
  }, [items, courseName]);

  const reset = useCallback(() => {
    setStatus('idle');
    setItems([]);
    setError(null);
    setEmailBatchStatus('idle');
  }, []);

  return {
    run,
    sendEmails,
    reset,
    status,
    items,
    error,
    emailBatchStatus,
  };
}
