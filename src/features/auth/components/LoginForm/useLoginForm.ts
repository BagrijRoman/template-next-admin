import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '@/lib/errors';
import { useSignInMutation } from '../../auth.mutations';
import { type SignInFormValues, signInSchema } from '../../auth.schemas';
import { getNextParam, getSafeNextPath } from '../../auth.utils';

const DEFAULT_VALUES: SignInFormValues = { email: '', password: '' };

export const useLoginForm = () => {
  const router = useRouter();
  const form = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema), defaultValues: DEFAULT_VALUES });
  const signInMutation = useSignInMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signInMutation.mutateAsync(values);
      router.replace(getSafeNextPath(getNextParam()));
    } catch {
      // Surfaced through signInMutation.error; swallowing keeps handleSubmit from rethrowing.
    }
  });

  return {
    form,
    onSubmit,
    // Stay disabled through the redirect: the mutation settles before the new page takes over.
    isSubmitting: signInMutation.isPending || signInMutation.isSuccess,
    submitError: signInMutation.error ? getErrorMessage(signInMutation.error) : null,
  };
};
