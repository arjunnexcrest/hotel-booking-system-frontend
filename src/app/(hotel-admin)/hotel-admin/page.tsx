'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { hotelsApi } from '@/lib/api';
import { HotelApplication } from '@/types';
import { ProtectedRoute } from '@/components/auth';

export default function HotelAdminDashboardPage() {
  const [application, setApplication] = useState<HotelApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApp() {
      try {
        const app = await hotelsApi.getMyApplication();
        setApplication(app);
      } catch (err) {
        console.error('Error fetching application status:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, []);

  const isApproved = application?.status === 'APPROVED';

  return (
    <ProtectedRoute allowedRoles={['hotel_owner', 'hotel_admin', 'super_admin']}>
      <main className="min-h-screen bg-slate-50/70 p-6 sm:p-8 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Property Administration
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Hotel Operations Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your restaurants, dining tables, AI computer vision alerts, and reservations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hotel-admin/application-status"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-gray-300 text-gray-700 shadow-xs hover:bg-gray-50 transition"
          >
            📋 Application Status
          </Link>
          <Link
            href="/hotel-registration"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition"
          >
            + Register / Update Property
          </Link>
        </div>
      </div>

      {/* Compliance / Status Banner */}
      {!loading && application && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isApproved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : application.status === 'REJECTED'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">
                {isApproved ? '✅' : application.status === 'REJECTED' ? '⚠️' : '⏳'}
              </span>
              <h2 className="text-sm font-bold">
                Application Status: {application.status.replace('_', ' ')}
              </h2>
            </div>
            <p className="text-xs opacity-90">
              {isApproved
                ? `Accreditation verified for "${application.hotel.name}". Your property and dining facilities are publicly listed.`
                : application.status === 'REJECTED'
                ? `Action required: ${application.rejection_reason || 'Compliance issues detected. Please review feedback and resubmit.'}`
                : `Your registration for "${application.hotel.name}" is undergoing Super Administrator compliance vetting.`}
            </p>
          </div>

          <Link
            href="/hotel-admin/application-status"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white/80 hover:bg-white text-gray-900 border border-current shadow-xs whitespace-nowrap text-center transition"
          >
            View Verification Tracker →
          </Link>
        </div>
      )}

      {/* Quick Stats Grid (SRS 9.2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Active Tables
          </span>
          <p className="text-2xl font-extrabold text-gray-900">18</p>
          <span className="text-[11px] text-emerald-600 font-medium">● 12 Available Now</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Today Bookings
          </span>
          <p className="text-2xl font-extrabold text-gray-900">26</p>
          <span className="text-[11px] text-indigo-600 font-medium">9 confirmed for dinner</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            AI Operational Alerts
          </span>
          <p className="text-2xl font-extrabold text-amber-600">2</p>
          <span className="text-[11px] text-gray-500">1 Service, 1 Cleaning</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Camera Feeds
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">4 / 4</p>
          <span className="text-[11px] text-emerald-600 font-medium">All CCTV Streams Online</span>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/hotel-admin/restaurants"
          className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg mb-3">
            🍽️
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition">
            Restaurants & Venues
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Configure dining rooms, seasonal operating hours, and menus for on-site venues.
          </p>
        </Link>

        <Link
          href="/hotel-admin/tables"
          className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg mb-3">
            🪑
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition">
            Dining Tables & Layout
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Manage table capacities, floor zones, physical condition, and print QR codes.
          </p>
        </Link>

        <Link
          href="/hotel-admin/bookings"
          className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-lg mb-3">
            📅
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition">
            Reservations & Bookings
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            View upcoming guest reservations, check-ins, guest notes, and cancellations.
          </p>
        </Link>

        <Link
          href="/hotel-admin/alerts"
          className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg mb-3">
            🤖
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition">
            AI Monitoring & Alerts
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Real-time notifications for missing waiter service, uncleaned tables, and outages.
          </p>
        </Link>

        <Link
          href="/hotel-admin/staff"
          className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 text-lg mb-3">
            👥
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition">
            Staff & Table Assignments
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Assign waiters to table zones, dispatch cleaning tasks, and track response times.
          </p>
        </Link>

        <Link
          href="/hotel-admin/settings"
          className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition group"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 text-lg mb-3">
            ⚙️
          </div>
          <h2 className="text-base font-bold text-gray-900 group-hover:text-slate-900 transition">
            Hotel Settings & Credentials
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Update hotel profile, business licenses, contact emails, and notification channels.
          </p>
        </Link>
      </div>
    </main>
  </ProtectedRoute>
);
}
