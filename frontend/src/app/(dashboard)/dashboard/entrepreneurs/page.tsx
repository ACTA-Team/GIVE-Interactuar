import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createEntrepreneurRepository } from '@/features/entrepreneurs/repositories/entrepreneurRepository'
import { createEntrepreneurService } from '@/features/entrepreneurs/services/entrepreneurService'
import { EntrepreneursListPage } from '@/features/entrepreneurs/components/pages/EntrepreneursListPage'

// TODO: add searchParams prop to support URL-driven filters (query, municipality, department)
export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const repo = createEntrepreneurRepository(supabase)
  const service = createEntrepreneurService(repo)
  const entrepreneurs = await service.list({ active: true })

  return <EntrepreneursListPage entrepreneurs={entrepreneurs} />
}
