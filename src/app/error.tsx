'use client';

import { ErrorScreen } from '@/features/appError';

type AppErrorProps = {
  error: Error & { digest?: string };
  /** Next 16 names the recovery prop `retry` (it re-fetches the segment); `reset` only clears state. */
  retry: () => void;
};

const AppError = ({ error, retry }: AppErrorProps) => <ErrorScreen error={error} onRetry={retry} />;

export default AppError;
