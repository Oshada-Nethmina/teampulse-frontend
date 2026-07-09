"use client";

import { useEffect, useState, useRef } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import { dashboardService, DashboardSummaryResponse } from '../../services/dashboard.service';
import { aiService } from '../../services/ai.service';
import { reportService, ReportResponse } from '../../services/report.service';
import { userService, UserResponse } from '../../services/user.service';
import { projectService, ProjectResponse } from '../../services/project.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Users, FileCheck, AlertTriangle, TrendingUp, Search, MessageSquare, X, Send, Bot, Filter, Calendar, Clock, CheckCircle2, ChevronDown } from 'lucide-react';

const COLORS = ['#059669', '#14b8a6', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and Table State
  const [filterUserId, setFilterUserId] = useState<number | ''>('');
  const [filterProjectId, setFilterProjectId] = useState<number | ''>('');
  const [filterWeek, setFilterWeek] = useState<string>('');
  const [filteredReports, setFilteredReports] = useState<ReportResponse[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);

  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchFilteredReports();
    }
  }, [filterUserId, filterProjectId, filterWeek, isLoading]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, usersData, projectsData] = await Promise.all([
        dashboardService.getSummary(),
        userService.getAllUsers(),
        projectService.listActiveProjects()
      ]);
      setSummary(summaryData);
      setTeamMembers(usersData.filter(u => u.role === 'TEAM_MEMBER'));
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredReports = async () => {
    try {
      setIsReportsLoading(true);
      const filters: any = {};
      if (filterUserId) filters.userId = filterUserId;
      if (filterProjectId) filters.projectId = filterProjectId;

      const data = await reportService.searchReports(filters);

      // Client-side date filter if backend doesn't support exact week matching
      let results = data;
      if (filterWeek) {
        results = results.filter(r => r.weekStartDate === filterWeek);
      }

      setFilteredReports(results);
    } catch (error) {
      console.error("Failed to fetch filtered reports:", error);
    } finally {
      setIsReportsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await aiService.chat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', text: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't process your request at this time." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Helper for determining submission status for a specific user in the current view
  const getStatusLabel = (report: ReportResponse) => {
    return "Submitted"; // By definition, if we fetched it, it's submitted.
  };

  // Dummy data fallbacks for charts if backend doesn't provide them
  // Calculate real submission data based on current filtered view
  const submittedCount = filteredReports.length;
  const pendingCount = Math.max(0, teamMembers.length - submittedCount);

  const submissionData = [
    { name: 'Submitted', value: submittedCount },
    { name: 'Pending', value: pendingCount },
  ];

  const trendData = summary
    ? Object.entries(summary.tasksCompletedTrend ?? {}).map(([name, value]) => ({
      name,
      completed: value,
    }))
    : [
      { name: "Mon", completed: 12 },
      { name: "Tue", completed: 19 },
      { name: "Wed", completed: 15 },
      { name: "Thu", completed: 22 },
      { name: "Fri", completed: 28 },
    ];

  const visibleMembers = teamMembers.filter(member => {

    // Filter by selected member
    if (filterUserId && member.id !== filterUserId) {
      return false;
    }

    // Filter by selected project
    if (filterProjectId) {

      const project = projects.find(p => p.id === filterProjectId);

      if (!project) return false;

      return project.assignedMemberIds?.includes(member.id);
    }

    return true;
  });

  const handleGenerateSummary = async () => {
    setIsChatOpen(true);
    const prompt = "Please generate a team summary highlighting completed work, recurring blockers, and workload imbalances based on the recent reports.";
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setIsChatLoading(true);
    try {
      const response = await aiService.chat(prompt);
      setMessages(prev => [...prev, { role: 'assistant', text: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't generate the summary at this time." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
      <AppLayout>
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Overview of team performance and reports.</p>
            </div>

            <button
              onClick={handleGenerateSummary}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200"
            >
              <Bot className="w-4 h-4" />
              Generate AI Summary
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-emerald-50 p-6 flex items-center hover:shadow-md transition-shadow">
                  <div className="rounded-lg bg-emerald-50 p-3 mr-4">
                    <FileCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reports Submitted</p>
                    <p className="text-2xl font-bold text-gray-900">{summary?.totalReportsSubmitted || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-teal-50 p-6 flex items-center hover:shadow-md transition-shadow">
                  <div className="rounded-lg bg-teal-50 p-3 mr-4">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary?.complianceRatePercent?.toFixed(1) ?? "0"}%
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-amber-50 p-6 flex items-center hover:shadow-md transition-shadow">
                  <div className="rounded-lg bg-amber-50 p-3 mr-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Open Blockers</p>
                    <p className="text-2xl font-bold text-gray-900">{summary?.openBlockersCount ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Tasks Completed Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d1fae5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="completed" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Submission Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={submissionData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                        >
                          {submissionData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d1fae5' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Team Reports Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-100 bg-[#f8fcf9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    Team Reports
                  </h3>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <select
                        value={filterUserId}
                        onChange={(e) => setFilterUserId(e.target.value ? Number(e.target.value) : '')}
                        className="text-sm border border-emerald-100 rounded-lg pl-3 pr-8 py-2 bg-white focus:ring-emerald-500 focus:border-emerald-500 shadow-sm outline-none appearance-none"
                      >
                        <option value="">All Team Members</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.fullName}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="relative">
                      <select
                        value={filterProjectId}
                        onChange={(e) => setFilterProjectId(e.target.value ? Number(e.target.value) : '')}
                        className="text-sm border border-emerald-100 rounded-lg pl-3 pr-8 py-2 bg-white focus:ring-emerald-500 focus:border-emerald-500 shadow-sm outline-none appearance-none"
                      >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={filterWeek}
                        onChange={(e) => setFilterWeek(e.target.value)}
                        className="text-sm border border-emerald-100 rounded-lg pl-9 pr-3 py-2 bg-white focus:ring-emerald-500 focus:border-emerald-500 shadow-sm outline-none"
                        placeholder="Filter by week"
                      />
                    </div>
                  </div>
                </div>

                {isReportsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Member</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Project & Week</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Tasks & Blockers</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {visibleMembers.map((member) => {
                          const report = filteredReports.find(r => r.userId === member.id);
                          const isSubmitted = !!report;

                          return (
                            <tr key={member.id} className="hover:bg-emerald-50/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs border border-emerald-200">
                                    {member.fullName?.charAt(0) || 'U'}
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{member.fullName || 'Unknown User'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {isSubmitted ? (
                                  <>
                                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20 mb-1">
                                      {report.projectName || 'Unknown Project'}
                                    </span>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {report.weekStartDate}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">No report filed</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {isSubmitted ? (
                                  <>
                                    <div className="text-sm text-gray-700 line-clamp-1 max-w-xs mb-1" title={report.tasksCompleted}>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500 inline mr-1" />
                                      {report.tasksCompleted}
                                    </div>
                                    {report.blockers && (
                                      <div className="text-xs text-amber-700 line-clamp-1 max-w-xs" title={report.blockers}>
                                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                                        {report.blockers}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isSubmitted ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        {visibleMembers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                              No members match your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating AI Chat Widget */}
          <div className="fixed bottom-6 right-6 z-50">
            {isChatOpen ? (
              <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom-5">
                {/* Chat Header */}
                <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-medium text-sm">TeamPulse AI Assistant</span>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-emerald-200 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat Body */}
                <div className="h-80 overflow-y-auto p-4 bg-[#f8fcf9] space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-10">
                      <Bot className="w-10 h-10 mx-auto text-emerald-200 mb-2" />
                      <p>Hi! Ask me anything about your team's activity, recent blockers, or project progress.</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white border border-emerald-100 text-gray-800 rounded-bl-none shadow-sm'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-emerald-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-3 bg-white border-t border-emerald-50">
                  <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about team activity..."
                      className="flex-1 px-3 py-2 border border-emerald-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-gray-50"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex items-center justify-center group"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap ml-0 group-hover:ml-2 font-medium">
                  Ask AI Assistant
                </span>
              </button>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
