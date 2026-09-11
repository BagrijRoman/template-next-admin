'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/lib/constants';

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{user?.email}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Sign out
      </button>
    </header>
  );
};
