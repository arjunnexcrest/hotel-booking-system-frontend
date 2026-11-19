'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { hotelsApi } from '@/lib/api';
import { Hotel, HotelImage, HotelStatus } from '@/types';

const HOTEL_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'motel', label: 'Motel' },
  { value: 'resort', label: 'Resort' },
  { value: 'boutique', label: 'Boutique Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'bed_and_breakfast', label: 'Bed & Breakfast' },
  { value: 'apartment', label: 'Apartment / Serviced Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'guesthouse', label: 'Guesthouse' },
];

type Tab = 'profile' | 'gallery';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface EditForm {
  name: string;
  hotel_type: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
}

function statusColor(status: HotelStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'PENDING_APPROVAL':
    case 'UNDER_REVIEW':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'SUSPENDED':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function statusLabel(status: HotelStatus): string {
  switch (status) {
    case 'APPROVED': return 'Approved';
    case 'REJECTED': return 'Rejected';
    case 'PENDING_APPROVAL': return 'Pending Approval';
    case 'UNDER_REVIEW': return 'Under Review';
    case 'SUSPENDED': return 'Suspended';
    case 'DRAFT': return 'Draft';
    default: return status;
  }
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors: Record<Toast['type'], string> = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors[toast.type]} max-w-sm`}>
      <span className="text-sm font-medium">{toast.message}</span>
      <button onClick={onClose} className="ml-auto text-lg leading-none opacity-60 hover:opacity-100">&times;</button>
    </div>
  );
}

export default function HotelProfileManager() {
  useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [editForm, setEditForm] = useState<EditForm>({
    name: '', hotel_type: '', description: '', email: '', phone: '',
    website: '', address: '', city: '', state: '', postal_code: '',
    country: '', latitude: '', longitude: '',
  });

  useEffect(() => {
    (async () => {
      try {
        let h: Hotel | null = null;
        try {
          const myHotelsRaw = await hotelsApi.getMyHotels();
          const myHotels = Array.isArray(myHotelsRaw) ? myHotelsRaw : myHotelsRaw.results || [];
          if (myHotels.length > 0) h = myHotels[0];
        } catch {
          // fallback below
        }
        if (!h) {
          const application = await hotelsApi.getMyApplication();
          h = application ? application.hotel : null;
        }
        if (!h) {
          setNotFound(true);
        } else {
          setHotel(h);
          setEditForm({
            name: h.name,
            hotel_type: h.hotel_type,
            description: h.description,
            email: h.email,
            phone: h.phone,
            website: h.website ?? '',
            address: h.address,
            city: h.city,
            state: h.state,
            postal_code: h.postal_code,
            country: h.country,
            latitude: h.latitude != null ? String(h.latitude) : '',
            longitude: h.longitude != null ? String(h.longitude) : '',
          });
        }
      } catch {
        setFetchError('Failed to load hotel profile. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleField(key: keyof EditForm, value: string) {
    setEditForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!hotel) return;
    setSaving(true);
    try {
      const payload: Partial<Hotel> = {
        name: editForm.name,
        hotel_type: editForm.hotel_type,
        description: editForm.description,
        email: editForm.email,
        phone: editForm.phone,
        website: editForm.website || undefined,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        postal_code: editForm.postal_code,
        country: editForm.country,
        latitude: editForm.latitude ? Number(editForm.latitude) : null,
        longitude: editForm.longitude ? Number(editForm.longitude) : null,
      };
      const updated = await hotelsApi.updateHotelBySlug(hotel.slug, payload);
      setHotel(updated);
      setToast({ type: 'success', message: 'Profile saved successfully!' });
    } catch {
      setToast({ type: 'error', message: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function showComingSoon() {
    setToast({ type: 'info', message: 'Feature coming soon' });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto"><LoadingSkeleton /></div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">{fetchError}</div>
        </div>
      </main>
    );
  }

  if (notFound || !hotel) {
    return (
      <main className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 pt-20">
          <p className="text-xl font-semibold text-gray-700">Hotel not found — register your property first</p>
          <Link href="/hotel-registration" className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Register Your Hotel
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile Details' },
    { key: 'gallery', label: 'Gallery Images' },
  ];

  return (
    <main className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{hotel.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your hotel profile and gallery</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(hotel.status)}`}>
            {statusLabel(hotel.status)}
          </span>
        </div>

        {/* Rejection reason */}
        {hotel.status === 'REJECTED' && hotel.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            <strong>Rejection reason:</strong> {hotel.rejection_reason}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Basic Info */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">Basic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => handleField('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Type</label>
                  <select
                    value={editForm.hotel_type}
                    onChange={e => handleField('hotel_type', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select type</option>
                    {HOTEL_TYPES.map(ht => (
                      <option key={ht.value} value={ht.value}>{ht.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={e => handleField('description', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={e => handleField('email', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={editForm.phone} onChange={e => handleField('phone', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input type="url" value={editForm.website} onChange={e => handleField('website', e.target.value)} placeholder="https://example.com" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">Location</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" value={editForm.address} onChange={e => handleField('address', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={editForm.city} onChange={e => handleField('city', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" value={editForm.state} onChange={e => handleField('state', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" value={editForm.postal_code} onChange={e => handleField('postal_code', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" value={editForm.country} onChange={e => handleField('country', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input type="number" step="any" value={editForm.latitude} onChange={e => handleField('latitude', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input type="number" step="any" value={editForm.longitude} onChange={e => handleField('longitude', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Add image */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">Add Image</h2>
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="Paste image URL…"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => { setNewImageUrl(''); showComingSoon(); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Add Image
                </button>
              </div>
            </section>

            {/* Existing images */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">
                Gallery ({hotel.images.length} image{hotel.images.length !== 1 ? 's' : ''})
              </h2>
              {hotel.images.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No images yet. Add your first image above.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotel.images.map((img: HotelImage) => (
                    <div key={img.id} className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                      <div className="relative h-40 bg-gray-100">
                        <Image
                          src={img.image}
                          alt={img.caption ?? 'Hotel image'}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {img.is_primary && (
                          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        {img.caption && <p className="text-xs text-gray-600 truncate">{img.caption}</p>}
                        <div className="flex gap-2">
                          {!img.is_primary && (
                            <button
                              onClick={showComingSoon}
                              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              Set as Primary
                            </button>
                          )}
                          <button
                            onClick={showComingSoon}
                            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
