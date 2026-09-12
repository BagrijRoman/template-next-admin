import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { AuthGuard } from './AuthGuard';

const { replace, usePathname } = vi.hoisted(() => ({ replace: vi.fn(), usePathname: vi.fn(() => '/users') }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname,
}));

const CHILD_TEXT = 'Protected content';

const renderGuard = () =>
  render(
    <AuthGuard>
      <p>{CHILD_TEXT}</p>
    </AuthGuard>,
  );

describe('AuthGuard', () => {
  const loadSession = vi.fn(async () => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/users');
    useAuthStore.setState({ user: null, status: AUTH_STATUS.IDLE, loadSession });
  });

  it('starts loading the session and shows the loader while idle', () => {
    renderGuard();

    expect(loadSession).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(CHILD_TEXT)).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows the loader while the session is being validated', () => {
    useAuthStore.setState({ status: AUTH_STATUS.LOADING });
    renderGuard();

    expect(loadSession).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders children once authenticated', () => {
    useAuthStore.setState({ status: AUTH_STATUS.AUTHENTICATED });
    renderGuard();

    expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects a signed-out visitor to login with the full deep link, query string included', () => {
    window.history.replaceState(null, '', '/users?page=3');
    useAuthStore.setState({ status: AUTH_STATUS.UNAUTHENTICATED });
    renderGuard();

    expect(replace).toHaveBeenCalledWith('/login?next=%2Fusers%3Fpage%3D3');
    expect(screen.queryByText(CHILD_TEXT)).not.toBeInTheDocument();
  });
});
