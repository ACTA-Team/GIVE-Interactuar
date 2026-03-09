import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository'
import { createCredentialService } from '@/features/credentials/services/credentialService'
import { CredentialsListPage } from '@/features/credentials/components/pages/CredentialsListPage'

// TODO: add searchParams prop for status/type filters
export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const repo = createCredentialRepository(supabase)
  const service = createCredentialService(repo)
  const credentials = await service.list()

  return <CredentialsListPage credentials={credentials} />
}
