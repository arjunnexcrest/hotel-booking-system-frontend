'use client';

import React, { useState } from 'react';
import HotelRegistrationForm from '@/components/hotels/HotelRegistrationForm';
import HotelApplicationStatus from '@/components/hotels/HotelApplicationStatus';

export default function HotelRegistrationPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'status'>('register');

  return (
    <main className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation Switcher */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            GrandTable Hospitality Partner Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Register your luxury dining hotel or check your ongoing compliance verification (FR-007 & FR-008)
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-gray-200/80 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'register'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Registration Dossier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'status'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔍 Track Application Status
          </button>
        </div>
      </div>

      {activeTab === 'register' ? (
        <HotelRegistrationForm
          onSuccess={() => {
            setActiveTab('status');
          }}
        />
      ) : (
        <HotelApplicationStatus
          onEditApplication={() => {
            setActiveTab('register');
          }}
        />
      )}
    </main>
  );
}
