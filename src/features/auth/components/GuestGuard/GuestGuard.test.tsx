import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTES } from '@/lib/constants';
import { AUTH_STATUS } from '../../auth.constants';
import { useAuthStore } from '../../auth.store';
import { GuestGuard } from './GuestGuard';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

const CHILD_TEXT = 'Login form';

const renderGuard = () =>
  render(
    <GuestGuard>
      <p>{CHILD_TEXT}</p>
    </GuestGuard>,
  );

describe('GuestGuard', () => {
  const loadSession = vi.fn(async () => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/login');
    useAuthStore.setState({ user: null, status: AUTH_STATUS.IDLE, loadSession });
  });

  it('starts loading the session and lets guests through immediately', () => {
    renderGuard();

    expect(loadSession).toHaveBeenCalledTimes(1);
    expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
  });

  it('shows the loader while the session is being validated', () => {
    useAuthStore.setState({ status: AUTH_STATUS.LOADING });
    renderGuard();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(CHILD_TEXT)).not.toBeInTheDocument();
  });

  it('renders children for a signed-out visitor', () => {
    useAuthStore.setState({ status: AUTH_STATUS.UNAUTHENTICATED });
    renderGuard();

    expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('sends a signed-in user to the dashboard', () => {
    useAuthStore.setState({ status: AUTH_STATUS.AUTHENTICATED });
    renderGuard();

    expect(replace).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('honours a safe next param and rejects an external one', () => {
    useAuthStore.setState({ status: AUTH_STATUS.AUTHENTICATED });

    window.history.replaceState(null, '', '/login?next=%2Fusers%3Fpage%3D3');
    renderGuard();
    expect(replace).toHaveBeenLastCalledWith('/users?page=3');

    window.history.replaceState(null, '', '/login?next=https%3A%2F%2Fevil.example');
    renderGuard();
    expect(replace).toHaveBeenLastCalledWith(ROUTES.DASHBOARD);
  });
});
