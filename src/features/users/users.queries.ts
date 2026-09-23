import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { usersApi } from './users.api';
import { USERS_PAGE_SIZE } from './users.constants';

/** Pages are 1-based in the URL; the API counts in offsets. */
export const useUsersQuery = (page: number) => {
  const limit = USERS_PAGE_SIZE;
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: queryKeys.users.list({ limit, offset }),
    queryFn: () => usersApi.list({ limit, offset }),
    // The table renders the failure itself (a non-admin gets a 403 here), so no toast.
    meta: { silent: true },
    // Keeps the current page on screen while the next one loads instead of flashing a spinner.
    placeholderData: keepPreviousData,
  });
};
