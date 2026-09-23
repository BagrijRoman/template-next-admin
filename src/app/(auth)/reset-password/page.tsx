import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui';
import { ResetPasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Set a new password',
};

const ResetPasswordPage = () => (
  <>
    <h1 className="mb-2 text-xl font-semibold">Set a new password</h1>
    <p className="mb-6 text-sm text-muted">Choose a new password. Every signed-in session is signed out afterwards.</p>
    <Suspense fallback={<Spinner className="mx-auto" />}>
      <ResetPasswordForm />
    </Suspense>
  </>
);

export default ResetPasswordPage;
