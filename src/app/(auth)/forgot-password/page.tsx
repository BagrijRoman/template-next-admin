import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Forgot password',
};

const ForgotPasswordPage = () => (
  <>
    <h1 className="mb-2 text-xl font-semibold">Forgot your password?</h1>
    <p className="mb-6 text-sm text-muted">
      Enter the address you signed up with and we will send you a link to set a new password.
    </p>
    <ForgotPasswordForm />
  </>
);

export default ForgotPasswordPage;
