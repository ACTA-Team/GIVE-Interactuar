'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconLayoutDashboard,
  IconUsers,
  IconList,
  IconCertificate,
  IconPlus,
  IconX,
  IconLogout,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { SidebarNavGroup } from './SidebarNavGroup';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, href, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <span
        className={cn('shrink-0', isActive ? 'text-gray-700' : 'text-gray-400')}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function getUserInitials(user: User): string {
  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    '';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } finally {
      setSigningOut(false);
    }
  };

  const isDashboardActive = pathname === ROUTES.dashboard;
  const isEntrepreneursActive = pathname.startsWith(ROUTES.entrepreneurs.list);
  const isCredentialsActive =
    pathname.startsWith(ROUTES.entrepreneurs.storage) ||
    pathname.startsWith('/dashboard/credentials/client/');

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 -mb-2 -mt-2">
          <Image
            src="/assets/interactuar/interactuar-logo.svg"
            alt="Interactuar"
            width={180}
            height={56}
          />
        </div>
        <button
          onClick={onMobileClose}
          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
        >
          <IconX className="h-5 w-5" />
        </button>
      </div>

      <hr className="mx-3 border-gray-100" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        <NavItem
          icon={<IconLayoutDashboard className="h-4 w-4" />}
          label={t('nav.dashboard')}
          href={ROUTES.dashboard}
          isActive={isDashboardActive}
          onClick={onMobileClose}
        />

        <hr className="my-3 border-gray-100" />

        <NavItem
          icon={<IconUsers className="h-4 w-4" />}
          label={t('nav.entrepreneurs')}
          href={ROUTES.entrepreneurs.list}
          isActive={isEntrepreneursActive}
          onClick={onMobileClose}
        />

        <SidebarNavGroup
          icon={<IconCertificate className="h-4 w-4" />}
          label={t('nav.credentials')}
          defaultOpen={isCredentialsActive}
        >
          <NavItem
            icon={<IconList className="h-4 w-4" />}
            label={t('nav.list')}
            href={ROUTES.entrepreneurs.storage}
            isActive={
              pathname === ROUTES.entrepreneurs.storage ||
              pathname.startsWith('/dashboard/credentials/client/')
            }
            onClick={onMobileClose}
          />
          <NavItem
            icon={<IconPlus className="h-4 w-4" />}
            label={t('nav.newCredential')}
            href={ROUTES.credentials.new}
            isActive={pathname === ROUTES.credentials.new}
            onClick={onMobileClose}
          />
        </SidebarNavGroup>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
              {getUserInitials(user)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-gray-900">
                {user.user_metadata?.full_name ??
                  user.user_metadata?.name ??
                  user.email}
              </span>
              {(user.user_metadata?.full_name || user.user_metadata?.name) && (
                <span className="truncate text-xs text-gray-400">
                  {user.email}
                </span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title={t('auth.signOut')}
              className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <IconLogout className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden h-full w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
