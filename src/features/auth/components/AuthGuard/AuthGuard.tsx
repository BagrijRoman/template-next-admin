'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuthStore } from '../../auth.store';
import { buildLoginUrl } from '../../auth.utils';

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * Second line of defence after proxy.ts: validates the session against the API
 * and sends expired or revoked sessions back to the login page.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const status = useAuthStore((state) => state.status);
  const loadSession = useAuthStore((state) => state.loadSession);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'idle') {
      void loadSession();
    }
  }, [status, loadSession]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(buildLoginUrl(pathname));
    }
  }, [status, pathname, router]);

  if (status !== 'authenticated') {
    return <FullScreenLoader />;
  }

  return children;
};
