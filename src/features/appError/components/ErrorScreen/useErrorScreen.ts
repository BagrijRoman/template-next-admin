import { useEffect } from 'react';
import { getErrorMessage } from '@/lib/errors';

type UseErrorScreenParams = { error: Error & { digest?: string } };

export const useErrorScreen = ({ error }: UseErrorScreenParams) => {
  // No reporting service is wired up yet: the console is the only channel, and the digest below
  // is what ties what the visitor sees to the server-side log entry.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return { message: getErrorMessage(error), digest: error.digest };
};
