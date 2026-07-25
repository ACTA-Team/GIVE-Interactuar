import { NextResponse } from 'next/server';
import { getCourseDetail } from '@/lib/course-detail';
import { getCourseWorkbook } from '@/lib/course-workbook';
import { getAttendanceThreshold } from '@/lib/attendance-rules';
import { getCourseTemplatePdf } from '@/lib/course-template';
import { generateConstanciaPdf } from '@/lib/generate-constancia';
import type { AttendanceRecord } from '@/lib/attendance-parser';

interface RouteParams {
  params: Promise<{ folderName: string }>;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findStudent(
  students: AttendanceRecord[],
  { cedula, correo }: { cedula?: string; correo?: string },
): AttendanceRecord | null {
  if (cedula?.trim()) {
    const key = cedula.trim();
    const match = students.find((s) => s.cedula.trim() === key);
    if (match) return match;
  }
  if (correo?.trim()) {
    const key = normalize(correo);
    const match = students.find((s) => normalize(s.correo) === key);
    if (match) return match;
  }
  return null;
}

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function formatFechaLine(): string {
  const now = new Date();
  return `Dado en Medellín, Antioquia en el mes de ${MESES[now.getMonth()]} de ${now.getFullYear()}`;
}

// Real endpoint the course detail page depends on. Not wrapped in elaborate
// error handling, matching the rest of the /api/courses surface — this
// route is only reachable from the professor dashboard.
export async function POST(request: Request, { params }: RouteParams) {
  const { folderName: rawFolderName } = await params;
  const folderName = decodeURIComponent(rawFolderName);
  const { cedula, correo } = (await request.json()) as {
    cedula?: string;
    correo?: string;
  };

  const course = await getCourseDetail(folderName);
  const student = findStudent(course.students, { cedula, correo });

  if (!student) {
    return NextResponse.json(
      { ok: false, error: 'Estudiante no encontrado en este curso' },
      { status: 404 },
    );
  }

  const closedClassIndices = course.classes
    .map((c, index) => ({ status: c.status, index }))
    .filter((c) => c.status === 'cerrada')
    .map((c) => c.index);

  const presentClosed = closedClassIndices.filter(
    (i) => student.asistencia[i]?.asistio,
  ).length;
  const attendancePercent =
    closedClassIndices.length > 0
      ? (presentClosed / closedClassIndices.length) * 100
      : 0;

  const { file } = await getCourseWorkbook(folderName);
  const threshold = await getAttendanceThreshold(file.id);

  if (attendancePercent < threshold) {
    return NextResponse.json(
      {
        ok: false,
        error: `Este estudiante no alcanza el mínimo de asistencia requerido (${threshold}%)`,
        attendancePercent,
        threshold,
      },
      { status: 403 },
    );
  }

  const template = await getCourseTemplatePdf(folderName);
  const pdfBytes = await generateConstanciaPdf(template.bytes, {
    nombre: student.nombre,
    cedula: student.cedula,
    curso: folderName,
    fecha: formatFechaLine(),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="constancia-${student.nombre}.pdf"`,
    },
  });
}
