import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createEntrepreneurRepository } from '@/features/entrepreneurs/repositories/entrepreneurRepository';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { CredentialsListPage } from '@/features/credentials/components/pages/CredentialsListPage';
import type { Entrepreneur } from '@/features/entrepreneurs/types';
import type { Credential } from '@/features/credentials/types';

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const entrepreneurRepo = createEntrepreneurRepository(supabase);
  const credentialRepo = createCredentialRepository(supabase);

  let entrepreneurs: Entrepreneur[] = [];
  try {
    entrepreneurs = await entrepreneurRepo.findAll();
  } catch {
    // table may not exist yet
  }

  let allCredentials: Credential[] = [];
  try {
    allCredentials = await credentialRepo.findAll();
  } catch {
    // table may not exist yet
  }

  const countByEntrepreneur = new Map<string, number>();
  for (const c of allCredentials) {
    countByEntrepreneur.set(
      c.entrepreneurId,
      (countByEntrepreneur.get(c.entrepreneurId) ?? 0) + 1,
    );
  }

  const entrepreneursWithCount = entrepreneurs.map((e) => ({
    ...e,
    credentialCount: countByEntrepreneur.get(e.id) ?? 0,
  }));

  return <CredentialsListPage entrepreneurs={entrepreneursWithCount} />;
}
