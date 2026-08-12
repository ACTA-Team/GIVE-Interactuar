'use client';

import { useQuery } from '@tanstack/react-query';
import type { CoursesResponse } from '@/app/api/courses/route';

export function useCourses() {
  return useQuery<CoursesResponse>({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to load courses');
      }
      return response.json();
    },
  });
}
