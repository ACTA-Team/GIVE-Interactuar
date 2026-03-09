'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createEntrepreneurRepository } from '../repositories/entrepreneurRepository';
import type { EntrepreneurFilters } from '../types';

export function useEntrepreneurs(filters?: EntrepreneurFilters) {
  return useQuery({
    queryKey: ['entrepreneurs', filters],
    queryFn: () => {
      const supabase = createClient();
      const repo = createEntrepreneurRepository(supabase);
      return repo.findAll(filters);
    },
  });
}
