import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@/lib/apiError';
import { ROUTES } from '@/lib/constants';
import { makeApiError } from '@/test/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { authApi } from '../../auth.api';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const HTTP_TOO_MANY_REQUESTS = 429;
const EMAIL = 'ada@example.com';

vi.mock('../../auth.api', () => ({ authApi: { forgotPassword: vi.fn() } }));

const forgotPassword = vi.mocked(authApi.forgotPassword);

const submit = async (email = EMAIL) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), email);
  await user.click(screen.getByRole('button', { name: 'Send reset link' }));
};

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    forgotPassword.mockResolvedValue(undefined);
  });

  it('asks the backend for a link and confirms without revealing whether the account exists', async () => {
    renderWithProviders(<ForgotPasswordForm />);

    await submit();

    expect(await screen.findByRole('status')).toHaveTextContent(/if that address belongs to an account/i);
    expect(forgotPassword).toHaveBeenCalledWith(EMAIL);
    // The address itself is never echoed back, so the page cannot be used to probe for accounts.
    expect(screen.queryByText(new RegExp(EMAIL))).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', ROUTES.LOGIN);
  });

  it('rejects a malformed address before sending anything', async () => {
    renderWithProviders(<ForgotPasswordForm />);

    await submit('ada@');

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it('keeps the form and shows the wait when the address is rate limited', async () => {
    forgotPassword.mockRejectedValue(
      makeApiError({
        status: HTTP_TOO_MANY_REQUESTS,
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Too many requests',
        meta: { retryAfterSeconds: 60 },
      }),
    );
    renderWithProviders(<ForgotPasswordForm />);

    await submit();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Try again in 1 minute.'));
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument();
  });
});
