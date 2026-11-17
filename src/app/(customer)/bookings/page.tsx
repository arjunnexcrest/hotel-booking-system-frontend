'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await bookingsApi.getMyBookings();
      const list = Array.isArray(res) ? res : res.results || [];
      setBookings(list);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: number) => {
    const reason = prompt('Please specify a reason for cancellation:');
    if (!reason) return;

    setCancellingId(id);
    try {
      await bookingsApi.cancelBooking(id, reason);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      alert(`Cancellation failed: ${msg}`);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Table Reservations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review upcoming dining bookings, check-in statuses, and cancellation history
          </p>
        </div>
        <Link
          href="/hotels"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
        >
          + New Reservation
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-sm text-gray-500">No reservations found yet.</p>
          <Link
            href="/hotels"
            className="mt-3 inline-block rounded-lg bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Explore Hotels and Book a Table
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700">
                    {b.booking_reference}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(b.booking_status)}`}>
                    {b.booking_status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  {b.hotel_name || 'Hotel'} — {b.restaurant_name || 'Restaurant'}
                </h3>
                <p className="text-xs text-gray-600">
                  📅 {b.booking_date} • ⏰ {b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)} • 🪑 Table #{b.table_number || b.table} ({b.guest_count} Guests)
                </p>
                {b.special_requests && (
                  <p className="text-xs text-gray-500 italic">
                    Special request: &quot;{b.special_requests}&quot;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {b.booking_status !== 'CANCELLED' && b.booking_status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancellingId === b.id}
                    className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
                  >
                    {cancellingId === b.id ? 'Cancelling...' : 'Cancel Reservation'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
