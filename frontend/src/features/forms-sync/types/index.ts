export type SyncStatus = 'running' | 'success' | 'partial_success' | 'failed';

export interface FormSource {
  id: string;
  provider: string;
  externalFormId: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmissionRaw {
  id: string;
  formSourceId: string;
  externalResponseId: string;
  submittedAt: string | null;
  responderEmail: string | null;
  rawPayload: Record<string, unknown>;
  rawAnswers: Record<string, unknown>;
  checksum: string | null;
  syncedAt: string;
  createdAt: string;
}

export interface FormSyncRun {
  id: string;
  formSourceId: string;
  status: SyncStatus;
  startedAt: string;
  finishedAt: string | null;
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalFailed: number;
  errorLog: unknown[];
  metadata: Record<string, unknown>;
  createdAt: string;
}
