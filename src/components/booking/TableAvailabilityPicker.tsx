'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { bookingsApi, restaurantsApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import {
  Hotel,
  Restaurant,
  RestaurantTable,
  AvailableSlot,
  FloorPlanResponse,
  FloorPlanTable,
  RestaurantStats,
  RestaurantOpenStatus,
  Booking,
} from '@/types';

interface TableAvailabilityPickerProps {
  hotel: Hotel;
  restaurant: Restaurant;
  onBookingConfirmed: (booking: Booking) => void;
}

const DURATIONS = [
  { label: '1 Hour', minutes: 60 },
  { label: '1.5 Hours', minutes: 90 },
  { label: '2 Hours', minutes: 120 },
];

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function shapeBadge(shape?: string): string {
  switch (shape) {
    case 'ROUND':
      return 'rounded-full';
    case 'OVAL':
      return 'rounded-2xl';
    case 'SQUARE':
      return 'rounded-lg';
    default:
      return 'rounded-xl';
  }
}

export default function TableAvailabilityPicker({
  hotel,
  restaurant,
  onBookingConfirmed,
}: TableAvailabilityPickerProps) {
  // Live venue context
  const [floorPlan, setFloorPlan] = useState<FloorPlanResponse | null>(null);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [openStatus, setOpenStatus] = useState<RestaurantOpenStatus | null>(null);

  // Step 1: Search parameters
  const [mode, setMode] = useState<'slots' | 'custom'>('slots');
  const [bookingDate, setBookingDate] = useState<string>(getTomorrowDate);
  const [guests, setGuests] = useState<number>(2);
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [zoneFilter, setZoneFilter] = useState<string>('');

  // Custom time window
  const [startTime, setStartTime] = useState<string>('19:00');
  const [endTime, setEndTime] = useState<string>('20:30');

  // Available slots state
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Step 2: Available tables state
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [checkingTables, setCheckingTables] = useState<boolean>(false);
  const [tablesChecked, setTablesChecked] = useState<boolean>(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'zones' | 'cards'>('zones');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [autoAssignTable, setAutoAssignTable] = useState<boolean>(false);

  // Step 3: Guest details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Pre-fill logged-in user contact details
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      const fullName = user.first_name
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : user.username;
      setCustomerName(fullName);
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone_number || '');
    }
  }, []);

  // Load restaurant floor plan, stats & open status whenever restaurant changes
  useEffect(() => {
    let active = true;
    setSelectedSlot(null);
    setAvailableTables([]);
    setTablesChecked(false);
    setSelectedTable(null);
    setAutoAssignTable(false);
    setZoneFilter('');
    setBookingError(null);

    async function loadVenueMeta() {
      const [fpRes, statsRes, openRes] = await Promise.allSettled([
        restaurantsApi.getFloorPlan(restaurant.id),
        restaurantsApi.getStats(restaurant.id),
        restaurantsApi.isOpen(restaurant.id),
      ]);

      if (!active) return;
      setFloorPlan(fpRes.status === 'fulfilled' ? fpRes.value : null);
      setStats(statsRes.status === 'fulfilled' ? statsRes.value : null);
      setOpenStatus(openRes.status === 'fulfilled' ? openRes.value : null);
    }

    loadVenueMeta();
    return () => {
      active = false;
    };
  }, [restaurant.id]);

  // Fetch 30-min available slots whenever date/guests/duration/restaurant changes in slot mode
  const loadAvailableSlots = useCallback(async () => {
    if (!bookingDate || guests < 1) return;
    setLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);
    setAvailableTables([]);
    setTablesChecked(false);
    setSelectedTable(null);
    setAutoAssignTable(false);

    try {
      const res = await bookingsApi.getAvailableSlots({
        restaurant: restaurant.id,
        date: bookingDate,
        guests,
        duration_minutes: durationMinutes,
      });
      setSlots(res.slots || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load available time slots.';
      setSlotsError(msg);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [restaurant.id, bookingDate, guests, durationMinutes]);

  useEffect(() => {
    if (mode === 'slots') {
      loadAvailableSlots();
    }
  }, [mode, loadAvailableSlots]);

  // Fetch matching tables for a concrete time window
  const runTableCheck = useCallback(
    async (winStart: string, winEnd: string, zone?: string) => {
      setCheckingTables(true);
      setTablesError(null);
      setSelectedTable(null);
      setAutoAssignTable(false);
      setBookingError(null);

      try {
        const res = await bookingsApi.checkAvailability({
          restaurant: restaurant.id,
          date: bookingDate,
          start_time: winStart,
          end_time: winEnd,
          guests,
          zone: zone || undefined,
        });
        setAvailableTables(res.tables || []);
        setTablesChecked(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error checking table availability.';
        setTablesError(msg);
        setAvailableTables([]);
        setTablesChecked(true);
      } finally {
        setCheckingTables(false);
      }
    },
    [restaurant.id, bookingDate, guests]
  );

  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStartTime(slot.time.slice(0, 5));
    setEndTime(slot.end_time.slice(0, 5));
    runTableCheck(slot.time.slice(0, 5), slot.end_time.slice(0, 5), zoneFilter);
  };

  const handleCustomCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      setTablesError('End time must be after start time.');
      return;
    }
    setSelectedSlot(null);
    runTableCheck(startTime, endTime, zoneFilter);
  };

  const handleZoneChange = (newZone: string) => {
    setZoneFilter(newZone);
    if (tablesChecked) {
      runTableCheck(startTime, endTime, newZone);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable && !autoAssignTable) return;

    setSubmitting(true);
    setBookingError(null);
    try {
      const booking = await bookingsApi.createBooking({
        hotel: hotel.id,
        restaurant: restaurant.id,
        table: autoAssignTable ? null : selectedTable?.id,
        zone_name: autoAssignTable && zoneFilter ? zoneFilter : undefined,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        guest_count: Number(guests),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        special_requests: specialRequests.trim() || undefined,
      });

      onBookingConfirmed(booking);
      setSelectedTable(null);
      setAutoAssignTable(false);
      setAvailableTables([]);
      setTablesChecked(false);
      setSelectedSlot(null);
      setSpecialRequests('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create reservation.';
      setBookingError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const zoneNames = floorPlan ? Object.keys(floorPlan.zones) : [];
  const availableTableIdSet = new Set(availableTables.map((t) => t.id));
  const availableTableMap = new Map(availableTables.map((t) => [t.id, t]));

  const filteredFloorZones = floorPlan
    ? Object.entries(floorPlan.zones).filter(
        ([zName]) => !zoneFilter || zName.toLowerCase() === zoneFilter.toLowerCase()
      )
    : [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      {/* Venue Live Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">
              Reserve at {restaurant.name}
            </h2>
            {openStatus && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  openStatus.is_open
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    openStatus.is_open ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {openStatus.is_open ? 'Open Now' : 'Currently Closed'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Live table availability synced with active reservations and dining floor status.
          </p>
        </div>

        {/* Live Floor Counters */}
        {stats && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs shrink-0">
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                Tables
              </span>
              <strong className="text-gray-900">{stats.total_tables}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                Ready Now
              </span>
              <strong className="text-emerald-600">{stats.available}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                Seats
              </span>
              <strong className="text-indigo-700">{stats.total_capacity}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('slots')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              mode === 'slots'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Smart Time Slots
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              mode === 'custom'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Custom Time Window
          </button>
        </div>

        {zoneNames.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="zone-select" className="font-semibold text-gray-500">
              Zone:
            </label>
            <select
              id="zone-select"
              value={zoneFilter}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Zones</option>
              {zoneNames.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Step 1: Date / Guests / Duration or Custom Window */}
      {mode === 'slots' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dining Date
              </label>
              <input
                type="date"
                min={getTodayDate()}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Party Size (Guests)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              >
                {DURATIONS.map((d) => (
                  <option key={d.minutes} value={d.minutes}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 30-Minute Slots Grid */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                1. Pick an Available Time Slot
              </h3>
              <button
                type="button"
                onClick={loadAvailableSlots}
                disabled={loadingSlots}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                {loadingSlots ? 'Refreshing...' : '↻ Refresh slots'}
              </button>
            </div>

            {loadingSlots ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <div key={n} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : slotsError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 flex items-center justify-between gap-2">
                <span>{slotsError}</span>
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className="font-semibold underline shrink-0"
                >
                  Use custom time
                </button>
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 text-xs text-gray-600 text-center">
                No open 30-minute slots found for {bookingDate} ({guests} guests). Try another date, smaller party size, or switch to Custom Time Window.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => handleSelectSlot(slot)}
                      className={`relative rounded-xl border px-2.5 py-2 text-left transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                          : 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold">{slot.time_display}</span>
                        {slot.is_peak && (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Peak
                          </span>
                        )}
                      </div>
                      <span
                        className={`block text-[10px] mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-emerald-700 font-medium'
                        }`}
                      >
                        {slot.available_tables}{' '}
                        {slot.available_tables === 1 ? 'table' : 'tables'} left
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCustomCheck} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Date
            </label>
            <input
              type="date"
              required
              min={getTodayDate()}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
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
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
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
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
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
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={checkingTables}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {checkingTables ? 'Checking Live Tables...' : 'Check Available Tables'}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Available Tables & Floor Zones */}
      {(checkingTables || tablesChecked) && (
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                2. Select Your Table — {bookingDate} ({startTime} – {endTime})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {checkingTables
                  ? 'Verifying live occupancy and reservation locks...'
                  : `${availableTables.length} available table(s) for ${guests} guest(s)${
                      zoneFilter ? ` in ${zoneFilter}` : ''
                    }.`}
              </p>
            </div>

            {!checkingTables && availableTables.length > 0 && (
              <div className="flex items-center gap-2">
                {filteredFloorZones.length > 0 && (
                  <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode('zones')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'zones'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-gray-600'
                      }`}
                    >
                      Floor Zones
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'cards'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-gray-600'
                      }`}
                    >
                      List View
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAutoAssignTable(true);
                    setSelectedTable(null);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
                    autoAssignTable
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  ✨ Best Available
                </button>
              </div>
            )}
          </div>

          {tablesError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              {tablesError}
            </div>
          )}

          {checkingTables ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : availableTables.length === 0 && !tablesError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              No tables are available for this exact time window and party size. Please select another time slot or zone.
            </div>
          ) : viewMode === 'zones' && filteredFloorZones.length > 0 ? (
            <div className="space-y-4">
              {filteredFloorZones.map(([zName, zoneTables]) => {
                const availInZone = zoneTables.filter((zt) => availableTableIdSet.has(zt.id));
                return (
                  <div
                    key={zName}
                    className="rounded-xl border border-gray-200 bg-slate-50/70 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        {zName}
                      </h4>
                      <span className="text-[11px] font-medium text-emerald-700">
                        {availInZone.length} of {zoneTables.length} bookable
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {zoneTables.map((zt: FloorPlanTable) => {
                        const fullTable = availableTableMap.get(zt.id);
                        const isBookable = Boolean(fullTable);
                        const isPicked = selectedTable?.id === zt.id && !autoAssignTable;

                        return (
                          <button
                            key={zt.id}
                            type="button"
                            disabled={!isBookable}
                            onClick={() => {
                              if (fullTable) {
                                setSelectedTable(fullTable);
                                setAutoAssignTable(false);
                              }
                            }}
                            className={`p-3 border text-left transition ${shapeBadge(zt.shape)} ${
                              isPicked
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 shadow-xs'
                                : isBookable
                                ? 'border-emerald-200 bg-white hover:border-indigo-400 hover:shadow-xs'
                                : 'border-gray-200 bg-gray-100/80 opacity-55 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-gray-900">
                                {zt.table_number}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                  isBookable
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {isBookable ? 'Open' : 'Unavailable'}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-gray-600">
                              {zt.min_capacity}–{zt.capacity} guests
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {zt.table_type} • {zt.shape || 'Standard'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableTables.map((tbl) => {
                const isPicked = selectedTable?.id === tbl.id && !autoAssignTable;
                return (
                  <button
                    key={tbl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTable(tbl);
                      setAutoAssignTable(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      isPicked
                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                        : 'border-gray-200 hover:border-indigo-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">
                        Table {tbl.table_number}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                        Available
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Seats: <strong>{tbl.min_capacity}–{tbl.capacity} guests</strong>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {tbl.table_type_display || tbl.table_type} • {tbl.zone_name || 'Main Hall'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Guest Contact & Confirm Booking */}
      {(selectedTable || autoAssignTable) && (
        <form
          onSubmit={handleConfirmBooking}
          className="pt-6 border-t border-gray-200 space-y-4"
        >
          <h3 className="text-sm font-bold text-gray-900">3. Complete Your Reservation</h3>

          <div className="rounded-xl bg-indigo-50/80 p-3.5 border border-indigo-100 text-xs text-indigo-950 flex flex-wrap items-center justify-between gap-2">
            <div>
              {autoAssignTable ? (
                <>
                  <strong>Auto-Assign Best Table</strong>{' '}
                  {zoneFilter ? `(Zone: ${zoneFilter})` : '(Any Zone)'}
                </>
              ) : (
                <>
                  Selected: <strong>Table {selectedTable?.table_number}</strong> (
                  {selectedTable?.table_type_display || selectedTable?.table_type},{' '}
                  {selectedTable?.capacity} seats, {selectedTable?.zone_name || 'Main Hall'})
                </>
              )}
            </div>
            <span className="font-semibold">
              {bookingDate} • {startTime}–{endTime} • {guests} Guests
            </span>
          </div>

          {bookingError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <strong>Could not complete reservation:</strong> {bookingError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="jane@example.com"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Special Dietary or Seating Requests
            </label>
            <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Window table, vegetarian menu, birthday celebration..."
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Confirming Reservation...' : 'Confirm Table Reservation'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTable(null);
                setAutoAssignTable(false);
                setBookingError(null);
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Change Table
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
