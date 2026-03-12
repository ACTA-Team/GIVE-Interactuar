import type {
  FormSource,
  FormSubmissionRaw,
  FormSyncRun,
  SyncStatus,
} from '../types';
import type { SupabaseLikeClient } from '@/@types/supabase';

type RawRow = Record<string, unknown>;

function mapFormSource(row: RawRow): FormSource {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    provider: row.provider as string,
    externalFormId: row.external_form_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    active: row.active as boolean,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapFormSubmission(row: RawRow): FormSubmissionRaw {
  return {
    id: row.id as string,
    formSourceId: row.form_source_id as string,
    externalResponseId: row.external_response_id as string,
    submittedAt: (row.submitted_at as string) ?? null,
    responderEmail: (row.responder_email as string) ?? null,
    rawPayload: (row.raw_payload as Record<string, unknown>) ?? {},
    rawAnswers: (row.raw_answers as Record<string, unknown>) ?? {},
    checksum: (row.checksum as string) ?? null,
    syncedAt: row.synced_at as string,
    createdAt: row.created_at as string,
  };
}

function mapFormSyncRun(row: RawRow): FormSyncRun {
  return {
    id: row.id as string,
    formSourceId: row.form_source_id as string,
    status: row.status as SyncStatus,
    startedAt: row.started_at as string,
    finishedAt: (row.finished_at as string) ?? null,
    totalFetched: (row.total_fetched as number) ?? 0,
    totalInserted: (row.total_inserted as number) ?? 0,
    totalUpdated: (row.total_updated as number) ?? 0,
    totalFailed: (row.total_failed as number) ?? 0,
    errorLog: (row.error_log as unknown[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

export function createFormsSyncRepository(client: SupabaseLikeClient) {
  return {
    async upsertSubmission(
      submission: Omit<FormSubmissionRaw, 'id' | 'syncedAt' | 'createdAt'>,
    ): Promise<void> {
      // TODO: upsert on (form_source_id, external_response_id) conflict
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (client as any)
        .from('form_submissions_raw')
        .upsert(
          {
            form_source_id: submission.formSourceId,
            external_response_id: submission.externalResponseId,
            submitted_at: submission.submittedAt,
            responder_email: submission.responderEmail,
            raw_payload: submission.rawPayload,
            raw_answers: submission.rawAnswers,
            checksum: submission.checksum,
          },
          { onConflict: 'form_source_id,external_response_id' },
        );
      if (error) throw error;
    },

    async createSyncRun(formSourceId: string): Promise<string> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('form_sync_runs')
        .insert({
          form_source_id: formSourceId,
          status: 'running' as SyncStatus,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id as string;
    },

    async updateSyncRun(
      id: string,
      update: Partial<
        Pick<
          FormSyncRun,
          | 'status'
          | 'finishedAt'
          | 'totalFetched'
          | 'totalInserted'
          | 'totalUpdated'
          | 'totalFailed'
          | 'errorLog'
        >
      >,
    ): Promise<void> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (client as any)
        .from('form_sync_runs')
        .update({
          status: update.status,
          finished_at: update.finishedAt,
          total_fetched: update.totalFetched,
          total_inserted: update.totalInserted,
          total_updated: update.totalUpdated,
          total_failed: update.totalFailed,
          error_log: update.errorLog,
        })
        .eq('id', id);
      if (error) throw error;
    },

    async findAllSources(
      filters?: { organizationId?: string; provider?: string; active?: boolean },
    ): Promise<FormSource[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (client as any).from('form_sources').select('*');
      if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }
      if (filters?.provider) {
        query = query.eq('provider', filters.provider);
      }
      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }
      query = query.order('name');
      const { data, error } = await query;
      if (error) throw error;
      return (data as RawRow[]).map(mapFormSource);
    },

    async findSourceById(id: string): Promise<FormSource | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('form_sources')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapFormSource(data as RawRow);
    },

    async findAllSubmissions(
      filters?: { formSourceId?: string },
    ): Promise<FormSubmissionRaw[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (client as any).from('form_submissions_raw').select('*');
      if (filters?.formSourceId) {
        query = query.eq('form_source_id', filters.formSourceId);
      }
      query = query.order('submitted_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return (data as RawRow[]).map(mapFormSubmission);
    },

    async findSubmissionById(id: string): Promise<FormSubmissionRaw | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('form_submissions_raw')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapFormSubmission(data as RawRow);
    },

    async findAllSyncRuns(
      filters?: { formSourceId?: string; status?: string },
    ): Promise<FormSyncRun[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (client as any).from('form_sync_runs').select('*');
      if (filters?.formSourceId) {
        query = query.eq('form_source_id', filters.formSourceId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return (data as RawRow[]).map(mapFormSyncRun);
    },

    async findSyncRunById(id: string): Promise<FormSyncRun | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('form_sync_runs')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapFormSyncRun(data as RawRow);
    },
  };
}

export type FormsSyncRepository = ReturnType<typeof createFormsSyncRepository>;
