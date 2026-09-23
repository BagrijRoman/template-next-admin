import type { ReactNode } from 'react';

type PublicLayoutProps = {
  children: ReactNode;
};

/**
 * Deliberately guard-free, unlike every other route group: a link from an email must work for a
 * signed-out visitor and for a signed-in one alike. `GuestGuard` would bounce the signed-in half
 * away before they could act, and `AuthGuard` would bounce the signed-out half. Add a page here
 * only when it is meant to be public, and never anything that reads account data.
 */
const PublicLayout = ({ children }: PublicLayoutProps) => (
  <main className="flex flex-1 items-center justify-center bg-page p-4">
    <div className="w-full max-w-form rounded-card border border-default bg-surface p-8 shadow-card">{children}</div>
  </main>
);

export default PublicLayout;
