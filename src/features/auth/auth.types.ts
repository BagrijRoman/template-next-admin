import type { User } from '@/features/users/users.types';
import type { AUTH_STATUS } from './auth.constants';

// The user shape belongs to the users domain (it mirrors the backend's UserResponseDto there);
// auth only carries it in the session, so it re-exports rather than declaring a second version.
export type { User } from '@/features/users/users.types';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = TokenPair & { user: User };

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];
