import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardPage } from '@/features/dashboard/components/pages/DashboardPage';

export default async function Page() {
  const supabase = await createServerSupabaseClient();

  // TODO: replace with proper count queries once database.types.ts is generated
  // Example:
  //   const { count: totalEntrepreneurs } = await supabase
  //     .from('entrepreneurs').select('*', { count: 'exact', head: true })
  void supabase;

  const stats = {
    totalEntrepreneurs: 0,
    activeLoans: 0,
    totalCredentialsIssued: 0,
    avgIncomeGrowthPct: null,
  };

  return <DashboardPage stats={stats} />;
}
