import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui';
import { UsersScreen } from '@/features/users';

export const metadata: Metadata = {
  title: 'Users',
};

// useSearchParams needs a Suspense boundary: the page number arrives with the URL, not the HTML.
const UsersPage = () => (
  <Suspense fallback={<Spinner className="mx-auto" />}>
    <UsersScreen />
  </Suspense>
);

export default UsersPage;
