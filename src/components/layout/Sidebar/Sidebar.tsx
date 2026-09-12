'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from './Sidebar.constants';

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex w-sidebar shrink-0 flex-col border-r border-default bg-surface">
      <div className="px-6 py-5 text-lg font-semibold text-foreground">Admin</div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ label, href }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-control px-3 py-2 text-sm font-medium transition-colors duration-(--duration-fast)',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:bg-surface-muted hover:text-foreground',
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
