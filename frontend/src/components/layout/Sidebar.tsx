'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';

interface NavItem {
  label: string;
  href: string;
  // TODO: add icon prop when an icon library is added (e.g. lucide-react)
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.dashboard },
  { label: 'Emprendedores', href: ROUTES.entrepreneurs.list },
  { label: 'Credenciales', href: ROUTES.credentials.list },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white px-3 py-6">
      {/* Logo / brand */}
      <div className="mb-8 px-2">
        <span className="text-lg font-semibold tracking-tight text-gray-900">
          GIVE Interactuar
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === ROUTES.dashboard
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ].join(' ')}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer slot — TODO: add user/org info or sign-out button */}
      <div className="mt-auto px-2 text-xs text-gray-400">
        {/* TODO: render logged-in org name and sign-out link */}
      </div>
    </aside>
  );
}
