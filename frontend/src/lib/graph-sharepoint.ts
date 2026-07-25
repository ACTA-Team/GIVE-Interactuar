// Server-only module: no "use client" directive, and must not be imported
// from any file that has one. Also imported directly by scripts/test-graph.ts
// via tsx (outside Next's bundler).
import { getGraphClient } from '@/lib/graph';

function getSiteId(): string {
  const siteId = process.env.MS_SITE_ID;
  if (!siteId) {
    throw new Error('Missing MS_SITE_ID env var');
  }
  return siteId;
}

export interface CreateCourseFolderResult {
  id: string;
}

export async function createCourseFolder(
  courseName: string,
): Promise<CreateCourseFolderResult> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const created = (await client
    .api(`/sites/${siteId}/drive/root/children`)
    .post({
      name: courseName,
      folder: {},
    })) as { id: string };

  return { id: created.id };
}

export interface UploadTemplateExcelResult {
  id: string;
}

export async function uploadTemplateExcel(
  folderId: string,
  fileName: string,
  fileBuffer: Buffer,
): Promise<UploadTemplateExcelResult> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const uploaded = (await client
    .api(`/sites/${siteId}/drive/items/${folderId}:/${fileName}:/content`)
    .put(fileBuffer)) as { id: string };

  return { id: uploaded.id };
}

export async function readExcelRange(
  itemId: string,
  sheetName: string,
  range: string,
): Promise<unknown[][]> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const result = (await client
    .api(
      `/sites/${siteId}/drive/items/${itemId}/workbook/worksheets/${sheetName}/range(address='${range}')`,
    )
    .get()) as { values: unknown[][] };

  return result.values;
}

export async function writeExcelRange(
  itemId: string,
  sheetName: string,
  range: string,
  values: unknown[][],
): Promise<void> {
  const client = getGraphClient();
  const siteId = getSiteId();

  await client
    .api(
      `/sites/${siteId}/drive/items/${itemId}/workbook/worksheets/${sheetName}/range(address='${range}')`,
    )
    .patch({ values });
}

export interface FolderItem {
  id: string;
  name: string;
  isFolder: boolean;
  lastModifiedDateTime: string;
}

type GraphDriveItem = {
  id: string;
  name: string;
  folder?: unknown;
  lastModifiedDateTime: string;
};

function toFolderItem(item: GraphDriveItem): FolderItem {
  return {
    id: item.id,
    name: item.name,
    isFolder: item.folder !== undefined,
    lastModifiedDateTime: item.lastModifiedDateTime,
  };
}

export async function listFolderContents(
  folderPath: string,
): Promise<FolderItem[]> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const result = (await client
    .api(`/sites/${siteId}/drive/root:/${folderPath}:/children`)
    .get()) as { value: GraphDriveItem[] };

  return result.value.map(toFolderItem);
}

export async function downloadFileContent(itemId: string): Promise<Buffer> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const response = await client
    .api(`/sites/${siteId}/drive/items/${itemId}/content`)
    .get();

  if (response instanceof Blob) {
    return Buffer.from(await response.arrayBuffer());
  }

  if (response instanceof ReadableStream) {
    const chunks: Uint8Array[] = [];
    const reader = response.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }

  return Buffer.from(response as ArrayBuffer);
}

export async function listRootFolders(): Promise<FolderItem[]> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const result = (await client
    .api(`/sites/${siteId}/drive/root/children`)
    .get()) as { value: GraphDriveItem[] };

  return result.value.map(toFolderItem).filter((item) => item.isFolder);
}

export async function listWorksheetNames(itemId: string): Promise<string[]> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const worksheets = (await client
    .api(`/sites/${siteId}/drive/items/${itemId}/workbook/worksheets`)
    .get()) as { value: { name: string }[] };

  return worksheets.value.map((sheet) => sheet.name);
}

export async function getFirstWorksheetName(itemId: string): Promise<string> {
  const names = await listWorksheetNames(itemId);
  const name = names[0];
  if (!name) {
    throw new Error(`No worksheets found for item ${itemId}`);
  }
  return name;
}

export async function getWorksheetData(
  itemId: string,
  sheetName?: string,
): Promise<unknown[][]> {
  const client = getGraphClient();
  const siteId = getSiteId();

  const resolvedSheetName = sheetName ?? (await getFirstWorksheetName(itemId));

  const usedRange = (await client
    .api(
      `/sites/${siteId}/drive/items/${itemId}/workbook/worksheets/${resolvedSheetName}/usedRange`,
    )
    .get()) as { values: unknown[][] };

  return usedRange.values;
}
