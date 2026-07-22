'use client';

import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Users,
  CalendarClock,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { formatRelativeDate } from '@/lib/format-relative-date';
import { useCourseDetail } from '../../hooks/useCourseDetail';
import { CourseDetailSkeleton } from '../CourseDetailSkeleton';
import { ClassRow } from '../ui/ClassRow';
import { NewClassDialog } from '../ui/NewClassDialog';

export function CourseDetailPage({ folderName }: { folderName: string }) {
  const t = useTranslations('courses');
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading, error } = useCourseDetail(folderName);

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{t('error')}</p>
      </div>
    );
  }

  const { course } = data;
  const classes = [...course.classes].sort((a, b) => b.number - a.number);

  const nextSession = course.classes
    .filter((c) => c.status === 'abierta' && c.scheduledAt)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt as string).getTime() -
        new Date(b.scheduledAt as string).getTime(),
    )[0];

  return (
    <div className="space-y-6 max-md:space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.cursos.list)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground max-md:text-xl">
          {course.folderName}
        </h1>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-x-8 gap-y-2 py-4 text-sm text-muted-foreground">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('detail.sessions')}</CardTitle>
          <NewClassDialog folderName={folderName} />
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('detail.noSessions')}
            </p>
          ) : (
            classes.map((classInfo) => (
              <ClassRow
                key={classInfo.number}
                folderName={folderName}
                classInfo={classInfo}
              />
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {Math.round(course.attendanceRate * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t('attendanceRate.label')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {nextSession?.scheduledAt
                  ? new Intl.DateTimeFormat(locale, {
                      day: '2-digit',
                      month: 'short',
                    }).format(new Date(nextSession.scheduledAt))
                  : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextSession ? t('detail.nextSession') : t('detail.noUpcoming')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
