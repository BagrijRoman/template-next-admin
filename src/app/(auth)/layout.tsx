import type { ReactNode } from 'react';
import { GuestGuard } from '@/features/auth';

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <GuestGuard>
    <main className="flex flex-1 items-center justify-center bg-page p-4">
      <div className="w-full max-w-form rounded-card border border-default bg-surface p-8 shadow-card">{children}</div>
    </main>
  </GuestGuard>
);

export default AuthLayout;
