"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import { projectService, ProjectResponse, ProjectRequest } from '../../services/project.service';
import { Plus, Edit2, Trash2, X, AlertCircle, Briefcase, CheckCircle } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  
  const [formData, setFormData] = useState<ProjectRequest>({
    name: '',
    description: '',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.listAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (project?: ProjectResponse) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        isActive: project.isActive,
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', isActive: true });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this project?')) {
      try {
        await projectService.deleteProject(id);
        fetchProjects();
      } catch (err: any) {
        alert(err.message || 'Failed to delete project');
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
      <AppLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects & Categories</h1>
              <p className="text-sm text-gray-500 mt-1">Manage project tags available for team reports.</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-[#f8fcf9]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.isActive ? 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
                        }`}>
                          {project.isActive && <CheckCircle className="w-3 h-3" />}
                          {project.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(project)}
                          className="text-emerald-600 hover:text-emerald-900 mr-4 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No projects found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
              <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-gray-100">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold leading-6 text-gray-900">
                      {editingProject ? 'Edit Project' : 'Create New Project'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}

                  <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-premium"
                        placeholder="e.g. Client Alpha Redesign"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input-premium resize-none"
                        placeholder="Brief description of the project"
                      />
                    </div>
                    {editingProject && (
                      <div className="flex items-center mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <input
                          id="is-active"
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is-active" className="ml-2 block text-sm text-emerald-900 font-medium">
                          Active (Visible to team members)
                        </label>
                      </div>
                    )}
                  </form>
                </div>
                <div className="bg-[#f8fcf9] px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-2xl border-t border-emerald-50">
                  <button
                    type="submit"
                    form="project-form"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-medium text-white shadow-sm shadow-emerald-200 hover:bg-emerald-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Project'}
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
