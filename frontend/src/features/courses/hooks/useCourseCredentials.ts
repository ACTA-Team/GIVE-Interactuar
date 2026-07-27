'use client';

import { useQuery } from '@tanstack/react-query';

export interface ExistingCourseCredential {
  subjectId: string;
  publicId: string;
}

interface CourseCredentialsResponse {
  data: ExistingCourseCredential[];
}

export function useCourseCredentials(folderName: string) {
  const query = useQuery<CourseCredentialsResponse>({
    queryKey: ['course-credentials', folderName],
    queryFn: async () => {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(folderName)}/credentials`,
      );
      if (!response.ok) {
        throw new Error('Failed to load course credentials');
      }
      return response.json();
    },
  });

  const bySubjectId = new Map(
    (query.data?.data ?? []).map((c) => [c.subjectId, c.publicId]),
  );

  return { ...query, bySubjectId };
}
