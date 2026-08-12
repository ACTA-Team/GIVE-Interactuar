import { NextResponse } from 'next/server';
import { getCourseDetail } from '@/lib/course-detail';

interface RouteParams {
  params: Promise<{ folderName: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { folderName } = await params;
  const course = await getCourseDetail(decodeURIComponent(folderName));
  return NextResponse.json({ ok: true, course });
}
