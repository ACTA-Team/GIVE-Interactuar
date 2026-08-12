import { NextResponse } from 'next/server';
import { getCourseWorkbook } from '@/lib/course-workbook';
import { parseClassColumns } from '@/lib/class-schedule';
import {
  registerAttendance,
  type AttendanceSubmission,
} from '@/lib/student-roster';

interface RouteParams {
  params: Promise<{ folderName: string; classNumber: string }>;
}

// Public, unauthenticated surface — separate from /api/courses (the
// professor-facing API) since this is what a student's browser hits
// directly from a QR code or shared link.
export async function GET(_request: Request, { params }: RouteParams) {
  const { folderName: rawFolderName, classNumber } = await params;
  const folderName = decodeURIComponent(rawFolderName);

  const { rows } = await getCourseWorkbook(folderName);
  const classes = parseClassColumns(rows);
  const targetClass = classes.find((c) => c.number === Number(classNumber));

  if (!targetClass) {
    return NextResponse.json(
      { ok: false, error: `Class ${classNumber} not found` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    courseName: folderName,
    classNumber: targetClass.number,
    scheduledAt: targetClass.scheduledAt,
    status: targetClass.status,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { folderName: rawFolderName, classNumber } = await params;
  const folderName = decodeURIComponent(rawFolderName);
  const submission = (await request.json()) as AttendanceSubmission;

  if (!submission.nombre?.trim() || !submission.correo?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'Nombre y correo son obligatorios' },
      { status: 400 },
    );
  }

  const result = await registerAttendance(
    folderName,
    Number(classNumber),
    submission,
  );

  if (result.status === 'class-not-found') {
    return NextResponse.json(
      { ok: false, error: `Class ${classNumber} not found` },
      { status: 404 },
    );
  }

  if (result.status === 'class-closed') {
    return NextResponse.json(
      { ok: false, error: 'Esta sesión ya no acepta registros de asistencia' },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
