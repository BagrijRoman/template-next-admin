'use client';

import { Button } from '@/components/ui';
import { useAuthStore, useSignOutMutation } from '@/features/auth';

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const signOutMutation = useSignOutMutation();

  return (
    <header className="flex h-header items-center justify-between border-b border-default bg-surface px-6">
      <span className="text-sm text-muted">{user?.email}</span>
      {/* No navigation here: clearing the session flips the store to unauthenticated and
          AuthGuard performs the redirect; a second router.replace would only race it. */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => signOutMutation.mutate()}
        isLoading={signOutMutation.isPending}
      >
        Sign out
      </Button>
    </header>
  );
};
