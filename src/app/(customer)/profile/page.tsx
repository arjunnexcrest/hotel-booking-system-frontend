'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { getStoredUser, clearAuth } from '@/lib/auth';
import { User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setPhone(profile.phone_number || '');
      } catch {
        const stored = getStoredUser();
        if (stored) {
          setUser(stored);
          setFirstName(stored.first_name || '');
          setLastName(stored.last_name || '');
          setPhone(stored.phone_number || '');
        } else {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await authApi.getProfile();
      setUser({ ...updated, first_name: firstName, last_name: lastName, phone_number: phone });
      setSuccessMsg('Profile information updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            {user?.role}
          </span>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
