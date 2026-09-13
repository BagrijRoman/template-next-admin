import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { applyFieldErrors } from '@/lib/forms';
import { useSignInMutation } from '../../auth.mutations';
import { type SignInFormValues, signInSchema } from '../../auth.schemas';
import { getNextParam, getSafeNextPath } from '../../auth.utils';

const DEFAULT_VALUES: SignInFormValues = { email: '', password: '' };
const FIELDS = ['email', 'password'] as const;

export const useLoginForm = () => {
  const router = useRouter();
  const form = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema), defaultValues: DEFAULT_VALUES });
  const signInMutation = useSignInMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await signInMutation.mutateAsync(values);
      router.replace(getSafeNextPath(getNextParam()));
    } catch (error) {
      // Field-bound details land under their inputs; anything else becomes the form-level alert.
      setSubmitError(applyFieldErrors(form.setError, error, FIELDS));
    }
  });

  return {
    form,
    onSubmit,
    // Stay disabled through the redirect: the mutation settles before the new page takes over.
    isSubmitting: signInMutation.isPending || signInMutation.isSuccess,
    submitError,
  };
};
