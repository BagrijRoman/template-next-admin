'use client';

import { DataTable, type DataTableColumn, Pagination } from '@/components/ui';
import { formatDate } from '@/lib/date';
import { ROLE_LABELS, UNVERIFIED_LABEL, USERS_PAGE_SIZE, VERIFIED_LABEL } from '../../users.constants';
import type { User } from '../../users.types';
import { useUsersScreen } from './useUsersScreen';

const EMPTY_MESSAGE = 'No users yet.';

const columns: DataTableColumn<User>[] = [
  { key: 'name', header: 'Name', render: (user) => `${user.firstName} ${user.lastName}` },
  { key: 'email', header: 'Email', render: (user) => <span className="text-muted">{user.email}</span> },
  { key: 'role', header: 'Role', render: (user) => ROLE_LABELS[user.role] },
  {
    key: 'emailVerified',
    header: 'Status',
    render: (user) => (
      <span className={user.emailVerified ? 'text-success' : 'text-muted'}>
        {user.emailVerified ? VERIFIED_LABEL : UNVERIFIED_LABEL}
      </span>
    ),
  },
  { key: 'createdAt', header: 'Joined', render: (user) => formatDate(user.createdAt) },
];

const getRowKey = (user: User) => user.id;

/** The reference list screen: four states in the table, the page number in the URL. */
export const UsersScreen = () => {
  const { page, users, total, isPending, isFetching, errorMessage, goToPage } = useUsersScreen();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>

      <DataTable
        columns={columns}
        rows={users}
        getRowKey={getRowKey}
        isLoading={isPending}
        error={errorMessage}
        emptyMessage={EMPTY_MESSAGE}
      />

      {!errorMessage && (
        <Pagination page={page} pageSize={USERS_PAGE_SIZE} total={total} onPageChange={goToPage} isBusy={isFetching} />
      )}
    </div>
  );
};
