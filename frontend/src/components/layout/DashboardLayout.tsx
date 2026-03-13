'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { IconMenu2 } from '@tabler/icons-react';
import Image from 'next/image';
import { Sidebar } from './Sidebar';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header: menú + logo (móvil) y botones de traducción a la derecha */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Abrir menú"
            >
              <IconMenu2 className="h-5 w-5" />
            </button>
            <Image
              src="/assets/interactuar/interactuar-logo.svg"
              alt="Interactuar"
              width={130}
              height={36}
              className="h-9 w-auto"
            />
          </div>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
