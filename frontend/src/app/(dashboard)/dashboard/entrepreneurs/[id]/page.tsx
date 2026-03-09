import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createEntrepreneurRepository } from '@/features/entrepreneurs/repositories/entrepreneurRepository'
import { createEntrepreneurService } from '@/features/entrepreneurs/services/entrepreneurService'
import { EntrepreneurDetailPage } from '@/features/entrepreneurs/components/pages/EntrepreneurDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const repo = createEntrepreneurRepository(supabase)
  const service = createEntrepreneurService(repo)
  const entrepreneur = await service.getById(id)

  if (!entrepreneur) notFound()

  return <EntrepreneurDetailPage entrepreneur={entrepreneur} />
}
