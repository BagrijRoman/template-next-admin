import { NEXT_PARAM, ROUTES } from '@/lib/constants';

/** Only same-origin absolute paths are accepted, so `next` cannot be abused as an open redirect. */
export const getSafeNextPath = (next: string | null): string =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : ROUTES.DASHBOARD;

export const buildLoginUrl = (returnTo: string): string =>
  returnTo === ROUTES.HOME ? ROUTES.LOGIN : `${ROUTES.LOGIN}?${NEXT_PARAM}=${encodeURIComponent(returnTo)}`;
