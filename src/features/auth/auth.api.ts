import { apiClient } from '@/lib/apiClient';
import { AUTH_ENDPOINTS } from './auth.constants';
import type { AuthResponse, ChangePasswordPayload, ResetPasswordPayload, SignInPayload, User } from './auth.types';

export const authApi = {
  signIn: (payload: SignInPayload) => apiClient.post<AuthResponse>(AUTH_ENDPOINTS.SIGN_IN, payload, { skipAuth: true }),
  logout: (refreshToken: string) => apiClient.post<void>(AUTH_ENDPOINTS.LOGOUT, { refreshToken }, { skipAuth: true }),
  getMe: () => apiClient.get<User>(AUTH_ENDPOINTS.ME),
  // Both answer 204 and are public; the backend never says whether the address has an account.
  forgotPassword: (email: string) => apiClient.post<void>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email }),
  resetPassword: (payload: ResetPasswordPayload) => apiClient.post<void>(AUTH_ENDPOINTS.RESET_PASSWORD, payload),
  // Answers with a fresh session: changing the password revokes every other one, this one included.
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<AuthResponse>(AUTH_ENDPOINTS.CHANGE_PASSWORD, payload),
};
