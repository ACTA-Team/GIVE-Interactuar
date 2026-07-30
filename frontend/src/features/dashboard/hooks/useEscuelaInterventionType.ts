'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { DistributionItem } from '../services/dashboardCalculationsService';

const PAGE_SIZE = 1000;

async function fetchInterventionTypeDistribution(): Promise<
  DistributionItem[]
> {
  const supabase = createClient();
  const counts: Record<string, number> = {};
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('escuela')
      .select('intervention_type')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const rows = (data ?? []) as { intervention_type: string | null }[];
    rows.forEach((row) => {
      const key = row.intervention_type?.trim() || 'Sin especificar';
      counts[key] = (counts[key] ?? 0) + 1;
    });

    hasMore = rows.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);
}

export function useEscuelaInterventionType() {
  return useQuery<DistributionItem[]>({
    queryKey: ['escuela-intervention-type'],
    queryFn: fetchInterventionTypeDistribution,
  });
}
