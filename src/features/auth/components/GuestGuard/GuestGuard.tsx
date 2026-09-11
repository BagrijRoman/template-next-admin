'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { getNextParam, getSafeNextPath } from '../../auth.utils';

type GuestGuardProps = {
  children: ReactNode;
};

/**
 * Keeps signed-in users off guest-only pages. Session state comes from the store — the same
 * source `AuthGuard` reads — so the two guards can never disagree and bounce a visitor between
 * `/login` and the app. Guests render immediately: the loader appears only while a session is
 * being validated or a redirect is pending.
 */
export const GuestGuard = ({ children }: GuestGuardProps) => {
  const status = useAuthStore((state) => state.status);
  const loadSession = useAuthStore((state) => state.loadSession);
  const router = useRouter();

  useEffect(() => {
    if (status === AUTH_STATUS.IDLE) {
      void loadSession();
    }
  }, [status, loadSession]);

  useEffect(() => {
    if (status === AUTH_STATUS.AUTHENTICATED) {
      // Honour the return path the same way LoginForm does, so a deep link survives the bounce.
      router.replace(getSafeNextPath(getNextParam()));
    }
  }, [status, router]);

  if (status === AUTH_STATUS.LOADING || status === AUTH_STATUS.AUTHENTICATED) {
    return <FullScreenLoader />;
  }

  return children;
};
