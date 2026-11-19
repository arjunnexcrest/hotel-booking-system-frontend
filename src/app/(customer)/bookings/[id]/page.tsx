'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';

function statusBadgeStyle(status: string): string {
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

export default function BookingDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.getBookingById(id);
      setBooking(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load booking details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setCancelling(true);
    setActionMsg(null);
    try {
      await bookingsApi.cancelBooking(
        booking.id,
        cancelReason.trim() || 'Cancelled by customer'
      );
      setShowCancelModal(false);
      setCancelReason('');
      setActionMsg({ type: 'success', text: 'Reservation successfully cancelled.' });
      await loadBooking();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed.';
      setActionMsg({ type: 'error', text: msg });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
        <div className="h-44 bg-gray-100 rounded-2xl" />
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="text-4xl">🎟️</div>
        <h1 className="text-xl font-bold text-gray-900">Booking Not Found</h1>
        <p className="text-sm text-gray-500">
          {error || 'We could not find this reservation or you do not have access to view it.'}
        </p>
        <Link
          href="/bookings"
          className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          ← Back to My Reservations
        </Link>
      </main>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.booking_status);
  const history = booking.history || [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <Link href="/bookings" className="font-semibold text-indigo-600 hover:text-indigo-800">
          ← Back to My Reservations
        </Link>
        <Link href="/hotels" className="font-semibold text-gray-600 hover:text-indigo-600">
          Explore Hotels
        </Link>
      </div>

      {actionMsg && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
            actionMsg.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Voucher Card */}
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
              Dining Reservation Voucher
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
              {booking.booking_reference}
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              {booking.hotel_name} — {booking.restaurant_name}
            </p>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-bold self-start sm:self-auto ${statusBadgeStyle(
              booking.booking_status
            )}`}
          >
            {booking.booking_status_display || booking.booking_status}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Core Reservation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs">
            <div>
              <span className="text-gray-500 block">Date</span>
              <strong className="text-sm text-gray-900">{booking.booking_date}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Time Window</span>
              <strong className="text-sm text-gray-900">
                {booking.start_time?.slice(0, 5)} – {booking.end_time?.slice(0, 5)}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Table &amp; Zone</span>
              <strong className="text-sm text-gray-900">
                Table #{booking.table_number || booking.table}
                {booking.table_zone ? ` (${booking.table_zone})` : ''}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Party Size</span>
              <strong className="text-sm text-gray-900">{booking.guest_count} Guests</strong>
            </div>
          </div>

          {/* Guest Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-t border-gray-100 pt-5">
            <div>
              <span className="text-gray-500 block">Guest Name</span>
              <strong className="text-gray-900">{booking.customer_name}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Email</span>
              <strong className="text-gray-900">{booking.customer_email}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Phone</span>
              <strong className="text-gray-900">{booking.customer_phone || '—'}</strong>
            </div>
          </div>

          {booking.special_requests && (
            <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4 text-xs text-indigo-950">
              <strong className="block mb-0.5">Special Requests</strong>
              {booking.special_requests}
            </div>
          )}

          {booking.cancellation_reason && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
              <strong className="block mb-0.5">Cancellation Notice</strong>
              {booking.cancellation_reason}
              {booking.cancelled_at && (
                <span className="block text-[11px] text-rose-600 mt-1">
                  Cancelled on {new Date(booking.cancelled_at).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">
              Booked on {new Date(booking.created_at).toLocaleString()}
            </span>

            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                Cancel Reservation
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Booking Lifecycle Timeline */}
      {history.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Reservation Activity Timeline</h2>
          <ol className="relative border-l border-gray-200 ml-2 space-y-4">
            {history.map((item) => (
              <li key={item.id} className="ml-5">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600" />
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-gray-900">
                    {item.previous_status
                      ? `${item.previous_status} → ${item.new_status}`
                      : item.new_status}
                  </span>
                  {item.changed_by_username && (
                    <span className="text-gray-500">by {item.changed_by_username}</span>
                  )}
                  <span className="text-[11px] text-gray-400 ml-auto">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                {item.reason && <p className="mt-0.5 text-xs text-gray-600">{item.reason}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Cancel This Reservation</h3>
              <p className="text-xs text-gray-500 mt-1">
                Confirm cancellation for{' '}
                <strong className="font-mono text-gray-800">{booking.booking_reference}</strong>.
              </p>
            </div>

            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for cancellation
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you need to cancel..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Keep Booking
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
