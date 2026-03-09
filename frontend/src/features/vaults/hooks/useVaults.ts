'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { createVaultRepository } from '../repositories/vaultRepository'

export function useVaults(entrepreneurId: string) {
  return useQuery({
    queryKey: ['vaults', entrepreneurId],
    queryFn: () => {
      const supabase = createClient()
      const repo = createVaultRepository(supabase)
      return repo.findByEntrepreneur(entrepreneurId)
    },
    enabled: Boolean(entrepreneurId),
  })
}
