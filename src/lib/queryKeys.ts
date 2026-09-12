/**
 * Query-key factory: one entry per domain, every key built from the domain's `all` prefix, so
 * `invalidateQueries({ queryKey: queryKeys.users.all })` sweeps lists, details and everything
 * beneath. Add a domain here whenever a feature starts fetching server state; never inline keys.
 *
 * Convention: `all` → `lists()` → `list(filters)`, and `all` → `details()` → `detail(id)`.
 */
const AUTH_KEY = ['auth'] as const;
const USERS_KEY = ['users'] as const;

export const queryKeys = {
  auth: {
    all: AUTH_KEY,
    me: () => [...AUTH_KEY, 'me'] as const,
  },
  users: {
    all: USERS_KEY,
    lists: () => [...USERS_KEY, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...USERS_KEY, 'list', filters] as const,
    details: () => [...USERS_KEY, 'detail'] as const,
    detail: (id: string) => [...USERS_KEY, 'detail', id] as const,
  },
} as const;
