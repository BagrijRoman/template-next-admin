import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTES } from '@/lib/constants';
import { NotFoundScreen } from './NotFoundScreen';

const MISSING_PATH = '/reports/2019';
const back = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push }),
  usePathname: () => MISSING_PATH,
}));

const setHistoryLength = (length: number) =>
  Object.defineProperty(window.history, 'length', { value: length, configurable: true });

describe('NotFoundScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setHistoryLength(2);
  });

  it('names the code, the missing path and the way home', () => {
    render(<NotFoundScreen />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'This page went missing' })).toBeInTheDocument();
    expect(screen.getByText(MISSING_PATH)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', ROUTES.HOME);
  });

  it('goes back when the visitor has somewhere to return to', async () => {
    render(<NotFoundScreen />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Go back' }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('sends a visitor who landed here directly home instead of into an empty history', async () => {
    setHistoryLength(1);
    render(<NotFoundScreen />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Go back' }));

    expect(push).toHaveBeenCalledWith(ROUTES.HOME);
    expect(back).not.toHaveBeenCalled();
  });
});
