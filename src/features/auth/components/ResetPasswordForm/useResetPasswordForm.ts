import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { applyFieldErrors } from '@/lib/forms';
import { RESET_TOKEN_PARAM } from '../../auth.constants';
import { useResetPasswordMutation } from '../../auth.mutations';
import { type ResetPasswordFormValues, resetPasswordSchema } from '../../auth.schemas';

const DEFAULT_VALUES: ResetPasswordFormValues = { newPassword: '', confirmPassword: '' };
// The backend names the field `newPassword`, so its validation details land on the same input.
const FIELDS = ['newPassword', 'confirmPassword'] as const;

export const useResetPasswordForm = () => {
  const router = useRouter();
  /**
   * The token is read during render, so it must come from `useSearchParams`, not `window`: this
   * page is prerendered and touching `window` here crashes the server render. The Suspense
   * boundary around the form is what lets Next fill the URL in on the client.
   */
  const token = useSearchParams().get(RESET_TOKEN_PARAM) ?? '';
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const resetPasswordMutation = useResetPasswordMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ newPassword }) => {
    setSubmitError(null);
    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword });
      // The backend revokes every session on a reset, so signing in again is the only way on.
      toast.success('Password updated', 'Sign in with your new password.');
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      setSubmitError(applyFieldErrors(form.setError, error, FIELDS));
    }
  });

  return {
    form,
    onSubmit,
    hasToken: token.length > 0,
    // Stay disabled through the redirect: the mutation settles before the new page takes over.
    isSubmitting: resetPasswordMutation.isPending || resetPasswordMutation.isSuccess,
    submitError,
  };
};
