'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createCredentialRepository } from '../repositories/credentialRepository';
import type { CredentialFilters } from '../schemas';

export function useCredentials(filters?: CredentialFilters) {
  return useQuery({
    queryKey: ['credentials', filters],
    queryFn: () => {
      const supabase = createClient();
      const repo = createCredentialRepository(supabase);
      return repo.findAll(filters);
    },
  });
}
