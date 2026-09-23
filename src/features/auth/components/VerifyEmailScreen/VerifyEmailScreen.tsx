'use client';

import { Button, TextLink } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { useVerifyEmailScreen } from './useVerifyEmailScreen';

/**
 * The token is spent on a click, never on load: mail scanners and link previewers fetch every URL
 * in a message, and a single-use token consumed by a scanner leaves the visitor with a dead link.
 */
export const VerifyEmailScreen = () => {
  const { hasToken, isVerifying, isVerified, verifyError, verify } = useVerifyEmailScreen();

  if (!hasToken) {
    return (
      <p role="alert" className="text-sm text-danger">
        This verification link is not valid. It may have been copied incompletely. Sign in and ask for a new one.
      </p>
    );
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="status" className="text-sm text-muted">
          Your email address is verified. Thank you.
        </p>
        <TextLink href={ROUTES.HOME}>Continue to the app</TextLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm text-muted">Confirm that this address belongs to you.</p>
      {verifyError && (
        <p role="alert" className="text-sm text-danger">
          {verifyError} Sign in and request a new link from the banner at the top of the page.
        </p>
      )}
      <Button onClick={verify} isLoading={isVerifying}>
        {isVerifying ? 'Verifying…' : 'Verify my email'}
      </Button>
    </div>
  );
};
