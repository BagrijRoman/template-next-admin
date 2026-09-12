'use client';

import type { ReactNode } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuthGuard } from './useAuthGuard';

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * The route guard: with tokens in localStorage the server cannot pre-check anything, so this
 * client-side validation against the API is the only gate — expired or revoked sessions are
 * sent back to the login page.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated } = useAuthGuard();

  if (!isAuthenticated) {
    return <FullScreenLoader />;
  }

  return children;
};
