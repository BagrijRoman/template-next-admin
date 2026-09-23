import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@/lib/apiError';
import { makeApiError } from '@/test/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { usersApi } from '../../users.api';
import { USERS_PAGE_SIZE } from '../../users.constants';
import type { User, UserPage } from '../../users.types';
import { UsersScreen } from './UsersScreen';

const HTTP_FORBIDDEN = 403;
const TOTAL = 42;

const { push, searchParams } = vi.hoisted(() => ({ push: vi.fn(), searchParams: new URLSearchParams() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

// The screen is the unit here; apiClient's own HTTP behaviour is covered in apiClient.test.ts.
vi.mock('../../users.api', () => ({ usersApi: { list: vi.fn() } }));

const listMock = vi.mocked(usersApi.list);

const makeUser = (index: number): User => ({
  id: `u${index}`,
  email: `user${index}@example.com`,
  firstName: 'User',
  lastName: String(index),
  emailVerified: index % 2 === 0,
  role: 'user',
  createdAt: '2026-01-31T00:00:00.000Z',
  updatedAt: '2026-01-31T00:00:00.000Z',
});

const makePage = (offset: number): UserPage => ({
  data: [makeUser(offset + 1), makeUser(offset + 2)],
  total: TOTAL,
  limit: USERS_PAGE_SIZE,
  offset,
});

describe('UsersScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams.delete('page');
    listMock.mockResolvedValue(makePage(0));
  });

  it('asks for the first page and renders an account per row', async () => {
    renderWithProviders(<UsersScreen />);

    expect(await screen.findByText('user1@example.com')).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledWith({ limit: USERS_PAGE_SIZE, offset: 0 });
    const row = screen.getByText('user2@example.com').closest('tr') as HTMLElement;
    expect(within(row).getByText('User 2')).toBeInTheDocument();
    expect(within(row).getByText('Verified')).toBeInTheDocument();
    expect(within(row).getByText('31 Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('1–20 of 42')).toBeInTheDocument();
  });

  it('reads the page number from the URL and turns it into an offset', async () => {
    searchParams.set('page', '3');

    renderWithProviders(<UsersScreen />);

    await waitFor(() => expect(listMock).toHaveBeenCalledWith({ limit: USERS_PAGE_SIZE, offset: 40 }));
  });

  it('falls back to the first page when the URL carries nonsense', async () => {
    searchParams.set('page', 'everything');

    renderWithProviders(<UsersScreen />);

    await waitFor(() => expect(listMock).toHaveBeenCalledWith({ limit: USERS_PAGE_SIZE, offset: 0 }));
  });

  it('puts the next page in the URL rather than in local state', async () => {
    renderWithProviders(<UsersScreen />);
    await screen.findByText('user1@example.com');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Next' }));

    expect(push).toHaveBeenCalledWith('/users?page=2');
  });

  it('shows a non-admin why the list is empty, in the table and without a pager', async () => {
    listMock.mockRejectedValue(makeApiError({ status: HTTP_FORBIDDEN, code: ERROR_CODES.FORBIDDEN }));

    renderWithProviders(<UsersScreen />);

    expect(await screen.findByText('You do not have permission to do this.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });

  it('says so when the list comes back empty', async () => {
    listMock.mockResolvedValue({ data: [], total: 0, limit: USERS_PAGE_SIZE, offset: 0 });

    renderWithProviders(<UsersScreen />);

    expect(await screen.findByText('No users yet.')).toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
  });
});
