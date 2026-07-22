'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseDetail } from '@/lib/course-detail';

interface CreateClassResponse {
  ok: true;
  course: CourseDetail;
}

export function useCreateClass(folderName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduledAt: string) => {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(folderName)}/classes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledAt }),
        },
      );
      if (!response.ok) {
        throw new Error('Failed to create class');
      }
      return response.json() as Promise<CreateClassResponse>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['courses', folderName],
      });
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
