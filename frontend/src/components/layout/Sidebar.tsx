'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconLayoutDashboard,
  IconUsers,
  IconList,
  IconCertificate,
  IconPlus,
  IconX,
  IconWallet,
  IconPlugOff,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { SidebarNavGroup } from './SidebarNavGroup';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useWalletContext } from '@/lib/stellar/WalletContext';
import { useWalletKit } from '@/lib/stellar/useWalletKit';
import { useSyncExternalStore, useState, type ReactNode } from 'react';

const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

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

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('common');
  const wallet = useWalletContext();
  const mounted = useIsMounted();
  const { disconnectWalletKit } = useWalletKit();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectWalletKit();
    } finally {
      setDisconnecting(false);
    }
  };

  const isDashboardActive = pathname === ROUTES.dashboard;
  const isEntrepreneursActive = pathname.startsWith(ROUTES.entrepreneurs.list);
  const isCredentialsActive =
    pathname.startsWith(ROUTES.entrepreneurs.storage) ||
    pathname.startsWith('/dashboard/entrepreneurs/credentials/details/');

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Image
            src="/interactuar-logo.svg"
            alt="Interactuar"
            width={150}
            height={150}
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
              pathname.startsWith(
                '/dashboard/entrepreneurs/credentials/details/',
              )
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
        {mounted && wallet.connected && wallet.walletAddress && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <IconWallet className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-medium text-emerald-700">
                {wallet.walletName ?? t('wallet.connected')}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 truncate">
                {truncateAddress(wallet.walletAddress)}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              title={t('wallet.disconnect')}
              className="shrink-0 rounded p-1 text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-red-500 disabled:opacity-50"
            >
              <IconPlugOff className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <LanguageSwitcher />
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
            GI
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {t('footer.team')}
            </span>
            <span className="text-xs text-gray-400">
              {t('footer.organization')}
            </span>
          </div>
        </div>
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
