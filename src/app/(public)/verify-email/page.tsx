import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui';
import { VerifyEmailScreen } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Verify email',
};

const VerifyEmailPage = () => (
  <>
    <h1 className="mb-2 text-xl font-semibold">Verify your email</h1>
    <Suspense fallback={<Spinner className="mx-auto" />}>
      <VerifyEmailScreen />
    </Suspense>
  </>
);

export default VerifyEmailPage;
