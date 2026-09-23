import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_STATUS } from '@/features/auth/auth.constants';
import { useAuthStore } from '@/features/auth/auth.store';
import type { User } from '@/features/auth/auth.types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Header } from './Header';
import { USER_ROLES } from '@/features/users/users.types';

const user: User = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'A',
  lastName: 'B',
  emailVerified: true,
  role: USER_ROLES.ADMIN,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('Header', () => {
  const signOut = vi.fn(async () => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user, status: AUTH_STATUS.AUTHENTICATED, signOut });
  });

  it('shows the signed-in user and signs out on click', async () => {
    renderWithProviders(<Header />);

    expect(screen.getByText(user.email)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
  });
});
