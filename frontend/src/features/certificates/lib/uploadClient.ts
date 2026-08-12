'use client';

import type { ParsedCourseUpload } from '@/lib/course-upload';

export async function parseCourseExcel(
  excelFile: File,
  courseNameOverride?: string,
): Promise<ParsedCourseUpload> {
  const formData = new FormData();
  formData.append('excel', excelFile);
  if (courseNameOverride) formData.append('courseName', courseNameOverride);

  const res = await fetch('/api/certificates/parse', {
    method: 'POST',
    body: formData,
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error ?? 'No se pudo leer el archivo');
  }
  return body.course as ParsedCourseUpload;
}

export async function uploadCertificateTemplate(
  templateFile: File,
): Promise<string> {
  const formData = new FormData();
  formData.append('template', templateFile);

  const res = await fetch('/api/certificates/upload-template', {
    method: 'POST',
    body: formData,
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error ?? 'No se pudo guardar la plantilla');
  }
  return body.templatePath as string;
}
