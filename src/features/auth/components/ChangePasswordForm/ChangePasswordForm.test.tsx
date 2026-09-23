import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '@/components/ui';
import { ERROR_CODES } from '@/lib/apiError';
import { makeApiError } from '@/test/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { useAuthStore } from '../../auth.store';
import { ChangePasswordForm } from './ChangePasswordForm';

const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY_REQUESTS = 429;
const CURRENT_PASSWORD = 'OldSecret123';
const NEW_PASSWORD = 'NewSecret123';

const fill = async (current = CURRENT_PASSWORD, next = NEW_PASSWORD, confirmation = next) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Current password'), current);
  await user.type(screen.getByLabelText('New password', { exact: true }), next);
  await user.type(screen.getByLabelText('Confirm new password'), confirmation);
  await user.click(screen.getByRole('button', { name: 'Change password' }));
};

describe('ChangePasswordForm', () => {
  const changePassword = vi.fn<(payload: { currentPassword: string; newPassword: string }) => Promise<void>>();

  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ toasts: [] });
    useAuthStore.setState({ changePassword });
    changePassword.mockResolvedValue(undefined);
  });

  it('sends both passwords, clears the form and says the other devices are out', async () => {
    renderWithProviders(<ChangePasswordForm />);

    await fill();

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith({ currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD }),
    );
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: 'success', title: 'Password changed' });
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveValue(''));
  });

  it('puts a wrong current password under its own field, not in the form alert', async () => {
    changePassword.mockRejectedValue(
      makeApiError({
        status: HTTP_BAD_REQUEST,
        code: ERROR_CODES.WRONG_CURRENT_PASSWORD,
        message: 'Current password is incorrect',
      }),
    );
    renderWithProviders(<ChangePasswordForm />);

    await fill();

    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument();
    expect(screen.getByLabelText('Current password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the lockout wait when the attempts run out', async () => {
    changePassword.mockRejectedValue(
      makeApiError({
        status: HTTP_TOO_MANY_REQUESTS,
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Too many attempts',
        meta: { retryAfterSeconds: 120 },
      }),
    );
    renderWithProviders(<ChangePasswordForm />);

    await fill();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Try again in 2 minutes.'));
  });

  it('refuses a confirmation that does not match and a new password equal to the old one', async () => {
    const { unmount } = renderWithProviders(<ChangePasswordForm />);
    await fill(CURRENT_PASSWORD, NEW_PASSWORD, 'Different123');
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    unmount();

    renderWithProviders(<ChangePasswordForm />);
    await fill(CURRENT_PASSWORD, CURRENT_PASSWORD);
    expect(await screen.findByText('The new password must be different from the current one')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });
});
