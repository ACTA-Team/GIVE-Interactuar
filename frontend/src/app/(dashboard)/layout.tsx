import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// TODO: add auth guard here — redirect to /login if no session
// Example:
//   const supabase = await createServerSupabaseClient()
//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) redirect('/login')

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
