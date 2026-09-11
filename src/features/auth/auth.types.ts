export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = TokenPair & { user: User };

export type SignInPayload = {
  email: string;
  password: string;
};

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
