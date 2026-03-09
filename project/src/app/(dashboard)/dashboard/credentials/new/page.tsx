import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createOrganizationRepository } from '@/features/organizations/repositories/organizationRepository'
import { createOrganizationService } from '@/features/organizations/services/organizationService'
import { CredentialIssuancePage } from '@/features/credentials/components/pages/CredentialIssuancePage'
import { ROUTES } from '@/lib/constants/routes'

export default async function Page() {
  const supabase = await createServerSupabaseClient()

  // TODO: define and use auth route constant once login flow is built
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orgRepo = createOrganizationRepository(supabase)
  const orgService = createOrganizationService(orgRepo)
  const internalUser = await orgService.resolveCurrentUser(user.id)

  if (!internalUser) redirect('/login')

  // TODO: check internalUser.role — only 'admin' | 'operator' can issue credentials
  void ROUTES

  return (
    <CredentialIssuancePage
      organizationId={internalUser.organizationId}
      userId={internalUser.id}
    />
  )
}
