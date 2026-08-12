'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { CourseSummary } from '@/lib/course-summary';

export function ImpactSummaryCard({ courses }: { courses: CourseSummary[] }) {
  const t = useTranslations('courses');

  const data = courses.map((course) => ({
    name: course.folderName,
    value: Math.round(course.attendanceRate * 100),
  }));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('impact.title')}</CardTitle>
        <CardDescription>{t('impact.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#64748B', fontSize: 12 }}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value) => [`${value}%`, t('impact.tooltip')]}
              />
              <Bar
                dataKey="value"
                fill="var(--chart-1)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
