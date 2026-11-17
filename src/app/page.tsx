'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { hotelsApi } from '@/lib/api';
import { Hotel } from '@/types';

export default function Home() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHotels() {
      try {
        const res = await hotelsApi.getHotels({ status: 'APPROVED' });
        const list = Array.isArray(res) ? res : res.results || [];
        setHotels(list);
      } catch (err) {
        console.error('Failed to load hotels:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHotels();
  }, []);

  const filteredHotels = searchCity
    ? hotels.filter((h) => h.city.toLowerCase().includes(searchCity.toLowerCase()))
    : hotels;

  return (
    <main className="space-y-16 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
            ✨ Next-Gen Hospitality & AI Operations
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto">
            Reserve Premier Dining Tables with Live AI Availability
          </h1>
          <p className="mt-6 text-lg text-indigo-200 max-w-2xl mx-auto">
            Discover registered luxury hotels, explore fine restaurants, view real-time table statuses,
            and enjoy seamless reservations backed by intelligent computer vision monitoring.
          </p>

          {/* Quick Search Card */}
          <div className="mt-10 mx-auto max-w-3xl rounded-2xl bg-white p-3 shadow-2xl text-left text-gray-900 sm:flex sm:items-center sm:gap-3">
            <div className="flex-1 px-3 py-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                City / Location
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g. Mumbai, Goa..."
                className="w-full text-sm font-medium focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div className="flex-1 px-3 py-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Date & Time
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full text-sm font-medium focus:outline-none text-gray-900"
              />
            </div>
            <div className="mt-2 sm:mt-0">
              <Link
                href={`/hotels${searchCity ? `?city=${encodeURIComponent(searchCity)}` : ''}`}
                className="flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
              >
                Search Tables
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-xl font-bold">
              ⚡
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Decoupled Operational States</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Physical occupancy (Occupied, Awaiting Cleaning) is strictly separated from reservation intervals,
              eliminating booking conflicts and guaranteeing accurate table readiness.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-xl font-bold">
              👁️
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">AI Computer Vision</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Real-time camera observation monitors table occupancy, tracks waiter service response thresholds,
              and verifies table cleanliness before reallocating tables.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xl font-bold">
              🛡️
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Zero Double Bookings</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Half-open reservation intervals <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">[start, end)</code> coupled with database row-level locking
              ensure reliable reservations even under heavy concurrent traffic.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Approved Hotels & Fine Dining
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Browse approved properties verified by platform administrators
            </p>
          </div>
          <Link
            href="/hotels"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all ({hotels.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">No approved hotels match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-sm transition hover:shadow-lg"
              >
                <div className="h-44 bg-gradient-to-r from-slate-800 to-indigo-900 relative flex items-center justify-center text-white">
                  <span className="text-3xl font-bold opacity-30 tracking-wider">
                    {hotel.name.split(' ').map(w => w[0]).join('')}
                  </span>
                  <div className="absolute top-3 right-3 rounded-full bg-emerald-500/90 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
                    Verified
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-md bg-black/40 backdrop-blur px-2 py-1 text-xs text-white">
                    📍 {hotel.city}, {hotel.state}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                      {hotel.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      {hotel.hotel_type}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {hotel.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      📞 {hotel.phone}
                    </span>
                    <Link
                      href={`/hotels/${hotel.slug}`}
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition"
                    >
                      View & Book →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Role Workspaces Navigator */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold">Platform Portals & Workspaces</h2>
            <p className="mt-2 text-sm text-slate-300">
              Each user role has isolated workspaces strictly audited by role permissions and hotel memberships.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/hotels"
              className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 hover:border-indigo-500 transition"
            >
              <div className="text-indigo-400 font-bold text-sm">Customer Portal</div>
              <p className="mt-1 text-xs text-slate-400">Discover hotels, view menus & reserve tables.</p>
            </Link>

            <Link
              href="/hotel-admin"
              className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 hover:border-blue-500 transition"
            >
              <div className="text-blue-400 font-bold text-sm">Hotel Admin</div>
              <p className="mt-1 text-xs text-slate-400">Manage restaurants, tables, staff & AI alerts.</p>
            </Link>

            <Link
              href="/staff"
              className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 hover:border-emerald-500 transition"
            >
              <div className="text-emerald-400 font-bold text-sm">Staff Terminal</div>
              <p className="mt-1 text-xs text-slate-400">Track assigned service requests & cleaning tasks.</p>
            </Link>

            <Link
              href="/super-admin"
              className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 hover:border-purple-500 transition"
            >
              <div className="text-purple-400 font-bold text-sm">Super Admin</div>
              <p className="mt-1 text-xs text-slate-400">Review documents, approve hotels & inspect audit logs.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
