import { apiClient } from '@/lib/apiClient';
import { USERS_ENDPOINT } from './users.constants';
import type { UserPage, UsersListParams } from './users.types';

export const usersApi = {
  list: (params: UsersListParams) => apiClient.get<UserPage>(USERS_ENDPOINT, { params }),
};
