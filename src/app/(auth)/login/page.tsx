import type { Metadata } from 'next';
import { TextLink } from '@/components/ui';
import { LoginForm } from '@/features/auth';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sign in',
};

const LoginPage = () => (
  <>
    <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
    <LoginForm />
    <TextLink href={ROUTES.FORGOT_PASSWORD} className="mt-4 inline-block">
      Forgot your password?
    </TextLink>
  </>
);

export default LoginPage;
