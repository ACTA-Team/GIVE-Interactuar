import type { GoogleFormResponse } from '@/lib/services/googleFormsClient';
import type { FormSubmissionRaw } from '../types';

// Maps a Google Forms API response to the raw submission shape expected by the repository
// TODO: compute checksum (e.g. SHA-256 of rawAnswers) to detect duplicate submissions
export function mapGoogleResponseToRawSubmission(
  formSourceId: string,
  response: GoogleFormResponse,
): Omit<FormSubmissionRaw, 'id' | 'syncedAt' | 'createdAt'> {
  return {
    formSourceId,
    externalResponseId: response.responseId,
    submittedAt: response.lastSubmittedTime ?? null,
    responderEmail: null, // TODO: extract from response.respondentEmail if available
    rawPayload: response as unknown as Record<string, unknown>,
    rawAnswers: response.answers as unknown as Record<string, unknown>,
    checksum: null, // TODO: implement SHA-256 checksum
  };
}
