'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createCredentialRepository } from '../repositories/credentialRepository';
import { createCredentialService } from '../services/credentialService';
import type { IssuanceDraftInput } from '../schemas';

interface UseIssuanceDraftOptions {
  organizationId: string;
  createdBy: string;
}

export function useIssuanceDraft({
  organizationId,
  createdBy,
}: UseIssuanceDraftOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IssuanceDraftInput) => {
      const supabase = createClient();
      const repo = createCredentialRepository(supabase);
      const service = createCredentialService(repo);
      return service.createDraft(input, organizationId, createdBy);
    },
    onSuccess: () => {
      // TODO: invalidate and redirect to draft detail
      void queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}
