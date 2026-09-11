import { NEXT_PARAM, ROUTES } from '@/lib/constants';

/**
 * Only same-origin absolute paths are accepted, so `next` cannot be abused as an open redirect.
 * `//host` and `/\host` are rejected explicitly: browsers resolve both as another origin.
 */
export const getSafeNextPath = (next: string | null): string =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : ROUTES.DASHBOARD;

export const buildLoginUrl = (returnTo: string): string =>
  `${ROUTES.LOGIN}?${NEXT_PARAM}=${encodeURIComponent(returnTo)}`;

/**
 * The guards read the query string from `window` rather than `useSearchParams`, because that
 * hook in a layout forces a CSR bailout for every page beneath it (and a Suspense boundary),
 * costing the app its static prerendering. Both helpers run inside effects, where `window` exists.
 */
export const getReturnToPath = (pathname: string): string => `${pathname}${window.location.search}`;

export const getNextParam = (): string | null => new URLSearchParams(window.location.search).get(NEXT_PARAM);
