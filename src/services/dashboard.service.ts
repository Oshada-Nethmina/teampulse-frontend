import { fetchClient } from './api';

export interface DashboardSummaryResponse {
  totalReportsSubmitted: number;
  complianceRatePercent: number;
  openBlockersCount: number;
  // Based on your chart requirements, these might also come from here or separate endpoints
  tasksCompletedTrend?: any[];
  submissionStatusByMember?: any[];
  workloadDistribution?: any[];
  recentActivity?: any[];
}

export const dashboardService = {
  getSummary: async (weekStartDate?: string): Promise<DashboardSummaryResponse> => {
    let url = '/dashboard/summary';
    if (weekStartDate) {
      url += `?weekStartDate=${weekStartDate}`;
    }
    return fetchClient(url, { method: 'GET' });
  },
};
