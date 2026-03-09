'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createEntrepreneurRepository } from '../repositories/entrepreneurRepository';

export function useEntrepreneurDetail(id: string) {
  return useQuery({
    queryKey: ['entrepreneurs', id],
    queryFn: () => {
      const supabase = createClient();
      const repo = createEntrepreneurRepository(supabase);
      return repo.findById(id);
    },
    enabled: Boolean(id),
  });
}
