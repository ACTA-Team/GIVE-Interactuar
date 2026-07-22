'use client';

import { useQuery } from '@tanstack/react-query';
import type { CourseDetail } from '@/lib/course-detail';

interface CourseDetailResponse {
  ok: true;
  course: CourseDetail;
}

export function useCourseDetail(folderName: string) {
  return useQuery<CourseDetailResponse>({
    queryKey: ['courses', folderName],
    queryFn: async () => {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(folderName)}`,
      );
      if (!response.ok) {
        throw new Error('Failed to load course');
      }
      return response.json();
    },
  });
}
