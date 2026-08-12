'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarClock, CheckCircle2 } from 'lucide-react';
import type { CourseSummary } from '@/lib/course-summary';
import { formatRelativeDate } from '@/lib/format-relative-date';
import { ROUTES } from '@/lib/constants/routes';

export function CourseCard({ course }: { course: CourseSummary }) {
  const t = useTranslations('courses');
  const locale = useLocale();

  return (
    <Link href={ROUTES.cursos.detail(course.folderName)}>
      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {course.folderName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>{t('card.students', { count: course.studentCount })}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0" />
            <span>
              {t('card.lastActivity', {
                relativeDate: formatRelativeDate(
                  course.lastModifiedDateTime,
                  locale,
                ),
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              {t('card.attendanceRate', {
                percent: Math.round(course.attendanceRate * 100),
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
