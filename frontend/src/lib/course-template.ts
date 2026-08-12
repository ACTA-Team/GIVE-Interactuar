// Server-only module: no "use client" directive, and must not be imported
// from any file that has one.
import {
  listFolderContents,
  downloadFileContent,
  type FolderItem,
} from '@/lib/graph-sharepoint';

export interface CourseTemplate {
  file: FolderItem;
  bytes: Buffer;
}

export async function getCourseTemplatePdf(
  folderName: string,
): Promise<CourseTemplate> {
  const contents = await listFolderContents(folderName);
  const file = contents.find((item) =>
    item.name.toLowerCase().endsWith('.pdf'),
  );

  if (!file) {
    throw new Error(
      `No .pdf certificate template found in folder "${folderName}"`,
    );
  }

  const bytes = await downloadFileContent(file.id);
  return { file, bytes };
}
