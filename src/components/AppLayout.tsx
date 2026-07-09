"use client";

import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, FileText, FolderKanban, Users, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';

  const navigation = [
    ...(!isManager 
      ? [{ name: 'My Reports', href: '/my-reports', icon: FileText, current: pathname.startsWith('/my-reports') }] 
      : []),
    ...(isManager
      ? [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: pathname.startsWith('/dashboard') },
          { name: 'Projects', href: '/projects', icon: FolderKanban, current: pathname.startsWith('/projects') },
          { name: 'Team', href: '/team', icon: Users, current: pathname.startsWith('/team') },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md flex items-center justify-center">
                <span className="text-xl font-bold text-white">TP</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 tracking-tight">TeamPulse</span>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors`}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="inline-block h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">TP</span>
          </div>
          <span className="ml-2 text-lg font-bold text-gray-900">TeamPulse</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 hover:text-gray-900"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-gray-800 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
             <div className="pt-20 pb-4 px-4 overflow-y-auto flex-1">
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        item.current
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-3 py-3 text-base font-medium rounded-lg`}
                    >
                      <item.icon className={`${item.current ? 'text-emerald-600' : 'text-gray-400'} mr-4 h-6 w-6`} />
                      {item.name}
                    </Link>
                  ))}
                </nav>
             </div>
             <div className="border-t border-gray-200 p-4">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="mr-4 h-6 w-6" />
                  Logout
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1 pt-16 md:pt-0 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
