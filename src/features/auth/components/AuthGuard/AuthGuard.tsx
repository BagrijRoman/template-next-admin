'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { buildLoginUrl, getReturnToPath } from '../../auth.utils';

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * The route guard: with tokens in localStorage the server cannot pre-check anything, so this
 * client-side validation against the API is the only gate — expired or revoked sessions are
 * sent back to the login page.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const status = useAuthStore((state) => state.status);
  const loadSession = useAuthStore((state) => state.loadSession);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === AUTH_STATUS.IDLE) {
      void loadSession();
    }
  }, [status, loadSession]);

  useEffect(() => {
    if (status === AUTH_STATUS.UNAUTHENTICATED) {
      // The query string is part of the deep link: /users?page=3 must come back as /users?page=3.
      router.replace(buildLoginUrl(getReturnToPath(pathname)));
    }
  }, [status, pathname, router]);

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return <FullScreenLoader />;
  }

  return children;
};
