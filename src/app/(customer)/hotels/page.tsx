'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { hotelsApi } from '@/lib/api';
import { Hotel } from '@/types';

const DEFAULT_CITIES = ['Mumbai', 'Goa', 'Delhi', 'Bengaluru', 'Jaipur', 'Hyderabad'];

function formatShortTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = Number(parts[0]);
  const m = parts[1];
  if (Number.isNaN(h)) return timeStr;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
}

function getPrimaryImage(hotel: Hotel): string | null {
  if (!hotel.images || hotel.images.length === 0) return null;
  const primary = hotel.images.find((img) => img.is_primary);
  return (primary || hotel.images[0]).image || null;
}

function HotelsContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || '';
  const initialSearch = searchParams.get('search') || '';

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>(DEFAULT_CITIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialSearch);
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [starRating, setStarRating] = useState<string>('');

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hotelsApi.getHotels({
        status: 'APPROVED',
        is_active: true,
        city: cityFilter || undefined,
        star_rating: starRating ? Number(starRating) : undefined,
        search: search.trim() || undefined,
      });
      const list = Array.isArray(res) ? res : res.results || [];
      setHotels(list);

      // Merge discovered cities into the dropdown options
      const discovered = list
        .map((h) => h.city?.trim())
        .filter((c): c is string => Boolean(c));
      if (discovered.length > 0) {
        setAvailableCities((prev) => Array.from(new Set([...prev, ...discovered])).sort());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch hotels from server.';
      setError(msg);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [search, cityFilter, starRating]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHotels();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchHotels]);

  const hasActiveFilters = Boolean(search.trim() || cityFilter || starRating);

  const clearFilters = () => {
    setSearch('');
    setCityFilter('');
    setStarRating('');
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Curated Hospitality & Fine Dining
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
            Discover Hotels & Dining Venues
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse verified partner hotels, explore on-site specialty restaurants, and book live tables instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            My Reservations
          </Link>
          <Link
            href="/hotel-registration"
            className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
          >
            + List Your Hotel
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Search Hotel, Location or Amenities
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Grand Palace, Rooftop, Pool, Mumbai..."
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Star Rating
            </label>
            <select
              value={starRating}
              onChange={(e) => setStarRating(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">Any Rating</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>
        </div>

        {/* Active filter summary & quick city chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-gray-400 mr-1">Popular:</span>
            {['Mumbai', 'Goa', 'Delhi', 'Bengaluru'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCityFilter(cityFilter === c ? '' : c)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  cityFilter === c
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {!loading && !error && (
              <span>
                Showing <strong className="text-gray-900">{hotels.length}</strong>{' '}
                {hotels.length === 1 ? 'property' : 'properties'}
              </span>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-indigo-600 hover:text-indigo-800 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-rose-800">Could not load hotels</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchHotels}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition self-start sm:self-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Hotel Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-4/5 bg-gray-100 rounded" />
                <div className="pt-3 flex justify-between">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-8 w-28 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !error && hotels.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200 space-y-3">
          <div className="text-3xl">🏨</div>
          <h2 className="text-base font-bold text-gray-900">No matching hotels found</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Try broadening your city, star rating, or search keywords to explore all approved partner properties.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => {
            const coverImg = getPrimaryImage(hotel);
            const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
            const checkIn = formatShortTime(hotel.check_in_time);
            const checkOut = formatShortTime(hotel.check_out_time);

            return (
              <article
                key={hotel.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                {/* Cover Media */}
                <div className="h-48 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 relative flex items-center justify-center text-white overflow-hidden">
                  {coverImg ? (
                    <Image
                      src={coverImg}
                      alt={hotel.name}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold tracking-widest opacity-20 select-none">
                      {hotel.name.slice(0, 3).toUpperCase()}
                    </span>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {hotel.star_rating && hotel.star_rating > 0 && (
                      <span className="rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
                        ★ {hotel.star_rating}
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      Verified
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="rounded-md bg-black/55 backdrop-blur-xs px-2 py-0.5 truncate">
                      📍 {hotel.city}
                      {hotel.state ? `, ${hotel.state}` : ''}
                    </span>
                    {hotel.images && hotel.images.length > 1 && (
                      <span className="rounded-md bg-black/55 px-2 py-0.5 text-[11px]">
                        📷 {hotel.images.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      {hotel.hotel_type || 'Hospitality Property'}
                    </p>
                    <h2 className="mt-0.5 text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition">
                      {hotel.name}
                    </h2>
                    <p className="mt-1.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {hotel.description || 'Fine dining restaurants and verified table reservation service.'}
                    </p>

                    <p className="mt-2 text-xs text-gray-500 truncate">
                      {hotel.address}
                      {hotel.postal_code ? `, ${hotel.postal_code}` : ''}
                    </p>

                    {amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            {amenity}
                          </span>
                        ))}
                        {amenities.length > 3 && (
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                            +{amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-2.5">
                    {(checkIn || checkOut) && (
                      <div className="text-[11px] text-gray-500 flex items-center justify-between">
                        {checkIn && <span>Check-in: {checkIn}</span>}
                        {checkOut && <span>Check-out: {checkOut}</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 truncate">
                        {hotel.phone ? `📞 ${hotel.phone}` : hotel.email}
                      </span>
                      <Link
                        href={`/hotels/${hotel.slug}`}
                        className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                      >
                        View & Book →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function HotelsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-gray-500">
          Loading hotels...
        </div>
      }
    >
      <HotelsContent />
    </Suspense>
  );
}
