'use client';

import React from 'react';
import Link from 'next/link';
import HotelApplicationStatus from '@/components/hotels/HotelApplicationStatus';

export default function HotelAdminApplicationStatusPage() {
  return (
    <main className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Hotel Administration Portal
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Accreditation & Approval Status
          </h1>
        </div>

        <Link
          href="/hotel-admin"
          className="text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-white border border-gray-300 px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          ← Hotel Admin Overview
        </Link>
      </div>

      <HotelApplicationStatus />
    </main>
  );
}

