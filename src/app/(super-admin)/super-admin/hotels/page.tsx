'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { hotelsApi } from '@/lib/api';
import { HotelApplication, HotelStatus } from '@/types';

export default function SuperAdminHotelsPage() {
  const [applications, setApplications] = useState<HotelApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await hotelsApi.getAllApplications();
        setApplications(data);
      } catch (err) {
        console.error('Failed to load hotels:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredHotels = applications.filter((app) => {
    const matchesStatus =
      statusFilter === 'ALL' || app.hotel.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.hotel.name.toLowerCase().includes(q) ||
      app.hotel.city.toLowerCase().includes(q) ||
      app.hotel.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: HotelStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            ✓ Live & Listed
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            🔍 Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            ✕ Discrepancy
          </span>
        );
      case 'DRAFT':
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            📝 Draft
          </span>
        );
      case 'PENDING_APPROVAL':
      default:
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            ⏳ Pending
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/80 p-6 sm:p-8 lg:p-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Platform Hotel Registry (FR-014 & FR-015)
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            All Registered Hotels
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete inventory of accredited and onboarding hotels across the GrandTable ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/approvals"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition"
          >
            Go to Approval Queue →
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'APPROVED', 'PENDING_APPROVAL', 'UNDER_REVIEW', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search hotel, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium rounded-xl border border-gray-300 px-3.5 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto" />
          <p className="text-xs text-gray-500 mt-2 font-medium">Loading hotel directory...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
          <p className="text-sm font-bold text-gray-800">No hotels found matching criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((app) => {
            const h = app.hotel;
            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden hover:shadow-md hover:border-purple-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full bg-gray-100">
                    <Image
                      src={
                        h.images[0]?.image ||
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={h.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3">{getStatusBadge(h.status)}</div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                        {h.hotel_type}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-0.5">{h.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📍 {h.city}, {h.state} - {h.country}
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>

                    <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                      <p>✉️ {h.email}</p>
                      <p>📞 {h.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2">
                  {h.status === 'APPROVED' ? (
                    <Link
                      href={`/hotels/${h.slug}`}
                      className="text-xs font-semibold text-purple-700 hover:underline"
                    >
                      View Live Portal ↗
                    </Link>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-medium">
                      Not publicly visible
                    </span>
                  )}

                  <Link
                    href="/super-admin/approvals"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition"
                  >
                    Audit Dossier →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
