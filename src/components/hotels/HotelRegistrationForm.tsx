'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  HotelRegistrationPayload,
  HotelDocumentType,
  HotelStatus,
} from '@/types';
import { hotelsApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const HOTEL_TYPES = [
  'Luxury Hotel & Spa',
  'Boutique Heritage Hotel',
  '5-Star Business Resort',
  'Fine Dining Hotel & Suites',
  'Beachside Resort & Villas',
  'Mountain Retreat & Chalet',
];

const CUISINE_TYPES = [
  'Modern Indian Fine Dining',
  'Contemporary European & Italian',
  'Pan-Asian & Teppanyaki',
  'Mediterranean & Seafood',
  'French Haute Cuisine',
  'Multi-Cuisine Continental',
];

const SAMPLE_IMAGES = [
  {
    label: 'Luxury Facade',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Grand Dining Hall',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Resort Terrace',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
];

const REQUIRED_DOCUMENTS: { type: HotelDocumentType; label: string; desc: string }[] = [
  {
    type: 'TRADE_LICENSE',
    label: 'Trade / Business License',
    desc: 'Government or municipal operating license certifying commercial hospitality operation.',
  },
  {
    type: 'FOOD_SAFETY',
    label: 'Food Safety & Hygiene Certificate (e.g. FSSAI)',
    desc: 'Mandatory health and food hygiene accreditation for commercial kitchen operation.',
  },
  {
    type: 'TAX_ID',
    label: 'Tax Identification / GSTIN / VAT Certificate',
    desc: 'Official tax registration certificate matching legal business entity name.',
  },
  {
    type: 'OWNERSHIP_PROOF',
    label: 'Property Title or Commercial Lease Deed',
    desc: 'Legal proof of building ownership or valid commercial long-term lease.',
  },
];

interface FormProps {
  initialData?: Partial<HotelRegistrationPayload>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export default function HotelRegistrationForm({ initialData, isEditing = false, onSuccess }: FormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [formData, setFormData] = useState<HotelRegistrationPayload>({
    name: initialData?.name || '',
    hotel_type: initialData?.hotel_type || HOTEL_TYPES[0],
    description:
      initialData?.description ||
      'Experience unmatched hospitality and exquisite culinary artistry. Nestled in prime surroundings, our hotel features world-class table dining and refined service.',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || 'India',
    latitude: initialData?.latitude || 19.076,
    longitude: initialData?.longitude || 72.8777,
    primary_image_url:
      initialData?.primary_image_url || SAMPLE_IMAGES[0].url,
    gallery_images: initialData?.gallery_images || [SAMPLE_IMAGES[1].url, SAMPLE_IMAGES[2].url],
    initial_restaurant: {
      name: initialData?.initial_restaurant?.name || 'The Signature Bistro',
      cuisine_type: initialData?.initial_restaurant?.cuisine_type || CUISINE_TYPES[0],
      description:
        initialData?.initial_restaurant?.description ||
        'Gourmet dining venue featuring seasonal ingredients and curated table service.',
      opening_time: initialData?.initial_restaurant?.opening_time || '11:00',
      closing_time: initialData?.initial_restaurant?.closing_time || '23:30',
      estimated_tables: initialData?.initial_restaurant?.estimated_tables || 18,
    },
    documents: initialData?.documents || [
      {
        document_type: 'TRADE_LICENSE',
        document_name: 'Municipal_Trade_License_2026.pdf',
        file_url: 'https://example.com/docs/trade-license.pdf',
        file_size: '2.4 MB',
      },
      {
        document_type: 'FOOD_SAFETY',
        document_name: 'FSSAI_Hygiene_Certificate.pdf',
        file_url: 'https://example.com/docs/fssai.pdf',
        file_size: '1.8 MB',
      },
      {
        document_type: 'TAX_ID',
        document_name: 'GSTIN_Registration_Certificate.pdf',
        file_url: 'https://example.com/docs/gstin.pdf',
        file_size: '850 KB',
      },
      {
        document_type: 'OWNERSHIP_PROOF',
        document_name: 'Property_Title_Deed_Excerpt.pdf',
        file_url: 'https://example.com/docs/title-deed.pdf',
        file_size: '4.2 MB',
      },
    ],
  });

  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  // Auto-populate user email if available
  useEffect(() => {
    const user = getStoredUser();
    if (user?.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        phone: user.phone_number || prev.phone,
      }));
    }
  }, [formData.email]);

  const handleInputChange = (
    field: keyof HotelRegistrationPayload,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRestaurantChange = (
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      initial_restaurant: {
        ...(prev.initial_restaurant || {
          name: '',
          cuisine_type: '',
          opening_time: '10:00',
          closing_time: '23:00',
        }),
        [field]: value,
      },
    }));
  };

  const handleDocumentChange = (
    docType: HotelDocumentType,
    fileName: string,
    fileSize: string
  ) => {
    setFormData((prev) => {
      const existing = prev.documents.filter((d) => d.document_type !== docType);
      return {
        ...prev,
        documents: [
          ...existing,
          {
            document_type: docType,
            document_name: fileName,
            file_url: `https://example.com/uploads/${fileName}`,
            file_size: fileSize,
          },
        ],
      };
    });
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrorMessage('Hotel legal name is required.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Valid official contact email is required.');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMessage('Contact phone number is required.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.country.trim()) {
        setErrorMessage('Address, City, and Country are mandatory location fields.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.initial_restaurant?.name?.trim()) {
        setErrorMessage('Initial restaurant / dining facility name is required.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.primary_image_url?.trim()) {
        setErrorMessage('Primary cover image is required for customer listings.');
        return false;
      }
    } else if (step === 5) {
      const uploadedTypes = new Set(formData.documents.map((d) => d.document_type));
      for (const req of REQUIRED_DOCUMENTS) {
        if (!uploadedTypes.has(req.type)) {
          setErrorMessage(`Please upload verification document: ${req.label}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (targetStatus: HotelStatus = 'PENDING_APPROVAL') => {
    if (targetStatus === 'PENDING_APPROVAL' && !agreedToTerms) {
      setErrorMessage('You must acknowledge and accept the verification terms to proceed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: HotelRegistrationPayload = {
        ...formData,
        status: targetStatus,
      };

      await hotelsApi.submitRegistration(payload);
      setSuccessMessage(
        targetStatus === 'DRAFT'
          ? 'Hotel registration application saved as draft!'
          : 'Application submitted successfully! Your dossier is now pending Super Admin review.'
      );

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/hotel-admin/application-status');
        }
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit application.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Hotel Profile', subtitle: 'Identity & Contacts' },
    { number: 2, title: 'Location', subtitle: 'Address & GPS' },
    { number: 3, title: 'Dining Venue', subtitle: 'Restaurant & Hours' },
    { number: 4, title: 'Media & Photos', subtitle: 'Visual Showcase' },
    { number: 5, title: 'Legal Docs', subtitle: 'Licenses & Compliance' },
    { number: 6, title: 'Review & Submit', subtitle: 'Confirmation' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 relative">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-400/30">
            🏨 Partner Onboarding & Registration (FR-007 & FR-008)
          </span>
          <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
            {isEditing ? 'Update Hotel Registration Dossier' : 'Register Your Hotel & Dining Venue'}
          </h1>
          <p className="mt-2 text-sm text-indigo-200">
            Join the GrandTable hospitality network. Submit your property credentials, dining facilities, and verification documents for Super Administrator accreditation.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-indigo-800/60">
          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (isCompleted || s.number < currentStep) {
                    setCurrentStep(s.number);
                  }
                }}
                disabled={s.number > currentStep}
                className={`text-left p-2.5 rounded-xl transition flex flex-col gap-1 ${
                  isCurrent
                    ? 'bg-indigo-600/90 text-white ring-1 ring-indigo-400 shadow'
                    : isCompleted
                    ? 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900/60 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed text-indigo-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-white text-indigo-900'
                        : 'bg-indigo-800 text-indigo-300'
                    }`}
                  >
                    {isCompleted ? '✓' : s.number}
                  </span>
                  <span className="text-xs font-semibold truncate">{s.title}</span>
                </div>
                <span className="text-[10px] text-indigo-300 hidden sm:block truncate">
                  {s.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-6 md:p-10 space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <span className="text-red-500 text-lg leading-none">⚠️</span>
            <div>
              <p className="font-semibold">Verification check required</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
            <span className="text-emerald-500 text-lg leading-none">✅</span>
            <div>
              <p className="font-semibold">Success!</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Basic Hotel Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900">1. Property Identity & Contact Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Provide legal business registration information and primary hospitality point of contact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Hotel / Property Commercial Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Grand Azure Palace & Spa"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Property Classification / Type *
                </label>
                <select
                  value={formData.hotel_type}
                  onChange={(e) => handleInputChange('hotel_type', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                >
                  {HOTEL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://www.grandazurepalace.com"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Primary Contact Email (For Admin & Guest Inquiries) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="concierge@grandazurepalace.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Official Phone / Reception Desk *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 22 2847 9000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Hotel Overview & Public Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed description of hotel ambiance, location highlights, and guest amenities..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location & Address */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900">2. Physical Location & Map Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Provide precise address information so guests can easily locate and navigate to the premises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Street Address & Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 42, Marine Drive, Near Nariman Point"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  City / Metropolitan Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  State / Province *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 400021"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  GPS Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="19.0760"
                  value={formData.latitude ?? ''}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || null)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  GPS Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="72.8777"
                  value={formData.longitude ?? ''}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || null)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Initial Dining Venue / Restaurant */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900">3. Primary Dining Facility & Operating Schedule</h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure your premier on-site restaurant for AI-monitored table bookings (additional venues can be added in dashboard).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Restaurant / Venue Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saffron Skylounge & Grill"
                  value={formData.initial_restaurant?.name || ''}
                  onChange={(e) => handleRestaurantChange('name', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Cuisine Specialization *
                </label>
                <select
                  value={formData.initial_restaurant?.cuisine_type || CUISINE_TYPES[0]}
                  onChange={(e) => handleRestaurantChange('cuisine_type', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  {CUISINE_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Opening Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.initial_restaurant?.opening_time || '11:00'}
                  onChange={(e) => handleRestaurantChange('opening_time', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Closing Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.initial_restaurant?.closing_time || '23:30'}
                  onChange={(e) => handleRestaurantChange('closing_time', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Estimated Table Count (Initial)
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={formData.initial_restaurant?.estimated_tables || 15}
                  onChange={(e) => handleRestaurantChange('estimated_tables', parseInt(e.target.value) || 10)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Detailed table zone maps and capacities will be configured once approved.
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Dining Concept & Atmosphere
                </label>
                <textarea
                  rows={2}
                  value={formData.initial_restaurant?.description || ''}
                  onChange={(e) => handleRestaurantChange('description', e.target.value)}
                  placeholder="Highlight signature chef specials, wine pairing, or romantic skyline views..."
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Imagery & Visual Showcase */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900">4. Property & Dining Showcase Photos</h2>
              <p className="text-sm text-gray-500 mt-1">
                High-definition photos create compelling first impressions for prospective dining guests.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Primary Facade / Exterior Cover Image URL *
              </label>
              <div className="mt-1.5 flex gap-3">
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.primary_image_url || ''}
                  onChange={(e) => handleInputChange('primary_image_url', e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Sample Quick Selector */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Quick Demo Presets:</span>
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => handleInputChange('primary_image_url', img.url)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition font-medium"
                  >
                    {img.label}
                  </button>
                ))}
              </div>

              {formData.primary_image_url && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 relative aspect-video max-h-72 w-full bg-gray-100">
                  <Image
                    src={formData.primary_image_url}
                    alt="Primary Cover Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-white text-xs font-medium">
                    Primary Cover Preview
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Gallery Photos (Dining Room, Table Views, Ambience)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.gallery_images || []).map((imgUrl, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                    <Image
                      src={imgUrl}
                      alt={`Gallery item ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.gallery_images || []).filter((_, i) => i !== idx);
                          handleInputChange('gallery_images', updated);
                        }}
                        className="bg-red-600 text-white p-1 rounded-full text-xs shadow hover:bg-red-700"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Verification Documents (FR-008 & FR-010) */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900">5. Regulatory Licenses & Compliance Documents</h2>
              <p className="text-sm text-gray-500 mt-1">
                To guarantee guest safety and regulatory compliance, the Super Admin team reviews the following verified credentials.
              </p>
            </div>

            <div className="space-y-4">
              {REQUIRED_DOCUMENTS.map((docDef) => {
                const currentDoc = formData.documents.find((d) => d.document_type === docDef.type);
                return (
                  <div
                    key={docDef.type}
                    className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                          📄
                        </span>
                        <h3 className="text-sm font-bold text-gray-900">{docDef.label}</h3>
                        {currentDoc ? (
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Attached
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-9">{docDef.desc}</p>
                      {currentDoc && (
                        <div className="mt-2 pl-9 flex items-center gap-3 text-xs text-gray-600 font-medium">
                          <span className="text-indigo-600">📎 {currentDoc.document_name}</span>
                          <span>({currentDoc.file_size || '2 MB'})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pl-9 md:pl-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleDocumentChange(
                            docDef.type,
                            `${docDef.type.toLowerCase()}_verified_2026.pdf`,
                            '1.9 MB'
                          )
                        }
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                      >
                        {currentDoc ? 'Replace File' : 'Upload File'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              🔒 <strong>Compliance Notice:</strong> Submitted documents are securely encrypted at rest. Verification officers audit license validity, commercial business address alignment, and sanitary hygiene certifications prior to public customer indexing.
            </div>
          </div>
        )}

        {/* STEP 6: Review, Draft & Final Submission */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900">6. Review Dossier & Final Submission</h2>
              <p className="text-sm text-gray-500 mt-1">
                Confirm your property details and submit your application for accreditation.
              </p>
            </div>

            {/* Overview Summary Box */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {formData.hotel_type}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{formData.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.address}, {formData.city}, {formData.state} - {formData.postal_code}, {formData.country}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Edit Information ↗
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Direct Contact
                  </span>
                  <p className="font-semibold text-gray-900">{formData.email}</p>
                  <p className="text-gray-600 mt-0.5">{formData.phone}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Primary Restaurant
                  </span>
                  <p className="font-semibold text-gray-900">
                    {formData.initial_restaurant?.name}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {formData.initial_restaurant?.cuisine_type} ({formData.initial_restaurant?.opening_time} - {formData.initial_restaurant?.closing_time})
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Compliance Documents
                  </span>
                  <p className="font-semibold text-emerald-600">
                    ✓ {formData.documents.length} of {REQUIRED_DOCUMENTS.length} Attached
                  </p>
                  <p className="text-gray-500 mt-0.5">All required licenses present</p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-xs text-gray-600 leading-normal">
                    I declare under penalty of perjury that the hotel credentials, licenses, and ownership records submitted in this dossier are true, valid, and legally binding. I understand that false submissions will result in immediate disqualification and platform suspension under GrandTable regulatory policies.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls / Navigation */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition"
              >
                Continue to {steps[currentStep]?.title || 'Next Step'} →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('PENDING_APPROVAL')}
                  disabled={isSubmitting || !agreedToTerms}
                  className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting Dossier...
                    </>
                  ) : (
                    'Submit for Verification 🚀'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
