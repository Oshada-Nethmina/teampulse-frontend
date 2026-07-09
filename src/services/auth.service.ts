import { fetchClient } from './api';

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
}

export const authService = {
  login: async (data: any): Promise<AuthResponse> => {
    return fetchClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  register: async (data: any): Promise<AuthResponse> => {
    return fetchClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<void> => {
    return fetchClient('/auth/logout', {
      method: 'POST',
    });
  },
};
