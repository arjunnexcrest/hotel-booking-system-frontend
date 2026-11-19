'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';

type BookingsTab = 'upcoming' | 'past';

function getStatusBadge(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CHECKED_IN':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'CANCELLED':
    case 'REJECTED':
    case 'NO_SHOW':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

function canCancelBooking(status: string): boolean {
  return ['PENDING', 'CONFIRMED'].includes(status);
}

export default function BookingsPage() {
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingsTab>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Authenticated cancel modal
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Guest cancel by reference panel
  const [showGuestCancel, setShowGuestCancel] = useState(false);
  const [guestRef, setGuestRef] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestReason, setGuestReason] = useState('');
  const [guestCancelling, setGuestCancelling] = useState(false);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsApi.getMyBookings();
      setUpcoming(res.upcoming || []);
      setPast(res.past || []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to load your reservations right now.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      await bookingsApi.cancelBooking(
        cancelTarget.id,
        cancelReason.trim() || 'Cancelled by customer'
      );
      showToast('success', `Reservation ${cancelTarget.booking_reference} has been cancelled.`);
      setCancelTarget(null);
      setCancelReason('');
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed.';
      showToast('error', msg);
    } finally {
      setCancelling(false);
    }
  };

  const handleGuestCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestCancelling(true);
    try {
      const res = await bookingsApi.cancelByReference({
        booking_reference: guestRef.trim().toUpperCase(),
        customer_email: guestEmail.trim().toLowerCase(),
        reason: guestReason.trim() || 'Cancelled by guest',
      });
      showToast(
        'success',
        `Guest reservation ${res.booking_reference} cancelled (${res.booking_status}).`
      );
      setGuestRef('');
      setGuestEmail('');
      setGuestReason('');
      setShowGuestCancel(false);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not cancel guest reservation.';
      showToast('error', msg);
    } finally {
      setGuestCancelling(false);
    }
  };

  const visibleBookings = activeTab === 'upcoming' ? upcoming : past;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-rose-300 bg-rose-50 text-rose-900'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Reservation Portal
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
            My Table Reservations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage upcoming dining reservations, view booking vouchers, or cancel guest bookings by reference.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowGuestCancel((prev) => !prev)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            {showGuestCancel ? 'Hide Guest Lookup' : 'Cancel by Reference'}
          </button>
          <Link
            href="/hotels"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            + New Reservation
          </Link>
        </div>
      </div>

      {/* Guest Cancel by Reference Drawer */}
      {showGuestCancel && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-indigo-950">
              Cancel a Guest Reservation by Reference Code
            </h2>
            <p className="text-xs text-indigo-800/80 mt-0.5">
              Booked without signing in? Enter your booking reference code and email address to cancel instantly.
            </p>
          </div>

          <form onSubmit={handleGuestCancelSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={guestRef}
              onChange={(e) => setGuestRef(e.target.value)}
              placeholder="Reference (e.g. HBS-2026-...)"
              className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Booking Email Address"
              className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              value={guestReason}
              onChange={(e) => setGuestReason(e.target.value)}
              placeholder="Reason (optional)"
              className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={guestCancelling}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {guestCancelling ? 'Cancelling...' : 'Cancel Guest Booking'}
            </button>
          </form>
        </section>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'upcoming'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'past'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past &amp; Cancelled ({past.length})
          </button>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">Sign in to view your account bookings</p>
            <p className="text-xs text-amber-800 mt-0.5">{error}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={fetchBookings}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !error && visibleBookings.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200 space-y-3">
          <div className="text-3xl">🍽️</div>
          <p className="text-sm font-semibold text-gray-800">
            {activeTab === 'upcoming'
              ? 'No upcoming reservations right now.'
              : 'No past or cancelled reservations yet.'}
          </p>
          <Link
            href="/hotels"
            className="inline-block rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
          >
            Explore Hotels &amp; Book a Table
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleBookings.map((b) => (
            <article
              key={b.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-200 transition"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/bookings/${b.id}`}
                    className="font-mono text-xs font-bold text-indigo-700 hover:underline"
                  >
                    {b.booking_reference}
                  </Link>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      b.booking_status
                    )}`}
                  >
                    {b.booking_status_display || b.booking_status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  {b.hotel_name || 'Hotel'} — {b.restaurant_name || 'Restaurant'}
                </h3>

                <p className="text-xs text-gray-600">
                  📅 {b.booking_date} • ⏰ {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)} •
                  🪑 Table #{b.table_number || b.table}
                  {b.table_zone ? ` (${b.table_zone})` : ''} • 👥 {b.guest_count} Guests
                </p>

                {b.special_requests && (
                  <p className="text-xs text-gray-500 italic">
                    Note: &quot;{b.special_requests}&quot;
                  </p>
                )}

                {b.cancellation_reason && (
                  <p className="text-xs text-rose-600">
                    Cancellation reason: {b.cancellation_reason}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href={`/bookings/${b.id}`}
                  className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  View Details
                </Link>

                {canCancelBooking(b.booking_status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelTarget(b);
                      setCancelReason('');
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Inline Cancel Reservation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Cancel Reservation</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to cancel{' '}
                <strong className="font-mono text-gray-800">{cancelTarget.booking_reference}</strong>{' '}
                at {cancelTarget.restaurant_name} on {cancelTarget.booking_date}?
              </p>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for cancellation
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Change of plans, rescheduling to another day..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
