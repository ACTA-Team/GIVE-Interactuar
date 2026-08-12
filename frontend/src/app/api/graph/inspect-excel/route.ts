import { NextResponse } from 'next/server';
import { listFolderContents, getWorksheetData } from '@/lib/graph-sharepoint';

// Dev-only verification route — not part of the product surface.
// Visit /api/graph/inspect-excel to confirm we can read the real
// attendance Excel from the "Levantamiento de Capital" folder.
export async function GET() {
  const items = await listFolderContents('Levantamiento de Capital');

  const excelFile = items.find((item) =>
    item.name.toLowerCase().endsWith('.xlsx'),
  );

  if (!excelFile) {
    return NextResponse.json(
      { ok: false, error: 'No .xlsx file found in "Levantamiento de Capital"' },
      { status: 404 },
    );
  }

  const rows = await getWorksheetData(excelFile.id);

  return NextResponse.json({ ok: true, fileName: excelFile.name, rows });
}
