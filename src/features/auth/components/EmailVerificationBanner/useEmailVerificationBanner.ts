import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { useSendVerificationMutation } from '../../auth.mutations';
import { useAuthStore } from '../../auth.store';

export const useEmailVerificationBanner = () => {
  const user = useAuthStore((state) => state.user);
  const sendVerificationMutation = useSendVerificationMutation();
  const [isSent, setIsSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const send = async () => {
    setSendError(null);
    try {
      await sendVerificationMutation.mutateAsync();
      setIsSent(true);
    } catch (error) {
      // Rate limits and "already verified" both land here; the banner shows them in place.
      setSendError(getErrorMessage(error));
    }
  };

  return {
    // Nothing to nag about until the session is loaded and the address is actually unverified.
    isVisible: Boolean(user) && user?.emailVerified === false,
    isSending: sendVerificationMutation.isPending,
    isSent,
    sendError,
    send,
  };
};
