'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: 'Empresarios',
    href: ROUTES.entrepreneurs.list,
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    // TODO: wire Supabase sign-out
    window.location.href = '/';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#002E5C] border-r border-[#0A3D6E]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[#0A3D6E] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F15A24]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-white"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Interactuar</h2>
            <p className="text-xs text-white/60">Panel de Asesores</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.dashboard &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0A3D6E] text-white'
                    : 'text-white/70 hover:bg-[#0A3D6E]/50 hover:text-white',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-[#0A3D6E] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3D6E] text-white font-medium text-sm">
              JP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Juan Pérez
              </p>
              <p className="text-xs text-white/60 truncate">
                asesor@interactuar.com
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-[#0A3D6E]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
