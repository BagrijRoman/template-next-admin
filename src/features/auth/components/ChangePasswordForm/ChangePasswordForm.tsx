'use client';

import { Button, Input } from '@/components/ui';
import { useChangePasswordForm } from './useChangePasswordForm';

export const ChangePasswordForm = () => {
  const { form, onSubmit, isSubmitting, submitError } = useChangePasswordForm();
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} className="flex max-w-form flex-col gap-4" noValidate>
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...form.register('currentPassword')}
      />
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
        {isSubmitting ? 'Saving…' : 'Change password'}
      </Button>
    </form>
  );
};
