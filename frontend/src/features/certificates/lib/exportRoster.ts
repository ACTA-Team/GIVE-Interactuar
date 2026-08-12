'use client';

import ExcelJS from 'exceljs';
import type { AttendanceRecord } from '@/lib/attendance-parser';

export interface RosterLinkInfo {
  ourLink: string | null;
  actaLink: string | null;
}

export async function downloadRosterWithLinks(
  courseName: string,
  students: AttendanceRecord[],
  linksByStudentKey: Map<string, RosterLinkInfo>,
  studentKey: (student: AttendanceRecord) => string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Estudiantes');

  sheet.columns = [
    { header: 'nombre', key: 'nombre', width: 28 },
    { header: 'correo', key: 'correo', width: 28 },
    { header: 'empresa', key: 'empresa', width: 20 },
    { header: 'telefono', key: 'telefono', width: 16 },
    { header: 'cedula', key: 'cedula', width: 16 },
    { header: 'link credencial', key: 'ourLink', width: 40 },
    { header: 'link acta', key: 'actaLink', width: 40 },
  ];

  for (const student of students) {
    const links = linksByStudentKey.get(studentKey(student));
    sheet.addRow({
      nombre: student.nombre,
      correo: student.correo,
      empresa: student.empresa,
      telefono: student.telefono,
      cedula: student.cedula,
      ourLink: links?.ourLink ?? '',
      actaLink: links?.actaLink ?? '',
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `certificados-${courseName || 'curso'}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
