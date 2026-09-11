import type { ReactNode } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { AuthGuard } from '@/features/auth';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => (
  <AuthGuard>
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-zinc-50 p-6 dark:bg-black">{children}</main>
      </div>
    </div>
  </AuthGuard>
);

export default AppLayout;
