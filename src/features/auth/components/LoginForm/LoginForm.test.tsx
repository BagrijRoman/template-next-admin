import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/apiClient';
import { HTTP_STATUS, ROUTES } from '@/lib/constants';
import { useAuthStore } from '../../auth.store';
import { LoginForm } from './LoginForm';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

const credentials = { email: 'a@b.c', password: 'secret' };

const fillAndSubmit = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), credentials.email);
  await user.type(screen.getByLabelText('Password'), credentials.password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
};

describe('LoginForm', () => {
  const signIn = vi.fn<(payload: typeof credentials) => Promise<void>>();

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', ROUTES.LOGIN);
    useAuthStore.setState({ signIn });
  });

  it('signs in with the entered credentials and redirects to the dashboard', async () => {
    signIn.mockResolvedValue(undefined);
    render(<LoginForm />);

    await fillAndSubmit();

    expect(signIn).toHaveBeenCalledWith(credentials);
    expect(replace).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('returns to a safe next path after signing in', async () => {
    window.history.replaceState(null, '', '/login?next=%2Fusers%3Fpage%3D3');
    signIn.mockResolvedValue(undefined);
    render(<LoginForm />);

    await fillAndSubmit();

    expect(replace).toHaveBeenCalledWith('/users?page=3');
  });

  it('disables the button while the request is in flight', async () => {
    let finish: () => void = () => undefined;
    signIn.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    render(<LoginForm />);

    await fillAndSubmit();

    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
    finish();
    await waitFor(() => expect(replace).toHaveBeenCalled());
  });

  it('shows the backend message for an API error and re-enables the form', async () => {
    signIn.mockRejectedValue(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials'));
    render(<LoginForm />);

    await fillAndSubmit();

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows a generic message for a non-API failure', async () => {
    signIn.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<LoginForm />);

    await fillAndSubmit();

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });
});
