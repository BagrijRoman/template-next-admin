import { apiClient } from '@/lib/apiClient';
import { AUTH_ENDPOINTS } from './auth.constants';
import type { AuthResponse, SignInPayload, User } from './auth.types';

export const authApi = {
  signIn: (payload: SignInPayload) => apiClient.post<AuthResponse>(AUTH_ENDPOINTS.SIGN_IN, payload, { skipAuth: true }),
  logout: (refreshToken: string) => apiClient.post<void>(AUTH_ENDPOINTS.LOGOUT, { refreshToken }, { skipAuth: true }),
  getMe: () => apiClient.get<User>(AUTH_ENDPOINTS.ME),
};
