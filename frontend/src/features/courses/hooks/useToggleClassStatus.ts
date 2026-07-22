'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseDetail } from '@/lib/course-detail';
import type { ClassStatus } from '@/lib/class-schedule';

interface ToggleClassStatusResponse {
  ok: true;
  course: CourseDetail;
}

export function useToggleClassStatus(folderName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classNumber,
      status,
    }: {
      classNumber: number;
      status: ClassStatus;
    }) => {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(folderName)}/classes/${classNumber}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) {
        throw new Error('Failed to update class status');
      }
      return response.json() as Promise<ToggleClassStatusResponse>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['courses', folderName],
      });
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
