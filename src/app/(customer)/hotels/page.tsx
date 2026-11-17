'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { hotelsApi } from '@/lib/api';
import { Hotel } from '@/types';

function HotelsContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || '';

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState(initialCity);

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true);
      try {
        const res = await hotelsApi.getHotels({
          status: 'APPROVED',
          city: cityFilter || undefined,
          search: search || undefined,
        });
        const list = Array.isArray(res) ? res : res.results || [];
        setHotels(list);
      } catch (err) {
        console.error('Error fetching hotels:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchHotels();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, cityFilter]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Discover Hotels & Fine Dining
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Explore approved hotels, browse specialty dining venues, and check live table availability
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Search Hotel or Cuisine
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Grand Azure, Heritage, Mughlai..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-60">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Filter by City
          </label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Goa">Goa</option>
            <option value="Delhi">Delhi</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-sm">No hotels found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition hover:shadow-md"
            >
              <div className="h-44 bg-gradient-to-r from-slate-900 to-indigo-950 relative flex items-center justify-center text-white">
                <span className="text-4xl font-extrabold opacity-25">
                  {hotel.name.slice(0, 3).toUpperCase()}
                </span>
                <div className="absolute top-3 right-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {hotel.status}
                </div>
                <div className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                  📍 {hotel.city}, {hotel.state}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                    {hotel.hotel_type}
                  </p>
                  <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                    {hotel.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {hotel.address}, {hotel.postal_code}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">📞 {hotel.phone}</span>
                  <Link
                    href={`/hotels/${hotel.slug}`}
                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    View Restaurants →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading hotels...</div>}>
      <HotelsContent />
    </Suspense>
  );
}
