'use client';

import { Button, Input, TextLink } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { useResetPasswordForm } from './useResetPasswordForm';

export const ResetPasswordForm = () => {
  const { form, onSubmit, hasToken, isSubmitting, submitError } = useResetPasswordForm();
  const { errors } = form.formState;

  if (!hasToken) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="text-sm text-danger">
          This reset link is not valid. It may have been copied incompletely, or it has already been used.
        </p>
        <TextLink href={ROUTES.FORGOT_PASSWORD}>Request a new link</TextLink>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...form.register('newPassword')}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
      />
      {submitError && (
        <p role="alert" className="text-sm text-danger">
          {submitError}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Set new password'}
      </Button>
      <TextLink href={ROUTES.LOGIN}>Back to sign in</TextLink>
    </form>
  );
};
