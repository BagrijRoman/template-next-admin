import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { ApiError } from '@/lib/apiClient';
import { useAuthStore } from '../../auth.store';
import { getNextParam, getSafeNextPath } from '../../auth.utils';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

export const useLoginForm = () => {
  const signIn = useAuthStore((state) => state.signIn);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      router.replace(getSafeNextPath(getNextParam()));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : GENERIC_ERROR);
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, password, setPassword, error, isSubmitting, handleSubmit };
};
