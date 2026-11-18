'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, AuthTokens } from '@/types';
import { authApi } from '@/lib/api';
import {
  getStoredUser,
  getAccessToken,
  setAuth,
  clearAuth,
  isAuthenticated as checkIsAuthenticated,
} from './index';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  hasRole: (allowedRoles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hbs_user', JSON.stringify(profile));
      }
    } catch {
      // Fallback to stored user
      const stored = getStoredUser();
      setUser(stored);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (token && stored) {
      setUser(stored);
      // Fetch fresh profile in background
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const authTokens: AuthTokens = await authApi.login(credentials);
      setAuth(authTokens);
      setUser(authTokens.user);

      // Fetch extended profile with memberships
      try {
        const fullProfile = await authApi.getProfile();
        setUser(fullProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hbs_user', JSON.stringify(fullProfile));
        }
        return fullProfile;
      } catch {
        return authTokens.user;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    return await authApi.register(data);
  };

  const logout = () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('hbs_refresh_token') : null;
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    clearAuth();
    setUser(null);
    router.push('/login');
  };

  const hasRole = (allowedRoles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user && checkIsAuthenticated(),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
