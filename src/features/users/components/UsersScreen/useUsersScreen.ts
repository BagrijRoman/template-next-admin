import { useRouter, useSearchParams } from 'next/navigation';
import { FIRST_PAGE, ROUTES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { PAGE_PARAM } from '../../users.constants';
import { useUsersQuery } from '../../users.queries';

/** Anything that is not a whole page number is treated as the first page, never as an error. */
const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
};

export const useUsersScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get(PAGE_PARAM));
  const { data, isPending, isFetching, error } = useUsersQuery(page);

  // The page lives in the URL, so a paged list can be linked to, reloaded and returned to after
  // signing in; the query key follows it and each page is cached on its own.
  const goToPage = (nextPage: number) => router.push(`${ROUTES.USERS}?${PAGE_PARAM}=${nextPage}`);

  return {
    page,
    users: data?.data,
    total: data?.total ?? 0,
    isPending,
    isFetching,
    errorMessage: error ? getErrorMessage(error) : null,
    goToPage,
  };
};
