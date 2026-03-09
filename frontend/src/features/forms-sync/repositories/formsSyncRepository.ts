import type { SupabaseClient } from '@supabase/supabase-js'
import type { FormSubmissionRaw, FormSyncRun, SyncStatus } from '../types'

// TODO: switch to SupabaseClient<Database> once database.types.ts is generated
export function createFormsSyncRepository(client: SupabaseClient) {
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
        )
      if (error) throw error
    },

    async createSyncRun(formSourceId: string): Promise<string> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('form_sync_runs')
        .insert({ form_source_id: formSourceId, status: 'running' as SyncStatus })
        .select('id')
        .single()
      if (error) throw error
      return data.id as string
    },

    async updateSyncRun(
      id: string,
      update: Partial<Pick<FormSyncRun, 'status' | 'finishedAt' | 'totalFetched' | 'totalInserted' | 'totalUpdated' | 'totalFailed' | 'errorLog'>>,
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
        .eq('id', id)
      if (error) throw error
    },
  }
}

export type FormsSyncRepository = ReturnType<typeof createFormsSyncRepository>
