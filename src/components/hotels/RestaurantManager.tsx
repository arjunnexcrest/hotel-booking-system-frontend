'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { hotelsApi, restaurantsApi } from '@/lib/api';
import { Restaurant, OperatingHours } from '@/types';

const CUISINE_TYPES = [
  'Modern Indian Fine Dining',
  'Contemporary European & Italian',
  'Pan-Asian & Teppanyaki',
  'Mediterranean & Seafood',
  'French Haute Cuisine',
  'Multi-Cuisine Continental',
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Types ──────────────────────────────────────────────────────────────────

interface HoursFormRow {
  day_of_week: number;
  day_name: string;
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

interface RestaurantFormState {
  name: string;
  cuisine_type: string;
  description: string;
  is_active: boolean;
  operating_hours: HoursFormRow[];
}

function defaultHoursRows(): HoursFormRow[] {
  return DAY_NAMES.map((day, i) => ({
    day_of_week: i,
    day_name: day,
    opening_time: '09:00',
    closing_time: '22:00',
    is_closed: false,
  }));
}

function hoursToFormRows(hours: OperatingHours[]): HoursFormRow[] {
  const defaults = defaultHoursRows();
  return defaults.map((def) => {
    const existing = hours.find((h) => h.day_of_week === def.day_of_week);
    if (existing) {
      return {
        day_of_week: existing.day_of_week,
        day_name: existing.day_name || def.day_name,
        opening_time: existing.opening_time,
        closing_time: existing.closing_time,
        is_closed: existing.is_closed,
      };
    }
    return def;
  });
}

function restaurantToForm(r: Restaurant): RestaurantFormState {
  return {
    name: r.name,
    cuisine_type: r.cuisine_type,
    description: r.description,
    is_active: r.is_active,
    operating_hours: hoursToFormRows(r.operating_hours),
  };
}

function emptyForm(): RestaurantFormState {
  return {
    name: '',
    cuisine_type: CUISINE_TYPES[0],
    description: '',
    is_active: true,
    operating_hours: defaultHoursRows(),
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-5 w-48 bg-slate-200 rounded mb-3" />
          <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
          <div className="h-4 w-full bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

interface HoursEditorProps {
  rows: HoursFormRow[];
  onChange: (rows: HoursFormRow[]) => void;
}

function HoursEditor({ rows, onChange }: HoursEditorProps) {
  function update(index: number, patch: Partial<HoursFormRow>) {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
  }
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 mb-1">Operating Hours</label>
      {rows.map((row, i) => (
        <div key={row.day_of_week} className="flex items-center gap-2 text-sm">
          <span className="w-24 text-gray-700 font-medium">{row.day_name}</span>
          <input
            type="time"
            value={row.opening_time}
            disabled={row.is_closed}
            onChange={(e) => update(i, { opening_time: e.target.value })}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm disabled:bg-slate-100"
          />
          <span className="text-gray-400">–</span>
          <input
            type="time"
            value={row.closing_time}
            disabled={row.is_closed}
            onChange={(e) => update(i, { closing_time: e.target.value })}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm disabled:bg-slate-100"
          />
          <label className="flex items-center gap-1 text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={row.is_closed}
              onChange={(e) => update(i, { is_closed: e.target.checked })}
              className="accent-rose-500"
            />
            Closed
          </label>
        </div>
      ))}
    </div>
  );
}

interface RestaurantFormProps {
  initial: RestaurantFormState;
  onSave: (form: RestaurantFormState) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  title: string;
}

function RestaurantForm({ initial, onSave, onCancel, saving, title }: RestaurantFormProps) {
  const [form, setForm] = useState<RestaurantFormState>(initial);

  function set<K extends keyof RestaurantFormState>(key: K, value: RestaurantFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">{title}</h2>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Azure Terrace"
            />
          </div>
          {/* Cuisine */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine Type</label>
            <select
              value={form.cuisine_type}
              onChange={(e) => set('cuisine_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CUISINE_TYPES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe your restaurant…"
            />
          </div>
          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Active</label>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-gray-500">{form.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          {/* Operating Hours */}
          <HoursEditor rows={form.operating_hours} onChange={(rows) => set('operating_hours', rows)} />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex-1 bg-indigo-600 text-white rounded-xl py-2 font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 bg-slate-100 text-gray-700 rounded-xl py-2 font-semibold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

function RestaurantCard({ restaurant, onEdit, onToggleActive, onDelete }: RestaurantCardProps) {
  const openDays = restaurant.operating_hours.filter((h) => !h.is_closed);
  const hoursSummary = openDays.length === 0
    ? 'No hours set'
    : openDays.length === 7
    ? `Daily ${openDays[0]?.opening_time ?? ''} – ${openDays[0]?.closing_time ?? ''}`
    : `${openDays.length} day${openDays.length !== 1 ? 's' : ''} open`;

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">{restaurant.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${restaurant.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {restaurant.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-indigo-600 font-medium mb-2">{restaurant.cuisine_type}</p>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{restaurant.description}</p>
          <p className="text-xs text-gray-400">🕐 {hoursSummary}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={onEdit}
          className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition"
        >
          Edit
        </button>
        <button
          onClick={onToggleActive}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${restaurant.is_active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
        >
          {restaurant.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RestaurantManager() {
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const fetchRestaurants = useCallback(async (hId: number) => {
    try {
      const raw = await restaurantsApi.getRestaurantsByHotel(hId, false);
      const list = Array.isArray(raw) ? raw : (raw as { results: Restaurant[] }).results || [];
      setRestaurants(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let hId: number | null = null;
        try {
          const myHotelsRaw = await hotelsApi.getMyHotels();
          const myHotels = Array.isArray(myHotelsRaw) ? myHotelsRaw : myHotelsRaw.results || [];
          if (myHotels.length > 0) hId = myHotels[0].id;
        } catch {
          // fallback below
        }
        if (hId === null) {
          const application = await hotelsApi.getMyApplication();
          if (!application) {
            setError('No hotel application found. Please register your hotel first.');
            return;
          }
          hId = application.hotel.id;
        }
        setHotelId(hId);
        await fetchRestaurants(hId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load hotel info');
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchRestaurants]);

  async function handleSave(form: RestaurantFormState) {
    if (!hotelId) return;
    setSaving(true);
    try {
      const payload = {
        hotel: hotelId,
        name: form.name,
        cuisine_type: form.cuisine_type,
        description: form.description,
        is_active: form.is_active,
      };

      let savedRestaurant: Restaurant;
      if (editingRestaurant) {
        savedRestaurant = await restaurantsApi.updateRestaurant(editingRestaurant.id, payload);
        showToast('Restaurant updated successfully.');
      } else {
        savedRestaurant = await restaurantsApi.createRestaurant(payload);
        showToast('Restaurant created successfully.');
      }

      // Persist weekly operating schedule via dedicated bulk endpoint (0=Monday..6=Sunday)
      if (form.operating_hours.length > 0) {
        await restaurantsApi.bulkOperatingHours(
          savedRestaurant.id,
          form.operating_hours.map((row) => ({
            day_of_week: row.day_of_week,
            opening_time: row.opening_time.length === 5 ? `${row.opening_time}:00` : row.opening_time,
            closing_time: row.closing_time.length === 5 ? `${row.closing_time}:00` : row.closing_time,
            is_closed: row.is_closed,
          }))
        );
      }

      setShowForm(false);
      setEditingRestaurant(null);
      await fetchRestaurants(hotelId);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(r: Restaurant) {
    if (!hotelId) return;
    try {
      await restaurantsApi.updateRestaurant(r.id, { is_active: !r.is_active });
      showToast(`Restaurant ${r.is_active ? 'deactivated' : 'activated'}.`);
      await fetchRestaurants(hotelId);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Update failed.');
    }
  }

  async function handleDelete(id: number) {
    if (!hotelId) return;
    try {
      await restaurantsApi.deleteRestaurant(id);
      showToast('Restaurant deleted.');
      setDeletingId(null);
      await fetchRestaurants(hotelId);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed.');
      setDeletingId(null);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Restaurant Management</h1>
            <p className="text-sm text-gray-500 mt-1">Create, edit, and manage your hotel&apos;s restaurants.</p>
          </div>
          <button
            onClick={() => { setEditingRestaurant(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Add New Restaurant
          </button>
        </div>

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center shadow-sm">
            <p className="text-gray-400 text-lg mb-2">No restaurants yet.</p>
            <p className="text-gray-500 text-sm">Click &quot;Add New Restaurant&quot; to get started.</p>
          </div>
        )}

        {/* List */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="space-y-4">
            {restaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onEdit={() => { setEditingRestaurant(r); setShowForm(true); }}
                onToggleActive={() => handleToggleActive(r)}
                onDelete={() => setDeletingId(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <RestaurantForm
          key={editingRestaurant?.id ?? 'new'}
          title={editingRestaurant ? `Edit — ${editingRestaurant.name}` : 'Add New Restaurant'}
          initial={editingRestaurant ? restaurantToForm(editingRestaurant) : emptyForm()}
          saving={saving}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingRestaurant(null); }}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Restaurant?</h3>
            <p className="text-sm text-gray-600 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 bg-rose-600 text-white rounded-xl py-2 font-semibold hover:bg-rose-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-slate-100 text-gray-700 rounded-xl py-2 font-semibold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </main>
  );
}
