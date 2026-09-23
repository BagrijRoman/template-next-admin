import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { AUTH_STATUS, TOKEN_PARAM } from '../../auth.constants';
import { useVerifyEmailMutation } from '../../auth.mutations';
import { useAuthStore } from '../../auth.store';

export const useVerifyEmailScreen = () => {
  /** Read during render, so it comes from the URL hook rather than `window` (the page is prerendered). */
  const token = useSearchParams().get(TOKEN_PARAM) ?? '';
  const status = useAuthStore((state) => state.status);
  const loadSession = useAuthStore((state) => state.loadSession);
  const verifyEmailMutation = useVerifyEmailMutation();
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const verify = async () => {
    setVerifyError(null);
    try {
      await verifyEmailMutation.mutateAsync(token);
      setIsVerified(true);
      if (status === AUTH_STATUS.AUTHENTICATED) {
        // The session in memory still says unverified; re-read it so the banner goes away.
        await loadSession();
      }
    } catch (error) {
      setVerifyError(getErrorMessage(error));
    }
  };

  return {
    hasToken: token.length > 0,
    isVerifying: verifyEmailMutation.isPending,
    isVerified,
    verifyError,
    verify,
  };
};
