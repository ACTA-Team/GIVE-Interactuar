'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type DashboardMetrics = {
  totalFinanciado: number;
  montoCarteraVencida: number;
  personasEnPrograma: number;
};

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();

  // Total financiado y monto cartera vencida desde cartera_vencida
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: carteraData, error: carteraError } = await (supabase as any)
    .from('cartera_vencida')
    .select('initial_amount, overdue_balance');

  if (carteraError) throw carteraError;

  const rows = (carteraData ?? []) as {
    initial_amount: number | null;
    overdue_balance: number | null;
  }[];
  const totalFinanciado = rows.reduce(
    (sum, r) => sum + (r.initial_amount ?? 0),
    0,
  );
  const montoCarteraVencida = rows.reduce(
    (sum, r) => sum + (r.overdue_balance ?? 0),
    0,
  );

  // Personas en programa (status = 'Activo') desde empresarios
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error: empresariosError } = await (supabase as any)
    .from('empresarios')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Activo');

  if (empresariosError) throw empresariosError;

  return {
    totalFinanciado,
    montoCarteraVencida,
    personasEnPrograma: count ?? 0,
  };
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
  });
}
