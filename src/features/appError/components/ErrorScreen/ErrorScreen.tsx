'use client';

import { AmbientBackdrop, Button, ButtonLink } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { useErrorScreen } from './useErrorScreen';

export type ErrorScreenProps = {
  error: Error & { digest?: string };
  /** Next's `retry`: re-fetches and re-renders the segment that failed. */
  onRetry: () => void;
};

/** The fallback every error boundary renders: what happened, a way to retry, a way out. */
export const ErrorScreen = ({ error, onRetry }: ErrorScreenProps) => {
  const { message, digest } = useErrorScreen({ error });

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <AmbientBackdrop tone="danger" />

      <div className="relative flex flex-col items-center gap-8">
        <span aria-hidden className="relative flex size-28 items-center justify-center sm:size-32">
          <span className="absolute inset-0 animate-spin-slow rounded-full border-8 border-emphasis border-t-danger border-b-danger" />
          <span className="animate-bob text-6xl font-bold text-danger">!</span>
        </span>

        <div className="flex animate-rise flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">This page hit an error</h1>
          <p className="max-w-form text-sm text-muted">{message}</p>
          {digest && <p className="font-mono text-xs text-subtle">Reference {digest}</p>}
        </div>

        <div className="flex animate-rise-delayed flex-wrap items-center justify-center gap-3">
          <Button onClick={onRetry}>Try again</Button>
          <ButtonLink href={ROUTES.HOME} variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
};
