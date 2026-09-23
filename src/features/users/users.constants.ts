import type { UserRole } from './users.types';

export const USERS_ENDPOINT = '/users';

/** Matches the backend's `PAGE_LIMIT_DEFAULT`; the API caps a page at 100. */
export const USERS_PAGE_SIZE = 20;

/** Query param carrying the 1-based page number, so a page can be linked to and reloaded. */
export const PAGE_PARAM = 'page';

export const ROLE_LABELS: Record<UserRole, string> = { user: 'User', admin: 'Admin' };

export const VERIFIED_LABEL = 'Verified';
export const UNVERIFIED_LABEL = 'Pending';
