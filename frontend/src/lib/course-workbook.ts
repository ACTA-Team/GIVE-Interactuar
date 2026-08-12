// Server-only module: no "use client" directive, and must not be imported
// from any file that has one.
import {
  listFolderContents,
  getFirstWorksheetName,
  getWorksheetData,
  type FolderItem,
} from '@/lib/graph-sharepoint';

export interface CourseWorkbook {
  file: FolderItem;
  sheetName: string;
  rows: unknown[][];
}

export async function getCourseWorkbook(
  folderName: string,
): Promise<CourseWorkbook> {
  const contents = await listFolderContents(folderName);
  const file = contents.find((item) =>
    item.name.toLowerCase().endsWith('.xlsx'),
  );

  if (!file) {
    throw new Error(`No .xlsx file found in folder "${folderName}"`);
  }

  const sheetName = await getFirstWorksheetName(file.id);
  const rows = await getWorksheetData(file.id, sheetName);

  return { file, sheetName, rows };
}
