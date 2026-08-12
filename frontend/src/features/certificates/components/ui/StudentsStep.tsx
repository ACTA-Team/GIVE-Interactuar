'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Download, Trash2, XCircle } from 'lucide-react';
import type { ParsedCourseUpload } from '@/lib/course-upload';
import type { useBatchIssueCourseCredentials } from '@/features/courses/hooks/useBatchIssueCourseCredentials';
import { buildActaShareLink } from '@/lib/acta/actaShareLink';
import {
  downloadRosterWithLinks,
  type RosterLinkInfo,
} from '../../lib/exportRoster';
import type { AttendanceRecord } from '@/lib/attendance-parser';

function studentKey(student: AttendanceRecord): string {
  return student.cedula || student.correo || student.nombre;
}

export function StudentsStep({
  course,
  courseName,
  batch,
  onClear,
}: {
  course: ParsedCourseUpload;
  courseName: string;
  batch: ReturnType<typeof useBatchIssueCourseCredentials>;
  onClear: () => void;
}) {
  const t = useTranslations('certificados');
  const [downloading, setDownloading] = useState(false);

  const itemsByKey = useMemo(
    () => new Map(batch.items.map((item) => [item.key, item])),
    [batch.items],
  );

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const linksByStudentKey = useMemo(() => {
    const map = new Map<string, RosterLinkInfo>();
    for (const [key, item] of itemsByKey) {
      if (item.status !== 'success' || !item.publicId) continue;
      map.set(key, {
        ourLink: `${origin}/credential/${item.publicId}`,
        actaLink:
          item.vcId && item.issuerDid
            ? buildActaShareLink({
                vcId: item.vcId,
                issuerDid: item.issuerDid,
                courseName,
                issuedAt: new Date().toISOString(),
              })
            : null,
      });
    }
    return map;
  }, [itemsByKey, origin, courseName]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadRosterWithLinks(
        courseName,
        course.students,
        linksByStudentKey,
        studentKey,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t('students.title')}
          </h2>
          <Button onClick={handleDownload} disabled={downloading} size="lg">
            <Download className="mr-2 h-4 w-4" />
            {t('students.download')}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">{t('students.columnName')}</th>
                <th className="px-3 py-2">{t('students.columnCredential')}</th>
                <th className="px-3 py-2">{t('students.columnEmail')}</th>
                <th className="px-3 py-2">{t('students.columnOurLink')}</th>
                <th className="px-3 py-2">{t('students.columnActaLink')}</th>
              </tr>
            </thead>
            <tbody>
              {course.students.map((student) => {
                const item = itemsByKey.get(studentKey(student));
                const links = linksByStudentKey.get(studentKey(student));
                return (
                  <tr key={studentKey(student)} className="border-t">
                    <td className="px-3 py-2">{student.nombre}</td>
                    <td className="px-3 py-2">
                      {item?.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : item?.status === 'error' ? (
                        <XCircle
                          className="h-4 w-4 text-destructive"
                          aria-label={item.error}
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {t('students.notAvailable')}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {item?.emailStatus === 'sent' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <span className="text-muted-foreground">
                          {t('students.notAvailable')}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {links?.ourLink ? (
                        <Link
                          href={links.ourLink}
                          target="_blank"
                          className="text-primary underline underline-offset-2"
                        >
                          {t('students.columnOurLink')}
                        </Link>
                      ) : (
                        t('students.notAvailable')
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {links?.actaLink ? (
                        <a
                          href={links.actaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2"
                        >
                          {t('students.columnActaLink')}
                        </a>
                      ) : (
                        t('students.notAvailable')
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Button variant="outline" onClick={onClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t('students.clear')}
        </Button>
      </CardContent>
    </Card>
  );
}
