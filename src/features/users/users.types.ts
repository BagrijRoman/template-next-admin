export const USER_ROLES = { USER: 'user', ADMIN: 'admin' } as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Mirror of the backend's `UserResponseDto` — the canonical user shape for the whole app; auth
 * carries it in its session, it is not a second definition. Keep the two in sync.
 */
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

/** The envelope every paginated list endpoint returns (`UserListResponseDto`). */
export type UserPage = {
  data: User[];
  total: number;
  limit: number;
  offset: number;
};

export type UsersListParams = { limit: number; offset: number };
