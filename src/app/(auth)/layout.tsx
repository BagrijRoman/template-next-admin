import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-black">
    <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {children}
    </div>
  </main>
);

export default AuthLayout;
