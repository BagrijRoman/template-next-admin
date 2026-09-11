import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Sign in',
};

const LoginPage = () => (
  <>
    <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
    {/* useSearchParams inside the form needs a Suspense boundary for static rendering. */}
    <Suspense>
      <LoginForm />
    </Suspense>
  </>
);

export default LoginPage;
