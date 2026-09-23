import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { applyFieldErrors } from '@/lib/forms';
import { useForgotPasswordMutation } from '../../auth.mutations';
import { type ForgotPasswordFormValues, forgotPasswordSchema } from '../../auth.schemas';

const DEFAULT_VALUES: ForgotPasswordFormValues = { email: '' };
const FIELDS = ['email'] as const;

export const useForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setSubmitError(null);
    try {
      await forgotPasswordMutation.mutateAsync(email);
      setIsSent(true);
    } catch (error) {
      setSubmitError(applyFieldErrors(form.setError, error, FIELDS));
    }
  });

  return { form, onSubmit, isSubmitting: forgotPasswordMutation.isPending, submitError, isSent };
};
