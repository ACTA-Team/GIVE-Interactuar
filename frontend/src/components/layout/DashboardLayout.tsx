'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { IconMenu2 } from '@tabler/icons-react';
import { Sidebar } from './Sidebar';
import Image from 'next/image';
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
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <IconMenu2 className="h-5 w-5" />
          </button>
          <Image
            src="/assets/interactuar/interactuar-logo.svg"
            alt="Interactuar"
            width={150}
            height={150}
          />
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
