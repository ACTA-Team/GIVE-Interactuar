'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createWalletRepository } from '../repositories/walletRepository';

export function useWallets(entrepreneurId: string) {
  return useQuery({
    queryKey: ['wallets', entrepreneurId],
    queryFn: () => {
      const supabase = createClient();
      const repo = createWalletRepository(supabase);
      return repo.findByEntrepreneur(entrepreneurId);
    },
    enabled: Boolean(entrepreneurId),
  });
}
