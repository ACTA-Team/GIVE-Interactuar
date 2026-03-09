import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository'
import { createVerificationService } from '@/features/verification/services/verificationService'
import { VerificationPage } from '@/features/verification/components/pages/VerificationPage'

interface Props {
  params: Promise<{ credentialId: string }>
}

// Dynamic metadata for social sharing / SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { credentialId } = await params
  return {
    title: `Verificar credencial · ${credentialId}`,
    description: 'Verificación de credencial verificable — GIVE Interactuar',
  }
}

// Public page — no auth required
export default async function Page({ params }: Props) {
  const { credentialId } = await params
  const supabase = await createServerSupabaseClient()
  const credRepo = createCredentialRepository(supabase)
  const verificationService = createVerificationService(credRepo)
  const status = await verificationService.verify(credentialId)

  return <VerificationPage status={status} />
}
