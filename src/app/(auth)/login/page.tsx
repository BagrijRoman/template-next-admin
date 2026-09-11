import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Sign in',
};

const LoginPage = () => (
  <>
    <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
    <LoginForm />
  </>
);

export default LoginPage;
