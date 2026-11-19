'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { hotelsApi, restaurantsApi } from '@/lib/api';
import { Hotel, Restaurant, Booking, OperatingHours } from '@/types';
import TableAvailabilityPicker from '@/components/booking/TableAvailabilityPicker';

function formatTime12(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = Number(parts[0]);
  const m = parts[1];
  if (Number.isNaN(h)) return timeStr;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
}

function getTodayOperatingSummary(hours: OperatingHours[]): string {
  if (!hours || hours.length === 0) return 'Hours available on request';
  // JS getDay(): 0=Sun..6=Sat -> Django day_of_week: 0=Mon..6=Sun
  const jsDay = new Date().getDay();
  const djangoDay = jsDay === 0 ? 6 : jsDay - 1;
  const todayRow = hours.find((h) => h.day_of_week === djangoDay);
  if (!todayRow) {
    const firstOpen = hours.find((h) => !h.is_closed);
    if (!firstOpen) return 'Temporarily Closed';
    return `${formatTime12(firstOpen.opening_time)} – ${formatTime12(firstOpen.closing_time)}`;
  }
  if (todayRow.is_closed) return 'Closed today';
  return `Today: ${formatTime12(todayRow.opening_time)} – ${formatTime12(todayRow.closing_time)}`;
}

export default function HotelDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [expandedHoursId, setExpandedHoursId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchHotelAndRestaurants() {
      if (!slug) return;
      setLoading(true);
      setError('');
      try {
        const hotelData = await hotelsApi.getHotelBySlug(slug);
        if (!active) return;
        setHotel(hotelData);

        if (hotelData.images && hotelData.images.length > 0) {
          const primary = hotelData.images.find((i) => i.is_primary) || hotelData.images[0];
          setActiveImageUrl(primary.image);
        }

        let restList: Restaurant[] = [];
        try {
          const restRes = await hotelsApi.getHotelRestaurants(slug);
          restList = Array.isArray(restRes) ? restRes : restRes.results || [];
        } catch {
          const fallbackRes = await restaurantsApi.getRestaurantsByHotel(hotelData.id);
          restList = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes.results || [];
        }

        if (!active) return;
        setRestaurants(restList);
        if (restList.length > 0) {
          setSelectedRestaurant(restList[0]);
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Failed to load hotel information.';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchHotelAndRestaurants();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-72 bg-gray-100 rounded-2xl" />
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !hotel) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="text-4xl">🏨</div>
        <h2 className="text-xl font-bold text-gray-900">Hotel Not Found</h2>
        <p className="text-sm text-gray-500">
          {error || 'Could not find the requested hospitality property.'}
        </p>
        <Link
          href="/hotels"
          className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
        >
          ← Back to All Hotels
        </Link>
      </main>
    );
  }

  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Link href="/hotels" className="font-semibold text-indigo-600 hover:text-indigo-800">
            ← All Hotels
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{hotel.name}</span>
        </div>
        <Link href="/bookings" className="font-semibold text-gray-600 hover:text-indigo-600">
          My Reservations →
        </Link>
      </div>

      {/* Hotel Hero & Gallery */}
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          {activeImageUrl && (
            <div className="absolute inset-0 opacity-30">
              <Image
                src={activeImageUrl}
                alt={hotel.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-400/30">
                  ✓ Verified {hotel.status_display || hotel.status}
                </span>
                {hotel.star_rating && hotel.star_rating > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-950">
                    ★ {hotel.star_rating}-Star Property
                  </span>
                )}
                {hotel.hotel_type && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-indigo-100">
                    {hotel.hotel_type}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {hotel.name}
              </h1>

              <p className="text-sm text-indigo-100">
                📍 {hotel.address}, {hotel.city}
                {hotel.state ? `, ${hotel.state}` : ''}{' '}
                {hotel.postal_code}
                {hotel.country ? `, ${hotel.country}` : ''}
              </p>

              <p className="text-sm text-slate-200 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <div className="bg-black/35 backdrop-blur-md rounded-2xl p-4 text-xs space-y-1.5 border border-white/15 shrink-0 min-w-[230px]">
              {hotel.phone && (
                <div>
                  <strong className="text-white">Phone:</strong>{' '}
                  <span className="text-slate-200">{hotel.phone}</span>
                </div>
              )}
              {hotel.email && (
                <div>
                  <strong className="text-white">Email:</strong>{' '}
                  <span className="text-slate-200">{hotel.email}</span>
                </div>
              )}
              {hotel.check_in_time && (
                <div>
                  <strong className="text-white">Check-in:</strong>{' '}
                  <span className="text-slate-200">{formatTime12(hotel.check_in_time)}</span>
                </div>
              )}
              {hotel.check_out_time && (
                <div>
                  <strong className="text-white">Check-out:</strong>{' '}
                  <span className="text-slate-200">{formatTime12(hotel.check_out_time)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery thumbnails + Amenities Strip */}
        {(hotel.images?.length > 0 || amenities.length > 0) && (
          <div className="p-5 sm:p-6 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {hotel.images && hotel.images.length > 0 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {hotel.images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageUrl(img.image)}
                    className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                      activeImageUrl === img.image
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.image}
                      alt={img.caption || hotel.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {amenities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                  Amenities:
                </span>
                {amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Instant Booking Confirmation Banner */}
      {confirmedBooking && (
        <section className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xl shrink-0">
                ✓
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Reservation Confirmed!</h2>
                <p className="text-xs text-emerald-800">
                  Your table reservation has been locked and confirmed with {hotel.name}.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white self-start sm:self-auto">
              {confirmedBooking.booking_status_display || confirmedBooking.booking_status}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
            <div>
              <span className="text-gray-500 block">Reference No</span>
              <strong className="font-mono text-sm text-indigo-700">
                {confirmedBooking.booking_reference}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Date &amp; Time</span>
              <strong>
                {confirmedBooking.booking_date} ({confirmedBooking.start_time.slice(0, 5)} –{' '}
                {confirmedBooking.end_time.slice(0, 5)})
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Party Size</span>
              <strong>{confirmedBooking.guest_count} Guests</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Assigned Table</span>
              <strong>
                Table {confirmedBooking.table_number || confirmedBooking.table}
                {confirmedBooking.table_zone ? ` (${confirmedBooking.table_zone})` : ''}
              </strong>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/bookings/${confirmedBooking.id}`}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition"
            >
              View Booking Voucher →
            </Link>
            <Link
              href="/bookings"
              className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition"
            >
              All My Reservations
            </Link>
            <button
              type="button"
              onClick={() => setConfirmedBooking(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-emerald-800 hover:underline"
            >
              Book Another Table
            </button>
          </div>
        </section>
      )}

      {/* Main Content: Restaurants Sidebar + Real-time Availability Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Dining Facilities */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Dining Venues ({restaurants.length})
            </h2>
          </div>

          {restaurants.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-gray-200 text-sm text-gray-500 text-center">
              No active dining venues are currently listed for this hotel.
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.map((rest) => {
                const isSelected = selectedRestaurant?.id === rest.id;
                const hoursExpanded = expandedHoursId === rest.id;

                return (
                  <div
                    key={rest.id}
                    className={`rounded-2xl border transition overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRestaurant(rest);
                        setConfirmedBooking(null);
                      }}
                      className="w-full text-left p-5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{rest.name}</h3>
                        {rest.price_tier_display || rest.price_tier ? (
                          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                            {rest.price_tier_display || rest.price_tier}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
                          {rest.cuisine_type || 'Fine Dining'}
                        </span>
                        {(rest.dress_code_display || rest.dress_code) && (
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            {rest.dress_code_display || rest.dress_code}
                          </span>
                        )}
                        {typeof rest.table_count === 'number' && (
                          <span className="text-[11px] text-gray-500">
                            • {rest.table_count} tables
                          </span>
                        )}
                      </div>

                      {rest.description && (
                        <p className="mt-2.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {rest.description}
                        </p>
                      )}

                      <div className="mt-3 text-[11px] font-medium text-gray-600">
                        ⏰ {getTodayOperatingSummary(rest.operating_hours || [])}
                      </div>
                    </button>

                    {/* Expandable full weekly schedule */}
                    {rest.operating_hours && rest.operating_hours.length > 0 && (
                      <div className="px-5 pb-3 pt-1 border-t border-gray-100/80">
                        <button
                          type="button"
                          onClick={() => setExpandedHoursId(hoursExpanded ? null : rest.id)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          {hoursExpanded ? 'Hide weekly hours ▲' : 'View weekly hours ▼'}
                        </button>

                        {hoursExpanded && (
                          <ul className="mt-2 space-y-1 text-[11px] text-gray-600">
                            {rest.operating_hours
                              .slice()
                              .sort((a, b) => a.day_of_week - b.day_of_week)
                              .map((h) => (
                                <li
                                  key={h.id ?? h.day_of_week}
                                  className="flex items-center justify-between"
                                >
                                  <span className="font-medium text-gray-700">{h.day_name}</span>
                                  <span>
                                    {h.is_closed
                                      ? 'Closed'
                                      : `${formatTime12(h.opening_time)} – ${formatTime12(
                                          h.closing_time
                                        )}`}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right Workspace: Interactive Table Availability & Booking */}
        <section className="lg:col-span-8">
          {selectedRestaurant ? (
            <TableAvailabilityPicker
              hotel={hotel}
              restaurant={selectedRestaurant}
              onBookingConfirmed={(booking) => {
                setConfirmedBooking(booking);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Select a dining venue on the left to view live table availability and book a table.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
