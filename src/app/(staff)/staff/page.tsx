'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth';

export default function StaffDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'hotel_owner', 'hotel_admin', 'super_admin']}>
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          TODO: assigned tables, service & cleaning tasks
        </p>
      </main>
    </ProtectedRoute>
  );
}
