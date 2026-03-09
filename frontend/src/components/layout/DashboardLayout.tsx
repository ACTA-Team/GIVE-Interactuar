import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

// TODO: add auth guard — redirect to login if no session
// TODO: add top header bar (breadcrumbs, user menu) when needed
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
