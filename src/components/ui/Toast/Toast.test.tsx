import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast, useToastStore } from './toast.store';
import { Toaster } from './Toaster';

const AUTO_DISMISS_MS = 5000;

describe('Toaster', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toasts raised through the imperative API', () => {
    render(<Toaster />);

    act(() => {
      toast.success('Saved', 'Your changes are live.');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByText('Your changes are live.')).toBeInTheDocument();
  });

  it('dismisses a toast on demand', async () => {
    render(<Toaster />);
    act(() => {
      toast.error('Failed');
    });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('dismisses a toast automatically', () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast.info('Heads up');
    });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(AUTO_DISMISS_MS);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
