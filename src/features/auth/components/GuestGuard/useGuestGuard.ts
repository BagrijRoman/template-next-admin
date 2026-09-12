import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { getNextParam, getSafeNextPath } from '../../auth.utils';

export const useGuestGuard = () => {
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

  // Guests render immediately; the loader covers session validation and the pending redirect.
  return { isGuest: status !== AUTH_STATUS.LOADING && status !== AUTH_STATUS.AUTHENTICATED };
};
