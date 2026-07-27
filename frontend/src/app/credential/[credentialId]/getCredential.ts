import { cache } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { createCredentialService } from '@/features/credentials/services/credentialService';

// Deduped per-request: generateMetadata and the page component both need
// the same lookup, and React's cache() collapses them into one query.
export const getCachedCredential = cache(async (credentialId: string) => {
  const supabase = await createServerSupabaseClient();
  const repo = createCredentialRepository(supabase);
  const service = createCredentialService(repo);
  return service.getByPublicId(credentialId);
});
