'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './Sidebar.constants';

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="px-6 py-5 text-lg font-semibold">Admin</div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? 'page' : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive(pathname, href)
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
