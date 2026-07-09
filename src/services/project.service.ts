import { fetchClient } from './api';

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  active: boolean;
  assignedMemberIds?: number[];
}

export interface ProjectRequest {
  name: string;
  description: string;
  active?: boolean;
  assignedMemberIds?: number[];
}

export const projectService = {
  listActiveProjects: async (): Promise<ProjectResponse[]> => {
    return fetchClient('/projects/activeList', { method: 'GET' });
  },

  listAllProjects: async (): Promise<ProjectResponse[]> => {
    return fetchClient('/projects/getAll', { method: 'GET' });
  },

  findProject: async (id: number): Promise<ProjectResponse> => {
    return fetchClient(`/projects/find/${id}`, { method: 'GET' });
  },

  createProject: async (data: ProjectRequest): Promise<ProjectResponse> => {
    return fetchClient('/projects/create-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProject: async (id: number, data: ProjectRequest): Promise<ProjectResponse> => {
    return fetchClient(`/projects/update-project/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProject: async (id: number): Promise<void> => {
    return fetchClient(`/projects/delete-project/${id}`, { method: 'DELETE' });
  },
};
