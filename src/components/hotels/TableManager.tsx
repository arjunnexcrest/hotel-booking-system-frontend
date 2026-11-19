'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, restaurantsApi, hotelsApi } from '@/lib/api';
import {
  RestaurantTable,
  Restaurant,
  TableOperationalStatus,
  TableType,
} from '@/types';

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<TableOperationalStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  AWAITING_CLEANING: 'bg-amber-100 text-amber-800',
  CLEANING_IN_PROGRESS: 'bg-amber-100 text-amber-800',
  SERVICE_REQUIRED: 'bg-orange-100 text-orange-800',
  MAINTENANCE: 'bg-gray-100 text-gray-700',
  TEMPORARILY_BLOCKED: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<TableOperationalStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  AWAITING_CLEANING: 'Awaiting Cleaning',
  CLEANING_IN_PROGRESS: 'Cleaning',
  SERVICE_REQUIRED: 'Service Required',
  MAINTENANCE: 'Maintenance',
  TEMPORARILY_BLOCKED: 'Blocked',
};

const ALL_STATUSES: TableOperationalStatus[] = [
  'AVAILABLE',
  'OCCUPIED',
  'AWAITING_CLEANING',
  'CLEANING_IN_PROGRESS',
  'SERVICE_REQUIRED',
  'MAINTENANCE',
  'TEMPORARILY_BLOCKED',
];

const ALL_TABLE_TYPES: TableType[] = ['STANDARD', 'BOOTH', 'OUTDOOR', 'VIP', 'BAR'];

// ── Form shape ────────────────────────────────────────────────────────────────

interface TableForm {
  table_number: string;
  capacity: number;
  min_capacity: number;
  table_type: TableType;
  zone_name: string;
  description: string;
  operational_status: TableOperationalStatus;
  is_active: boolean;
}

const EMPTY_FORM: TableForm = {
  table_number: '',
  capacity: 2,
  min_capacity: 1,
  table_type: 'STANDARD',
  zone_name: '',
  description: '',
  operational_status: 'AVAILABLE',
  is_active: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TableManager() {
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [filterStatus, setFilterStatus] = useState<TableOperationalStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TableType | 'ALL'>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [form, setForm] = useState<TableForm>(EMPTY_FORM);

  // ── Toasts ──────────────────────────────────────────────────────────────────

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Data fetching ───────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const app = await hotelsApi.getMyApplication();
        if (!app) { setError('No hotel application found.'); setLoading(false); return; }
        const hid = app.hotel.id;
        setHotelId(hid);
        const raw = await restaurantsApi.getRestaurantsByHotel(hid);
        const list: Restaurant[] = Array.isArray(raw) ? raw : (raw as { results: Restaurant[] }).results;
        setRestaurants(list);
        if (list.length > 0) setSelectedRestaurantId(list[0].id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load restaurants.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchTables = useCallback(async (restaurantId: number) => {
    setTableLoading(true);
    try {
      const data = await apiClient<RestaurantTable[]>(
        `/restaurants/tables/?restaurant=${restaurantId}`
      );
      setTables(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load tables.', false);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRestaurantId !== null) fetchTables(selectedRestaurantId);
  }, [selectedRestaurantId, fetchTables]);

  // ── Filtered tables ─────────────────────────────────────────────────────────

  const filtered = tables.filter((t) => {
    if (filterStatus !== 'ALL' && t.operational_status !== filterStatus) return false;
    if (filterType !== 'ALL' && t.table_type !== filterType) return false;
    return true;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.operational_status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.operational_status === 'OCCUPIED').length,
    maintenance: tables.filter(
      (t) => t.operational_status === 'MAINTENANCE' || t.operational_status === 'TEMPORARILY_BLOCKED'
    ).length,
  };

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingTable(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t: RestaurantTable) => {
    setEditingTable(t);
    setForm({
      table_number: t.table_number,
      capacity: t.capacity,
      min_capacity: t.min_capacity,
      table_type: t.table_type,
      zone_name: t.zone_name,
      description: t.description,
      operational_status: t.operational_status,
      is_active: t.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingTable(null); };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedRestaurantId) return;
    setSaving(true);
    try {
      const body = JSON.stringify({ ...form, restaurant: selectedRestaurantId });
      if (editingTable) {
        const updated = await apiClient<RestaurantTable>(
          `/restaurants/tables/${editingTable.id}/`,
          { method: 'PATCH', body }
        );
        setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        showToast('Table updated.');
      } else {
        const created = await apiClient<RestaurantTable>('/restaurants/tables/', {
          method: 'POST',
          body,
        });
        setTables((prev) => [...prev, created]);
        showToast('Table created.');
      }
      closeModal();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed.', false);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this table?')) return;
    try {
      await apiClient(`/restaurants/tables/${id}/`, { method: 'DELETE' });
      setTables((prev) => prev.filter((t) => t.id !== id));
      showToast('Table deleted.');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed.', false);
    }
  };

  // ── Toggle active ───────────────────────────────────────────────────────────

  const handleToggleActive = async (t: RestaurantTable) => {
    try {
      const updated = await apiClient<RestaurantTable>(
        `/restaurants/tables/${t.id}/`,
        { method: 'PATCH', body: JSON.stringify({ is_active: !t.is_active }) }
      );
      setTables((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Update failed.', false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 font-medium">{error}</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.ok ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage restaurant tables and their status</p>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedRestaurantId}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          + Add Table
        </button>
      </div>

      {/* Restaurant selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Restaurant:</label>
        <select
          value={selectedRestaurantId ?? ''}
          onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tables', value: stats.total, color: 'text-gray-800' },
          { label: 'Available', value: stats.available, color: 'text-green-700' },
          { label: 'Occupied', value: stats.occupied, color: 'text-red-700' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-gray-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status:</span>
        {(['ALL', ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              filterStatus === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
            }`}
          >
            {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-2">Type:</span>
        {(['ALL', ...ALL_TABLE_TYPES] as const).map((tp) => (
          <button
            key={tp}
            onClick={() => setFilterType(tp)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              filterType === tp
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
            }`}
          >
            {tp === 'ALL' ? 'All' : tp}
          </button>
        ))}
      </div>

      {/* Table grid */}
      {tableLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {tables.length === 0
              ? 'No tables yet. Add your first table.'
              : 'No tables match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">#{t.table_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.zone_name}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                    STATUS_COLORS[t.operational_status]
                  }`}
                >
                  {STATUS_LABELS[t.operational_status]}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {t.table_type}
                </span>
                <span className="bg-slate-50 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                  {t.min_capacity}–{t.capacity} guests
                </span>
              </div>

              {t.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                {/* Active toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span
                    onClick={() => handleToggleActive(t)}
                    className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                      t.is_active ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        t.is_active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </span>
                  <span className="text-xs text-gray-500">{t.is_active ? 'Active' : 'Inactive'}</span>
                </label>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(t)}
                    className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* table_number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Table Number *</label>
                <input
                  type="text"
                  value={form.table_number}
                  onChange={(e) => setForm((f) => ({ ...f, table_number: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. T-01"
                />
              </div>

              {/* capacity row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={form.min_capacity}
                    onChange={(e) => setForm((f) => ({ ...f, min_capacity: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* table_type */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Table Type</label>
                <select
                  value={form.table_type}
                  onChange={(e) => setForm((f) => ({ ...f, table_type: e.target.value as TableType }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ALL_TABLE_TYPES.map((tp) => (
                    <option key={tp} value={tp}>{tp}</option>
                  ))}
                </select>
              </div>

              {/* zone_name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={form.zone_name}
                  onChange={(e) => setForm((f) => ({ ...f, zone_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Main Hall"
                />
              </div>

              {/* description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* operational_status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Operational Status</label>
                <select
                  value={form.operational_status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, operational_status: e.target.value as TableOperationalStatus }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* is_active */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm text-gray-700 font-medium">Active</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.table_number}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition"
              >
                {saving ? 'Saving…' : editingTable ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
