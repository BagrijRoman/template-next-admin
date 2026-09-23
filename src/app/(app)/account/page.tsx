import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Account',
};

const AccountPage = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-semibold text-foreground">Account</h1>
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Change password</h2>
        <p className="text-sm text-muted">
          Changing your password signs out every other device. This one stays signed in.
        </p>
      </div>
      <ChangePasswordForm />
    </section>
  </div>
);

export default AccountPage;
