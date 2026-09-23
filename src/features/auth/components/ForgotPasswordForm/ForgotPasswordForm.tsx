'use client';

import { Button, Input, TextLink } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { useForgotPasswordForm } from './useForgotPasswordForm';

/**
 * The confirmation is deliberately the same whether or not the address has an account: the
 * backend answers 204 either way, and saying more here would hand out a list of who is registered.
 */
export const ForgotPasswordForm = () => {
  const { form, onSubmit, isSubmitting, submitError, isSent } = useForgotPasswordForm();
  const { errors } = form.formState;

  if (isSent) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="status" className="text-sm text-muted">
          If that address belongs to an account, a reset link is on its way. The link expires, so use it soon.
        </p>
        <TextLink href={ROUTES.LOGIN}>Back to sign in</TextLink>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...form.register('email')}
      />
      {submitError && (
        <p role="alert" className="text-sm text-danger">
          {submitError}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>
      <TextLink href={ROUTES.LOGIN}>Back to sign in</TextLink>
    </form>
  );
};
