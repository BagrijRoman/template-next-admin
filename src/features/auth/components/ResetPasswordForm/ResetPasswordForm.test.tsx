import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '@/components/ui';
import { ERROR_CODES } from '@/lib/apiError';
import { ROUTES } from '@/lib/constants';
import { makeApiError } from '@/test/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { authApi } from '../../auth.api';
import { ResetPasswordForm } from './ResetPasswordForm';

const HTTP_BAD_REQUEST = 400;
const TOKEN = 'reset-token-1';
const NEW_PASSWORD = 'NewSecret123';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock('../../auth.api', () => ({ authApi: { resetPassword: vi.fn() } }));

const resetPassword = vi.mocked(authApi.resetPassword);

const openWithToken = (token: string | null = TOKEN) =>
  window.history.replaceState(
    null,
    '',
    token === null ? ROUTES.RESET_PASSWORD : `${ROUTES.RESET_PASSWORD}?token=${token}`,
  );

const submit = async (password = NEW_PASSWORD, confirmation = password) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('New password'), password);
  await user.type(screen.getByLabelText('Confirm new password'), confirmation);
  await user.click(screen.getByRole('button', { name: 'Set new password' }));
};

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ toasts: [] });
    resetPassword.mockResolvedValue(undefined);
    openWithToken();
  });

  it('sends the new password with the token from the link and returns to sign in', async () => {
    renderWithProviders(<ResetPasswordForm />);

    await submit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith(ROUTES.LOGIN));
    expect(resetPassword).toHaveBeenCalledWith({ token: TOKEN, newPassword: NEW_PASSWORD });
    // Every session is revoked on a reset, so the visitor is told to sign in again.
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: 'success', title: 'Password updated' });
  });

  it('offers a new link instead of a form when the URL carries no token', () => {
    openWithToken(null);

    renderWithProviders(<ResetPasswordForm />);

    expect(screen.getByRole('alert')).toHaveTextContent(/not valid/i);
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute('href', ROUTES.FORGOT_PASSWORD);
  });

  it('refuses a confirmation that does not match, without calling the API', async () => {
    renderWithProviders(<ResetPasswordForm />);

    await submit(NEW_PASSWORD, 'Different123');

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('applies the same strength rules the backend enforces', async () => {
    renderWithProviders(<ResetPasswordForm />);

    await submit('short');

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('shows the backend reason when the token is spent or expired', async () => {
    resetPassword.mockRejectedValue(
      makeApiError({
        status: HTTP_BAD_REQUEST,
        code: ERROR_CODES.INVALID_RESET_TOKEN,
        message: 'This reset link has expired',
      }),
    );
    renderWithProviders(<ResetPasswordForm />);

    await submit();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('This reset link has expired'));
    expect(replace).not.toHaveBeenCalled();
  });
});
