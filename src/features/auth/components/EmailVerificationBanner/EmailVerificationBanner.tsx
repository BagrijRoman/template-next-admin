'use client';

import { Button } from '@/components/ui';
import { useEmailVerificationBanner } from './useEmailVerificationBanner';

/** Sits above every page of the guarded shell until the signed-in address is verified. */
export const EmailVerificationBanner = () => {
  const { isVisible, isSending, isSent, sendError, send } = useEmailVerificationBanner();

  if (!isVisible) {
    return null;
  }

  return (
    <div role="status" className="flex flex-wrap items-center gap-3 border-b border-default bg-warning-soft px-6 py-3">
      <p className="text-sm text-foreground">
        {isSent
          ? 'Verification link sent. Check your inbox, and your spam folder if it is not there.'
          : 'Your email address is not verified yet.'}
      </p>
      {sendError && (
        <p role="alert" className="text-sm text-danger">
          {sendError}
        </p>
      )}
      {!isSent && (
        <Button variant="secondary" size="sm" onClick={send} isLoading={isSending}>
          Send verification link
        </Button>
      )}
    </div>
  );
};
