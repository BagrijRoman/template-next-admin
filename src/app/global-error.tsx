'use client';

import { ErrorScreen } from '@/features/appError';
import './globals.css';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Takes over when the root layout itself failed, so it renders its own document and imports the
 * tokens by hand — nothing above it is left to do that. Fonts stay on the system stack on
 * purpose: this screen must not depend on anything that could be part of the failure.
 */
const GlobalError = ({ error, retry }: GlobalErrorProps) => (
  <html lang="en" className="h-full antialiased">
    <body className="flex min-h-full flex-col">
      <title>Something went wrong — Admin Web Template</title>
      <ErrorScreen error={error} onRetry={retry} />
    </body>
  </html>
);

export default GlobalError;
