import { fetchClient } from './api';
import { ProjectResponse } from './project.service';

export interface ReportRequest {
  weekStartDate: string;
  weekEndDate: string;

  projectId: number;

  tasksCompleted: string;
  tasksPlannedNext: string;

  blockers: string;

  hoursWorked?: number;

  notesLinks?: string;

  submit?: boolean;
}

export interface ReportResponse {
  id: number;

  userId: number;
  userFullName: string;

  projectId: number | null;
  projectName: string | null;

  weekStartDate: string;
  weekEndDate: string;

  tasksCompleted: string;
  tasksPlannedNext: string;

  blockers: string;
  hoursWorked: number;

  notesLinks: string;

  status: string;

  submittedAt: string;
  updatedAt: string;
}

export const reportService = {
  createReport: async (data: ReportRequest): Promise<ReportResponse> => {
    return fetchClient('/reports/create-report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReport: async (id: number, data: ReportRequest): Promise<ReportResponse> => {
    return fetchClient(`/reports/update-report/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getMyReports: async (): Promise<ReportResponse[]> => {
    return fetchClient('/reports/findAll', { method: 'GET' });
  },

  getReport: async (id: number): Promise<ReportResponse> => {
    return fetchClient(`/reports/find-report/${id}`, { method: 'GET' });
  },

  searchReports: async (filters: { userId?: number; projectId?: number; from?: string; to?: string }): Promise<ReportResponse[]> => {
    const query = new URLSearchParams();
    if (filters.userId) query.append('userId', filters.userId.toString());
    if (filters.projectId) query.append('projectId', filters.projectId.toString());
    if (filters.from) query.append('from', filters.from);
    if (filters.to) query.append('to', filters.to);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchClient(`/reports/search${queryString}`, { method: 'GET' });
  },
};
