'use client';

import React from 'react';
import Link from 'next/link';
import HotelRegistrationForm from '@/components/hotels/HotelRegistrationForm';

export default function HotelAdminRegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Hotel Administration Portal
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Register Property
          </h1>
        </div>

        <Link
          href="/hotel-admin/application-status"
          className="text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-white border border-gray-300 px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          Check Application Status →
        </Link>
      </div>

      <HotelRegistrationForm />
    </main>
  );
}
