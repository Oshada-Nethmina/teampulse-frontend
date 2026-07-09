"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/auth.service';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn("Failed to parse user from local storage");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (storedUser === "undefined") {
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (response: AuthResponse) => {
    const user: User = {
      id: response.userId,
      name: response.fullName,
      email: response.email,
      role: response.role as 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN',
    };

    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);

    if (user.role === "MANAGER" || user.role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/my-reports");
    }
  };

  const login = async (data: any) => {
    const response = await authService.login(data);
    handleAuthSuccess(response);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    handleAuthSuccess(response);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout failed on server, continuing local logout", e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
