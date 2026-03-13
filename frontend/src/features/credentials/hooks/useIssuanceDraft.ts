'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createCredentialRepository } from '../repositories/credentialRepository';
import { createCredentialService } from '../services/credentialService';
import type { IssuanceDraftInput } from '../schemas';

interface UseIssuanceDraftOptions {
  createdBy: string;
}

export function useIssuanceDraft({
  createdBy,
}: UseIssuanceDraftOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IssuanceDraftInput) => {
      const supabase = createClient();
      const repo = createCredentialRepository(supabase);
      const service = createCredentialService(repo);
      return service.createDraft(input, createdBy);
    },
    onSuccess: () => {
      // TODO: invalidate and redirect to draft detail
      void queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}
