import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { MIN_HISTORY_LENGTH_FOR_BACK } from '../../notFound.constants';

export const useNotFoundScreen = () => {
  const router = useRouter();
  const pathname = usePathname();

  /** Going back is a dead end for a visitor who landed here from outside: send them home instead. */
  const goBack = () => {
    if (window.history.length > MIN_HISTORY_LENGTH_FOR_BACK) {
      router.back();
      return;
    }
    router.push(ROUTES.HOME);
  };

  return { pathname, goBack };
};
