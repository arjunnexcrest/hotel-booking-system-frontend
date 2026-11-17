'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login({ username, password });

      // Route based on user role
      if (loggedUser.role === 'super_admin') {
        router.push('/super-admin');
      } else if (loggedUser.role === 'hotel_owner' || loggedUser.role === 'hotel_admin') {
        router.push('/hotel-admin');
      } else if (loggedUser.role === 'staff') {
        router.push('/staff');
      } else {
        router.push('/hotels');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid username or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-md">
            HBS
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to manage your dining reservations or hotel operations
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. customer_john or admin"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition"
          >
            {loading ? 'Authenticating...' : 'Sign in'}
          </button>
        </form>

        {/* Demo Fast Fill Section */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-xs font-medium text-gray-500 text-center mb-2">
            Quick Demo Logins (Click to autofill):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofill('admin', 'Admin@12345')}
              className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1.5 text-purple-700 hover:bg-purple-100 text-left font-medium"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => autofill('owner_palace', 'Owner@12345')}
              className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-blue-700 hover:bg-blue-100 text-left font-medium"
            >
              🏨 Hotel Owner
            </button>
            <button
              type="button"
              onClick={() => autofill('customer_john', 'Customer@12345')}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-emerald-700 hover:bg-emerald-100 text-left font-medium"
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => autofill('staff_rahul', 'Staff@12345')}
              className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-amber-700 hover:bg-amber-100 text-left font-medium"
            >
              🧑‍🍳 Waiter / Staff
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
