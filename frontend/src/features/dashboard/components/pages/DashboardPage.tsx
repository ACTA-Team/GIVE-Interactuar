import { StatsCard } from '../ui/StatsCard';

interface DashboardStats {
  totalEntrepreneurs: number;
  activeLoans: number;
  totalCredentialsIssued: number;
  // TODO: calculate from financial_profiles once data is imported
  avgIncomeGrowthPct: number | null;
}

interface DashboardPageProps {
  stats: DashboardStats;
}

// Data is fetched server-side in app/(dashboard)/dashboard/page.tsx
// TODO: add recent activity feed
// TODO: add quick-action buttons (new credential, sync forms)
// TODO: add chart for credentials issued over time
export function DashboardPage({ stats }: DashboardPageProps) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total clientes"
          value={stats.totalEntrepreneurs}
          description="Registrados en la organización"
        />
        <StatsCard
          label="Créditos vigentes"
          value={stats.activeLoans}
          description="Préstamos activos"
        />
        <StatsCard
          label="Credenciales emitidas"
          value={stats.totalCredentialsIssued}
          description="Via ACTA SDK"
        />
        <StatsCard
          label="Crecimiento ingresos"
          value={
            stats.avgIncomeGrowthPct !== null
              ? `${stats.avgIncomeGrowthPct}%`
              : '—'
          }
          description="Promedio antes/después"
        />
      </div>

      {/* TODO: recent credentials table */}
      {/* TODO: last sync run status */}
    </div>
  );
}
