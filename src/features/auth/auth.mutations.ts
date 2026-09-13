import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from './auth.store';
import type { SignInPayload } from './auth.types';

/**
 * Sign-in as a mutation: the store owns the session, TanStack Query owns the request lifecycle.
 * Silent: the login form shows failures inline (field errors, wrong credentials, lockout wait).
 */
export const useSignInMutation = () => {
  const signIn = useAuthStore((state) => state.signIn);
  // Explicit arrow: mutationFn also receives a mutation context, which store actions must not see.
  return useMutation({ mutationFn: (payload: SignInPayload) => signIn(payload), meta: { silent: true } });
};

export const useSignOutMutation = () => {
  const signOut = useAuthStore((state) => state.signOut);
  return useMutation({ mutationFn: () => signOut() });
};
