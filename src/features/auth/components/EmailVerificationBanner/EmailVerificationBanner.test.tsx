import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@/lib/apiError';
import { makeApiError } from '@/test/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { User } from '@/features/users';
import { authApi } from '../../auth.api';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { EmailVerificationBanner } from './EmailVerificationBanner';

const HTTP_TOO_MANY_REQUESTS = 429;

vi.mock('../../auth.api', () => ({ authApi: { sendVerification: vi.fn() } }));

const sendVerification = vi.mocked(authApi.sendVerification);

const user: User = {
  id: 'u1',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  emailVerified: false,
  role: 'user',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const signIn = (emailVerified: boolean) =>
  useAuthStore.setState({ user: { ...user, emailVerified }, status: AUTH_STATUS.AUTHENTICATED });

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, status: AUTH_STATUS.IDLE });
    sendVerification.mockResolvedValue(undefined);
  });

  it('stays out of the way for a verified address and before the session loads', () => {
    const { unmount } = renderWithProviders(<EmailVerificationBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    unmount();

    signIn(true);
    renderWithProviders(<EmailVerificationBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('offers a verification link and confirms once it is on its way', async () => {
    signIn(false);
    renderWithProviders(<EmailVerificationBanner />);

    expect(screen.getByRole('status')).toHaveTextContent('Your email address is not verified yet.');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Send verification link' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/verification link sent/i));
    expect(sendVerification).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Send verification link' })).not.toBeInTheDocument();
  });

  it('shows the wait when too many links have been asked for', async () => {
    signIn(false);
    sendVerification.mockRejectedValue(
      makeApiError({
        status: HTTP_TOO_MANY_REQUESTS,
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Too many requests',
        meta: { retryAfterSeconds: 300 },
      }),
    );
    renderWithProviders(<EmailVerificationBanner />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Send verification link' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Try again in 5 minutes.'));
    expect(screen.getByRole('button', { name: 'Send verification link' })).toBeInTheDocument();
  });
});
