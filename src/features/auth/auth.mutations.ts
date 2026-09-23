import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { useAuthStore } from './auth.store';
import type { ChangePasswordPayload, ResetPasswordPayload, SignInPayload } from './auth.types';

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

/** Silent like the rest of the auth forms: the page shows the outcome inline, not as a toast. */
export const useForgotPasswordMutation = () =>
  useMutation({ mutationFn: (email: string) => authApi.forgotPassword(email), meta: { silent: true } });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    meta: { silent: true },
  });

/** The store owns the session the backend returns in exchange for the new password. */
export const useChangePasswordMutation = () => {
  const changePassword = useAuthStore((state) => state.changePassword);
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    meta: { silent: true },
  });
};
