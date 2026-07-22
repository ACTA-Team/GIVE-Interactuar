// Standalone smoke test for lib/graph-sharepoint.ts — no Next.js server needed.
// Run with: npx tsx scripts/test-graph.ts
//
// Requires MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_SITE_ID in the
// environment (loaded from .env below). Creates a real folder + uploads the
// real template against whatever tenant/site those vars point to.
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import {
  createCourseFolder,
  uploadTemplateExcel,
  readExcelRange,
  writeExcelRange,
} from '../src/lib/graph-sharepoint';

async function main() {
  const courseName = `test-curso-${Date.now()}`;
  console.log(`Creating course folder: ${courseName}`);
  const folder = await createCourseFolder(courseName);
  console.log('Folder created:', folder);

  const templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'asistencia-template.xlsx',
  );
  const fileBuffer = fs.readFileSync(templatePath);

  console.log('Uploading template Excel...');
  const file = await uploadTemplateExcel(
    folder.id,
    'asistencia.xlsx',
    fileBuffer,
  );
  console.log('File uploaded:', file);

  console.log('Writing to range A1:D1...');
  await writeExcelRange(file.id, 'Asistencia', 'A1:D1', [
    ['nombre', 'correo', 'id', 'fecha'],
  ]);

  console.log('Reading back range A1:D1...');
  const values = await readExcelRange(file.id, 'Asistencia', 'A1:D1');
  console.log('Values read:', values);
}

main().catch((err) => {
  console.error('test-graph failed:', err);
  process.exit(1);
});
