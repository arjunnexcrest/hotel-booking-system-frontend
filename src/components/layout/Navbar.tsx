'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md">
            HBS
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">GrandTable</span>
            <span className="hidden sm:inline-block ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              AI Powered
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/hotels" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
            Explore Hotels
          </Link>

          {isAuthenticated && (
            <Link href="/bookings" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
              My Reservations
            </Link>
          )}

          <Link
            href="/hotel-registration"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
          >
            <span>🏨</span> List Your Hotel
          </Link>

          {/* Role specific portals */}
          {user?.role === 'super_admin' && (
            <div className="flex items-center gap-2">
              <Link
                href="/super-admin"
                className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md hover:bg-purple-100 transition"
              >
                Super Admin
              </Link>
              <Link
                href="/super-admin/approvals"
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-100/70 px-2 py-1 rounded-md transition"
              >
                Vetting Queue
              </Link>
            </div>
          )}

          {(user?.role === 'hotel_owner' || user?.role === 'hotel_admin') && (
            <div className="flex items-center gap-2">
              <Link
                href="/hotel-admin"
                className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md hover:bg-blue-100 transition"
              >
                Hotel Dashboard
              </Link>
              <Link
                href="/hotel-admin/application-status"
                className="text-xs font-semibold text-gray-600 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-gray-100 transition"
              >
                Status
              </Link>
            </div>
          )}

          {user?.role === 'staff' && (
            <Link
              href="/staff"
              className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition"
            >
              Staff Terminal
            </Link>
          )}
        </nav>

        {/* User Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700 text-xs">
                  {user.first_name ? user.first_name[0] : user.username[0].toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium text-xs leading-none">{user.first_name || user.username}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{user.role?.replace('_', ' ')}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-4 space-y-2">
          <Link href="/hotels" className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
            Explore Hotels
          </Link>
          <Link href="/hotel-registration" className="block py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
            🏨 List Your Hotel / Partner
          </Link>
          {isAuthenticated && (
            <Link href="/bookings" className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
              My Reservations
            </Link>
          )}
          {user?.role === 'super_admin' && (
            <Link href="/super-admin/approvals" className="block py-2 text-sm font-medium text-purple-700">
              ⚡ Super Admin Approvals
            </Link>
          )}
          {(user?.role === 'hotel_owner' || user?.role === 'hotel_admin') && (
            <Link href="/hotel-admin/application-status" className="block py-2 text-sm font-medium text-blue-700">
              📋 Application Status
            </Link>
          )}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Signed in as {user?.username} ({user?.role?.replace('_', ' ')})
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-red-600 font-semibold"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <Link href="/login" className="flex-1 text-center py-2 text-sm font-medium border rounded-md">
                Sign in
              </Link>
              <Link href="/register" className="flex-1 text-center py-2 text-sm font-medium bg-indigo-600 text-white rounded-md">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
