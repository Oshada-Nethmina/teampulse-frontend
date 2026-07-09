"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import { userService, UserResponse } from '../../services/user.service';
import { Mail, Shield, User as UserIcon } from 'lucide-react';

export default function TeamPage() {
  const [team, setTeam] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setTeam(data);
    } catch (error) {
      console.error("Failed to fetch team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
      <AppLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Team Directory</h1>
            <p className="text-sm text-gray-500 mt-1">View all team members and their roles.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div key={member.id} className="bg-white rounded-xl shadow-sm border border-emerald-50 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-xl border border-emerald-200">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{member.fullName}</h3>
                        <p className="text-sm text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
                          <Shield className="w-3.5 h-3.5" />
                          {member.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#f8fcf9] px-6 py-3 border-t border-emerald-50">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <a href={`mailto:${member.email}`} className="hover:text-emerald-600 transition-colors">{member.email}</a>
                    </div>
                  </div>
                </div>
              ))}
              {team.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  <UserIcon className="w-12 h-12 mx-auto text-emerald-200 mb-2" />
                  <p>No team members found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
