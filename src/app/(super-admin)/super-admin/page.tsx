'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { hotelsApi } from '@/lib/api';
import { HotelApplication } from '@/types';
import { ProtectedRoute } from '@/components/auth';

export default function SuperAdminDashboardPage() {
  const [applications, setApplications] = useState<HotelApplication[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const apps = await hotelsApi.getAllApplications();
        setApplications(apps);
      } catch (err) {
        console.error('Failed to load apps:', err);
      }
    }
    fetchStats();
  }, []);

  const pendingCount = applications.filter((a) => a.status === 'PENDING_APPROVAL').length;
  const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <main className="min-h-screen bg-slate-50/70 p-6 sm:p-8 lg:p-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Platform Command Center (SRS 9.1)
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Super Administrator Directorate
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Oversee multi-hotel accreditation, regulatory vetting, and system-wide dining operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/approvals"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition flex items-center gap-2"
          >
            <span>⚡</span> Hotel Vetting Queue
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-purple-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Pending Action Alert */}
      {pendingCount > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <h2 className="text-sm font-bold">
                {pendingCount} Hotel Registration {pendingCount === 1 ? 'Application' : 'Applications'} Pending Accreditation
              </h2>
            </div>
            <p className="text-xs text-amber-800">
              New property dossiers submitted by hotel owners are awaiting regulatory document review (trade licenses, food safety certificates).
            </p>
          </div>

          <Link
            href="/super-admin/approvals"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs whitespace-nowrap text-center transition"
          >
            Review Applications Now →
          </Link>
        </div>
      )}

      {/* KPI Stats Grid (SRS 9.1) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Total Hotels
          </span>
          <p className="text-2xl font-extrabold text-gray-900">{applications.length}</p>
          <span className="text-[11px] text-gray-500">Across all onboarding stages</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Approved & Live
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">{approvedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Publicly visible</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Under Compliance Audit
          </span>
          <p className="text-2xl font-extrabold text-blue-600">{underReviewCount}</p>
          <span className="text-[11px] text-blue-600 font-medium">Active license checks</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Platform Security
          </span>
          <p className="text-2xl font-extrabold text-purple-700">100%</p>
          <span className="text-[11px] text-purple-700 font-medium">Tenant isolation active</span>
        </div>
      </div>

      {/* Navigation Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/super-admin/approvals"
          className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-700 text-lg mb-3">
            📋
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition">
            Hotel Approval Queue
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Audit trade licenses, health certificates, and grant or reject platform accreditation (FR-010–FR-012).
          </p>
        </Link>

        <Link
          href="/super-admin/hotels"
          className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 text-lg mb-3">
            🏨
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition">
            Registered Hotels Registry
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Manage active properties, view public dining listings, or suspend violating establishments.
          </p>
        </Link>

        <Link
          href="/super-admin/customers"
          className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-700 text-lg mb-3">
            👥
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition">
            Customer Accounts
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Manage registered guest profiles, booking frequency, and identity verification records.
          </p>
        </Link>

        <Link
          href="/super-admin/audit"
          className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-700 text-lg mb-3">
            🔍
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-amber-700 transition">
            Security & Audit Logs
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Inspect immutable activity logs, actor IDs, request IP addresses, and administrative overrides.
          </p>
        </Link>

        <Link
          href="/super-admin/reports"
          className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-lg mb-3">
            📊
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition">
            Platform Analytics & Trends
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Review platform-wide reservation volume, hotel occupancy rates, and AI detection accuracy.
          </p>
        </Link>
      </div>
    </main>
  </ProtectedRoute>
);
}
