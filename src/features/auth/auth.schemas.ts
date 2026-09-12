import { z } from 'zod';
import { emailSchema, requiredString } from '@/lib/schemas';

/** Sign-in only checks presence of the password: strength rules apply when a password is set, not used. */
export const signInSchema = z.object({
  email: emailSchema,
  password: requiredString('Password'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
