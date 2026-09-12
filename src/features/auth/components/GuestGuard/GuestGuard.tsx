'use client';

import type { ReactNode } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useGuestGuard } from './useGuestGuard';

type GuestGuardProps = {
  children: ReactNode;
};

/**
 * Keeps signed-in users off guest-only pages. Session state comes from the store — the same
 * source `AuthGuard` reads — so the two guards can never disagree and bounce a visitor between
 * `/login` and the app.
 */
export const GuestGuard = ({ children }: GuestGuardProps) => {
  const { isGuest } = useGuestGuard();

  if (!isGuest) {
    return <FullScreenLoader />;
  }

  return children;
};
