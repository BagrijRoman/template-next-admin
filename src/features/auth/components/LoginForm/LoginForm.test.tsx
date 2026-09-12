import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/apiClient';
import { HTTP_STATUS, ROUTES } from '@/lib/constants';
import { renderWithProviders } from '@/test/renderWithProviders';
import { useAuthStore } from '../../auth.store';
import { LoginForm } from './LoginForm';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

const credentials = { email: 'admin@example.com', password: 'secret' };

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
    renderWithProviders(<LoginForm />);

    await fillAndSubmit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith(ROUTES.DASHBOARD));
    expect(signIn).toHaveBeenCalledWith(credentials);
  });

  it('returns to a safe next path after signing in', async () => {
    window.history.replaceState(null, '', '/login?next=%2Fusers%3Fpage%3D3');
    signIn.mockResolvedValue(undefined);
    renderWithProviders(<LoginForm />);

    await fillAndSubmit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/users?page=3'));
  });

  it('disables the button while the request is in flight', async () => {
    let finish: () => void = () => undefined;
    signIn.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    renderWithProviders(<LoginForm />);

    await fillAndSubmit();

    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled();
    finish();
    await waitFor(() => expect(replace).toHaveBeenCalled());
  });

  it('validates the fields client-side and never calls the API with bad input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('normalises the email before submitting', async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue(undefined);
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), '  Admin@Example.COM ');
    await user.type(screen.getByLabelText('Password'), credentials.password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith({ email: 'admin@example.com', password: credentials.password }),
    );
  });

  it('shows the backend message for an API error and re-enables the form', async () => {
    signIn.mockRejectedValue(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials'));
    renderWithProviders(<LoginForm />);

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows a generic message for a non-API failure', async () => {
    signIn.mockRejectedValue(new TypeError('Failed to fetch'));
    renderWithProviders(<LoginForm />);

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });
});
