import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@/lib/apiError';
import { ROUTES } from '@/lib/constants';
import { makeApiError } from '@/test/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { authApi } from '../../auth.api';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { VerifyEmailScreen } from './VerifyEmailScreen';

const HTTP_BAD_REQUEST = 400;
const TOKEN = 'verify-token-1';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock('../../auth.api', () => ({ authApi: { verifyEmail: vi.fn() } }));

const verifyEmail = vi.mocked(authApi.verifyEmail);

const openWith = (token: string | null = TOKEN) =>
  window.history.replaceState(null, '', token === null ? ROUTES.VERIFY_EMAIL : `${ROUTES.VERIFY_EMAIL}?token=${token}`);

describe('VerifyEmailScreen', () => {
  const loadSession = vi.fn(async () => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    verifyEmail.mockResolvedValue(undefined);
    useAuthStore.setState({ status: AUTH_STATUS.UNAUTHENTICATED, loadSession });
    openWith();
  });

  it('spends the token only when the visitor clicks, never on load', async () => {
    renderWithProviders(<VerifyEmailScreen />);

    // Mail scanners fetch every link in a message; an automatic call would burn the single-use token.
    expect(verifyEmail).not.toHaveBeenCalled();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Verify my email' }));

    expect(await screen.findByRole('status')).toHaveTextContent(/verified/i);
    expect(verifyEmail).toHaveBeenCalledWith(TOKEN);
    expect(screen.getByRole('link', { name: 'Continue to the app' })).toHaveAttribute('href', ROUTES.HOME);
  });

  it('refreshes a signed-in session so the banner disappears', async () => {
    useAuthStore.setState({ status: AUTH_STATUS.AUTHENTICATED, loadSession });
    renderWithProviders(<VerifyEmailScreen />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Verify my email' }));

    await waitFor(() => expect(loadSession).toHaveBeenCalledTimes(1));
  });

  it('leaves a signed-out visitor alone rather than reloading a session they do not have', async () => {
    renderWithProviders(<VerifyEmailScreen />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Verify my email' }));

    await screen.findByRole('status');
    expect(loadSession).not.toHaveBeenCalled();
  });

  it('says what to do when the link carries no token', () => {
    openWith(null);

    renderWithProviders(<VerifyEmailScreen />);

    expect(screen.getByRole('alert')).toHaveTextContent(/not valid/i);
    expect(screen.queryByRole('button', { name: 'Verify my email' })).not.toBeInTheDocument();
  });

  it('keeps the button and explains the next step when the token is spent', async () => {
    verifyEmail.mockRejectedValue(
      makeApiError({
        status: HTTP_BAD_REQUEST,
        code: ERROR_CODES.INVALID_VERIFICATION_TOKEN,
        message: 'This verification link has expired',
      }),
    );
    renderWithProviders(<VerifyEmailScreen />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Verify my email' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('This verification link has expired'));
    expect(screen.getByRole('alert')).toHaveTextContent(/request a new link/i);
  });
});
