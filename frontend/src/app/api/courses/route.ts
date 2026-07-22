import { NextResponse } from 'next/server';
import { listRootFolders } from '@/lib/graph-sharepoint';
import { getCourseSummary, type CourseSummary } from '@/lib/course-summary';

export interface CoursesResponse {
  ok: true;
  courses: CourseSummary[];
  errors: { folderName: string; error: string }[];
}

// Real endpoint the "Mis Cursos" page depends on, unlike the debug-only
// /api/graph/* routes — a single course folder failing to parse shouldn't
// take down the whole list, so failures are collected instead of thrown.
export async function GET() {
  const folders = await listRootFolders();

  const results = await Promise.allSettled(
    folders.map((folder) => getCourseSummary(folder)),
  );

  const courses: CourseSummary[] = [];
  const errors: { folderName: string; error: string }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      courses.push(result.value);
    } else {
      errors.push({
        folderName: folders[index].name,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  const response: CoursesResponse = { ok: true, courses, errors };
  return NextResponse.json(response);
}
