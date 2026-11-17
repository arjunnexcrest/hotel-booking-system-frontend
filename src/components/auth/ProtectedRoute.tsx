'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectUnauthenticated?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectUnauthenticated = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-gray-500 font-medium">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      router.push(redirectUnauthenticated);
    }
    return null;
  }

  // Superadmin always has full access
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xl">
            🚫
          </div>
          <h2 className="mt-4 text-xl font-bold text-red-950">Access Restricted</h2>
          <p className="mt-2 text-xs text-red-700 leading-relaxed">
            Your current account role (<strong>{user.role}</strong>) does not have permission to access this area.
            Only authorized users with roles: {allowedRoles.join(', ')} can view this workspace.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
