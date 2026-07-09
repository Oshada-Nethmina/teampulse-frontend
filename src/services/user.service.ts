import { fetchClient } from './api';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
}

export const userService = {
  getCurrentUser: async (): Promise<UserResponse> => {
    return fetchClient('/users/get-user', { method: 'GET' });
  },

  getAllUsers: async (): Promise<UserResponse[]> => {
    return fetchClient('/users/getAll', { method: 'GET' });
  },

  getTeamMembers: async (): Promise<UserResponse[]> => {
    return fetchClient('/users/team-members', { method: 'GET' });
  },
};
