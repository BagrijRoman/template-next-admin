import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { buildLoginUrl, getReturnToPath } from '../../auth.utils';

export const useAuthGuard = () => {
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

  return { isAuthenticated: status === AUTH_STATUS.AUTHENTICATED };
};
