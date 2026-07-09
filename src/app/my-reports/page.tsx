"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import { reportService, ReportResponse, ReportRequest } from '../../services/report.service';
import { projectService, ProjectResponse } from '../../services/project.service';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function MyReportsPage() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ReportRequest>({
    weekStartDate: '',
    projectId: 0,
    tasksCompleted: '',
    tasksPlanned: '',
    blockers: '',
    hoursWorked: undefined,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reportsData, projectsData] = await Promise.all([
        reportService.getMyReports(),
        projectService.listActiveProjects(),
      ]);
      setReports(reportsData);
      setProjects(projectsData);
      
      // Set default week start date to last Monday
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      setFormData(prev => ({ ...prev, weekStartDate: monday.toISOString().split('T')[0] }));
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'projectId' || name === 'hoursWorked' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await reportService.createReport(formData);
      setIsModalOpen(false);
      fetchData(); // Refresh list
      // Reset form
      setFormData({
        weekStartDate: formData.weekStartDate,
        projectId: 0,
        tasksCompleted: '',
        tasksPlanned: '',
        blockers: '',
        hoursWorked: undefined,
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
      <AppLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Weekly Reports</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and track your weekly progress.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first weekly report.</p>
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-200 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  New Report
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <li key={report.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-700">Week of {report.weekStartDate}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-700/10">
                              {report.project?.name || 'Unknown Project'}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {report.hoursWorked || 0} hours
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(report.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#f8fcf9] p-3 rounded-lg border border-emerald-50">
                        <p className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Tasks Completed
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.tasksCompleted}</p>
                      </div>
                      <div className="bg-[#fdfbf7] p-3 rounded-lg border border-amber-50">
                        <p className="text-xs font-medium text-amber-600 mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-500" /> Blockers
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.blockers || 'None'}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
              <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle border border-gray-100">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold leading-6 text-gray-900">Create Weekly Report</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}

                  <form id="report-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Week Start Date *</label>
                        <input
                          type="date"
                          name="weekStartDate"
                          required
                          value={formData.weekStartDate}
                          onChange={handleInputChange}
                          className="input-premium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project / Category *</label>
                        <select
                          name="projectId"
                          required
                          value={formData.projectId || ''}
                          onChange={handleInputChange}
                          className="input-premium"
                        >
                          <option value="" disabled>Select a project</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Completed *</label>
                      <textarea
                        name="tasksCompleted"
                        required
                        rows={3}
                        value={formData.tasksCompleted}
                        onChange={handleInputChange}
                        className="input-premium resize-none"
                        placeholder="What did you accomplish this week?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Planned for Next Week *</label>
                      <textarea
                        name="tasksPlanned"
                        required
                        rows={3}
                        value={formData.tasksPlanned}
                        onChange={handleInputChange}
                        className="input-premium resize-none"
                        placeholder="What are your goals for next week?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blockers / Challenges</label>
                      <textarea
                        name="blockers"
                        rows={2}
                        value={formData.blockers}
                        onChange={handleInputChange}
                        className="input-premium resize-none"
                        placeholder="Any issues slowing you down?"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked (Optional)</label>
                        <input
                          type="number"
                          name="hoursWorked"
                          value={formData.hoursWorked || ''}
                          onChange={handleInputChange}
                          className="input-premium"
                          placeholder="e.g. 40"
                          min="0"
                          max="168"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                        <input
                          type="text"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="input-premium"
                          placeholder="Links or other notes"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="bg-[#f8fcf9] px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-2xl border-t border-emerald-50">
                  <button
                    type="submit"
                    form="report-form"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-medium text-white shadow-sm shadow-emerald-200 hover:bg-emerald-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-base font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

// Simple missing icon placeholder
function FileIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
