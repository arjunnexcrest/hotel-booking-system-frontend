'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  const isRoleAllowed = !allowedRoles || allowedRoles.length === 0 || (user && hasRole(allowedRoles));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/');
      router.push(`${redirectTo}?redirect=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Verifying authorization...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  if (!isRoleAllowed) {
    const roleDestinations: Record<UserRole, { label: string; href: string }> = {
      super_admin: { label: 'Super Admin Portal', href: '/super-admin' },
      hotel_owner: { label: 'Hotel Dashboard', href: '/hotel-admin' },
      hotel_admin: { label: 'Hotel Dashboard', href: '/hotel-admin' },
      staff: { label: 'Staff Terminal', href: '/staff' },
      customer: { label: 'Customer Area', href: '/hotels' },
    };

    const dest = roleDestinations[user.role] || { label: 'Home', href: '/' };

    return (
      <main className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
            🛡️
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Access Restricted
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your current account role is{' '}
            <span className="font-semibold text-gray-900 uppercase">
              {user.role.replace('_', ' ')}
            </span>
            . You do not have permission to access this portal.
          </p>

          <div className="pt-2">
            <Link
              href={dest.href}
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
            >
              Go to {dest.label}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
