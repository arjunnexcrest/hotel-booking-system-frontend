'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { hotelsApi, restaurantsApi, bookingsApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { Hotel, Restaurant, RestaurantTable, Booking } from '@/types';

export default function HotelDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Availability / Booking Form State
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [guests, setGuests] = useState(2);

  // Available tables state
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Booking completion state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCustomerName(user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username);
      setCustomerEmail(user.email);
      setCustomerPhone(user.phone_number || '');
    }
  }, []);

  useEffect(() => {
    async function fetchHotelAndRestaurants() {
      if (!slug) return;
      try {
        const hotelData = await hotelsApi.getHotelBySlug(slug);
        setHotel(hotelData);

        const restData = await restaurantsApi.getRestaurantsByHotel(hotelData.id);
        const restList = Array.isArray(restData) ? restData : restData.results || [];
        setRestaurants(restList);
        if (restList.length > 0) {
          setSelectedRestaurant(restList[0]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load hotel information.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchHotelAndRestaurants();
  }, [slug]);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    setCheckingAvailability(true);
    setConfirmedBooking(null);
    setSelectedTable(null);

    try {
      const res = await bookingsApi.checkAvailability({
        restaurant: selectedRestaurant.id,
        date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        guests: Number(guests),
      });
      setAvailableTables(res.tables || []);
      setAvailabilityChecked(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error checking availability';
      alert(`Error checking availability: ${msg}`);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel || !selectedRestaurant || !selectedTable) return;

    setSubmittingBooking(true);
    try {
      const booking = await bookingsApi.createBooking({
        hotel: hotel.id,
        restaurant: selectedRestaurant.id,
        table: selectedTable.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        guest_count: Number(guests),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        special_requests: specialRequests,
      });
      setConfirmedBooking(booking);
      setSelectedTable(null);
      setAvailableTables([]);
      setAvailabilityChecked(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking creation failed';
      alert(`Booking creation failed: ${msg}`);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </main>
    );
  }

  if (error || !hotel) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Hotel Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">{error || 'Could not find the requested property.'}</p>
        <Link href="/hotels" className="mt-4 inline-block text-sm text-indigo-600 underline">
          ← Back to Hotels
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Hotel Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              Verified {hotel.status} Property
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              {hotel.name}
            </h1>
            <p className="mt-2 text-sm text-indigo-200">
              {hotel.hotel_type} • 📍 {hotel.address}, {hotel.city}, {hotel.state} {hotel.postal_code}
            </p>
            <p className="mt-3 text-sm text-slate-300 max-w-3xl leading-relaxed">
              {hotel.description}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-xs space-y-1.5 border border-white/10 shrink-0">
            <div><strong className="text-white">Phone:</strong> {hotel.phone}</div>
            <div><strong className="text-white">Email:</strong> {hotel.email}</div>
            <div><strong className="text-white">Operating:</strong> 7 Days a week</div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog (if booked) */}
      {confirmedBooking && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-lg">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Reservation Confirmed!</h2>
              <p className="text-xs text-emerald-700">
                Your table booking has been successfully recorded and locked.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
            <div>
              <span className="text-gray-500 block">Reference No:</span>
              <strong className="font-mono text-sm text-indigo-700">{confirmedBooking.booking_reference}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Date & Time:</span>
              <strong>{confirmedBooking.booking_date} ({confirmedBooking.start_time.slice(0,5)} - {confirmedBooking.end_time.slice(0,5)})</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Guests:</span>
              <strong>{confirmedBooking.guest_count} Persons</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Table Assigned:</span>
              <strong>Table #{confirmedBooking.table_number || 'Confirmed'}</strong>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href="/bookings"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-800"
            >
              View in My Reservations
            </Link>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              Book Another Table
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Restaurant Selection & Live Reservation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Restaurants List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Dining Facilities</h2>
          {restaurants.length === 0 ? (
            <div className="p-4 bg-white rounded-xl border text-sm text-gray-500">
              No restaurants registered under this hotel yet.
            </div>
          ) : (
            restaurants.map((rest) => (
              <button
                key={rest.id}
                onClick={() => {
                  setSelectedRestaurant(rest);
                  setAvailabilityChecked(false);
                  setAvailableTables([]);
                  setSelectedTable(null);
                }}
                className={`w-full text-left p-5 rounded-2xl border transition ${
                  selectedRestaurant?.id === rest.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{rest.name}</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
                    {rest.cuisine_type || 'Fine Dining'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                  {rest.description}
                </p>
                <div className="mt-3 text-[11px] text-gray-500">
                  ⏰ Open: 11:00 AM – 11:30 PM
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Column: Reservation Workflow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Reserve a Table at {selectedRestaurant?.name || 'Selected Restaurant'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Check live table availability verified against physical conditions and active reservations
            </p>

            {/* Step 1: Availability Check Form */}
            <form onSubmit={handleCheckAvailability} className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 mt-2">
                <button
                  type="submit"
                  disabled={checkingAvailability}
                  className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {checkingAvailability ? 'Checking Live Table Status...' : 'Check Available Tables'}
                </button>
              </div>
            </form>

            {/* Step 2: Available Tables Selection */}
            {availabilityChecked && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900">
                  Available Tables for {bookingDate} ({startTime} - {endTime})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Found {availableTables.length} table(s) matching your guest party. Select a table to proceed:
                </p>

                {availableTables.length === 0 ? (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No tables available for the selected time slot. Try adjusting your time or party size.
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTables.map((tbl) => (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => setSelectedTable(tbl)}
                        className={`p-3 rounded-xl border text-left transition ${
                          selectedTable?.id === tbl.id
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900">
                            Table {tbl.table_number}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                            Ready
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          Capacity: <strong>{tbl.capacity} guests</strong>
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {tbl.table_type} • {tbl.zone_name || 'Main Hall'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact & Confirm Reservation Form */}
            {selectedTable && (
              <form onSubmit={handleCreateBooking} className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <div className="rounded-xl bg-indigo-50/80 p-3.5 border border-indigo-100 text-xs text-indigo-900">
                  Selected: <strong>Table {selectedTable.table_number}</strong> ({selectedTable.table_type}, {selectedTable.capacity} Seats, {selectedTable.zone_name})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full Name"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Special Dietary or Seating Requests</label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Window preference, anniversary, high chair..."
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {submittingBooking ? 'Locking Reservation...' : 'Confirm Table Booking'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
