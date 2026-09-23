import { z } from 'zod';
import { emailSchema, passwordSchema, requiredString } from '@/lib/schemas';

/** Sign-in only checks presence of the password: strength rules apply when a password is set, not used. */
export const signInSchema = z.object({
  email: emailSchema,
  password: requiredString('Password'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/** Setting a password applies the full strength rules, and the confirmation must match it. */
export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: requiredString('Password confirmation'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: requiredString('Current password'),
    newPassword: passwordSchema,
    confirmPassword: requiredString('Password confirmation'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'The new password must be different from the current one',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
