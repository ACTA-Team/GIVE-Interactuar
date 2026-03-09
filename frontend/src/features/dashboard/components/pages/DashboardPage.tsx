import { StatsCard } from '../ui/StatsCard'

interface DashboardStats {
  totalEntrepreneurs: number
  totalCredentialsIssued: number
  totalCredentialsDraft: number
  totalVaults: number
}

interface DashboardPageProps {
  stats: DashboardStats
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
          label="Emprendedores"
          value={stats.totalEntrepreneurs}
          description="Registrados en la organización"
        />
        <StatsCard
          label="Credenciales emitidas"
          value={stats.totalCredentialsIssued}
          description="Estado: issued"
        />
        <StatsCard
          label="Borradores"
          value={stats.totalCredentialsDraft}
          description="Pendientes de emitir"
        />
        <StatsCard
          label="Vaults activos"
          value={stats.totalVaults}
          description="Contratos on-chain"
        />
      </div>

      {/* TODO: recent credentials table */}
      {/* TODO: last sync run status */}
    </div>
  )
}
