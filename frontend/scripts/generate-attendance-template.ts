// Generates templates/asistencia-template.xlsx.
// Run with: npx tsx scripts/generate-attendance-template.ts
import path from 'node:path';
import ExcelJS from 'exceljs';

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Asistencia');

  sheet.columns = [
    { header: 'nombre', key: 'nombre', width: 30 },
    { header: 'correo', key: 'correo', width: 30 },
    { header: 'id', key: 'id', width: 20 },
    { header: 'fecha', key: 'fecha', width: 15 },
  ];

  const outPath = path.join(
    __dirname,
    '..',
    'templates',
    'asistencia-template.xlsx',
  );
  await workbook.xlsx.writeFile(outPath);
  console.log(`Written: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
