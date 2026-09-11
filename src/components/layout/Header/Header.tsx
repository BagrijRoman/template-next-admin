'use client';

import { useAuthStore } from '@/features/auth';

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{user?.email}</span>
      <button
        type="button"
        // No navigation here: clearing the session flips the store to unauthenticated and
        // AuthGuard performs the redirect; a second router.replace would only race it.
        onClick={() => void signOut()}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Sign out
      </button>
    </header>
  );
};
