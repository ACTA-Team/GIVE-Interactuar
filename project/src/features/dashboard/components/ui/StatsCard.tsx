interface StatsCardProps {
  label: string
  value: number | string
  description?: string
  // TODO: add trend prop (up/down + percentage) when historical data is available
}

export function StatsCard({ label, value, description }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
  )
}
