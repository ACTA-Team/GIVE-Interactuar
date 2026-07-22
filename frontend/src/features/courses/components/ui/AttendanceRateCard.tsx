'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { CourseSummary } from '@/lib/course-summary';

function calculateOverallAttendanceRate(courses: CourseSummary[]): number {
  const totalCells = courses.reduce(
    (sum, course) => sum + course.studentCount * course.classLabels.length,
    0,
  );
  if (totalCells === 0) return 0;

  const presentCells = courses.reduce(
    (sum, course) =>
      sum +
      Math.round(
        course.attendanceRate * course.studentCount * course.classLabels.length,
      ),
    0,
  );

  return presentCells / totalCells;
}

export function AttendanceRateCard({
  courses,
}: {
  courses: CourseSummary[];
}) {
  const t = useTranslations('courses');
  const rate = calculateOverallAttendanceRate(courses);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <div className="text-3xl font-bold">{Math.round(rate * 100)}%</div>
        <p className="text-sm text-muted-foreground">{t('attendanceRate.label')}</p>
      </CardContent>
    </Card>
  );
}
