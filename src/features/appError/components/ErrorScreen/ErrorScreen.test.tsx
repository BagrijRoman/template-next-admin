import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@/lib/apiError';
import { ROUTES } from '@/lib/constants';
import { GENERIC_ERROR_MESSAGE } from '@/lib/errors';
import { makeApiError } from '@/test/apiError';
import { ErrorScreen } from './ErrorScreen';

const HTTP_SERVICE_UNAVAILABLE = 503;
const DIGEST = '3f2a91c';

describe('ErrorScreen', () => {
  const onRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('explains the failure generically and offers both ways out', () => {
    render(<ErrorScreen error={new Error('connect ECONNREFUSED 10.0.0.1:5432')} onRetry={onRetry} />);

    expect(screen.getByRole('heading', { level: 1, name: 'This page hit an error' })).toBeInTheDocument();
    expect(screen.getByText(GENERIC_ERROR_MESSAGE)).toBeInTheDocument();
    // Internals of a crash never reach the page: only getErrorMessage decides what a visitor reads.
    expect(screen.queryByText(/ECONNREFUSED/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', ROUTES.HOME);
  });

  it('shows the wording of an API failure it was handed', () => {
    const error = makeApiError({ status: HTTP_SERVICE_UNAVAILABLE, code: ERROR_CODES.SERVICE_UNAVAILABLE });

    render(<ErrorScreen error={error} onRetry={onRetry} />);

    expect(screen.getByText('The service is temporarily unavailable. Please try again shortly.')).toBeInTheDocument();
  });

  it('prints the digest so support can find the matching server log', () => {
    const error = Object.assign(new Error('boom'), { digest: DIGEST });

    const { rerender } = render(<ErrorScreen error={error} onRetry={onRetry} />);
    expect(screen.getByText(`Reference ${DIGEST}`)).toBeInTheDocument();

    rerender(<ErrorScreen error={new Error('boom')} onRetry={onRetry} />);
    expect(screen.queryByText(/Reference/)).not.toBeInTheDocument();
  });

  it('retries the failed segment on request and logs the error once', async () => {
    const error = new Error('boom');
    render(<ErrorScreen error={error} onRetry={onRetry} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
