'use client';

import { Button, Input } from '@/components/ui';
import { useLoginForm } from './useLoginForm';

export const LoginForm = () => {
  const { form, onSubmit, isSubmitting, submitError } = useLoginForm();
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {submitError && (
        <p role="alert" className="text-sm text-danger">
          {submitError}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
};
