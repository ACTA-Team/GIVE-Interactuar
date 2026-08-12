'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { CoursesSkeleton } from '../CoursesSkeleton';
import { CourseCard } from '../ui/CourseCard';
import { ImpactSummaryCard } from '../ui/ImpactSummaryCard';
import { AttendanceRateCard } from '../ui/AttendanceRateCard';

export function CoursesPage() {
  const t = useTranslations('courses');
  const { data, isLoading, error } = useCourses();

  if (isLoading) {
    return <CoursesSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{t('error')}</p>
      </div>
    );
  }

  const courses = data?.courses ?? [];

  return (
    <div className="space-y-8 max-md:space-y-6">
      <div className="flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <h1 className="text-2xl font-bold text-foreground max-md:text-xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-md:text-xs">
            {t('subtitle')}
          </p>
        </div>
        <Button variant="default" className="rounded-full" disabled>
          <Plus className="h-4 w-4" />
          {t('createCourse')}
        </Button>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('empty')}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.folderName} course={course} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ImpactSummaryCard courses={courses} />
            <AttendanceRateCard courses={courses} />
          </div>
        </>
      )}
    </div>
  );
}
