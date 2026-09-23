import { usePathname, useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { ROUTES } from '@/lib/constants';
import { MIN_HISTORY_LENGTH_FOR_BACK } from '../../notFound.constants';

/** Nothing to subscribe to: the value only ever flips from the server snapshot to the client one. */
const subscribeToNothing = () => () => {};

/**
 * True once the page is running in the browser. The 404 is prerendered as a single static shell
 * for every unmatched URL, so anything path-specific must wait for hydration — rendering it in
 * the first pass would mismatch the server HTML (React error 418).
 */
const useIsHydrated = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

export const useNotFoundScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useIsHydrated();

  /** Going back is a dead end for a visitor who landed here from outside: send them home instead. */
  const goBack = () => {
    if (window.history.length > MIN_HISTORY_LENGTH_FOR_BACK) {
      router.back();
      return;
    }
    router.push(ROUTES.HOME);
  };

  return { missingPath: isHydrated ? pathname : null, goBack };
};
