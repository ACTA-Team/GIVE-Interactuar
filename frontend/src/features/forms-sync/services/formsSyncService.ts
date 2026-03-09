import type { GoogleFormsClient } from '@/lib/services/googleFormsClient';
import { mapGoogleResponseToRawSubmission } from '../mappers/formsResponseMapper';
import type { FormsSyncRepository } from '../repositories/formsSyncRepository';

export function createFormsSyncService(
  repo: FormsSyncRepository,
  formsClient: GoogleFormsClient,
) {
  return {
    async syncForm(formSourceId: string): Promise<void> {
      const runId = await repo.createSyncRun(formSourceId);
      let totalFetched = 0;
      let totalInserted = 0;
      const errorLog: unknown[] = [];

      try {
        // TODO: handle pagination (nextPageToken loop)
        const responses = await formsClient.listResponses();
        totalFetched = responses.length;

        for (const response of responses) {
          try {
            const submission = mapGoogleResponseToRawSubmission(
              formSourceId,
              response,
            );
            await repo.upsertSubmission(submission);
            totalInserted++;
          } catch (err) {
            errorLog.push({
              responseId: response.responseId,
              error: String(err),
            });
          }
        }

        await repo.updateSyncRun(runId, {
          status: errorLog.length > 0 ? 'partial_success' : 'success',
          finishedAt: new Date().toISOString(),
          totalFetched,
          totalInserted,
          totalUpdated: 0,
          totalFailed: errorLog.length,
          errorLog,
        });
      } catch (err) {
        await repo.updateSyncRun(runId, {
          status: 'failed',
          finishedAt: new Date().toISOString(),
          totalFetched,
          totalInserted,
          totalFailed: 1,
          errorLog: [{ error: String(err) }],
        });
        throw err;
      }
    },
  };
}

export type FormsSyncService = ReturnType<typeof createFormsSyncService>;
