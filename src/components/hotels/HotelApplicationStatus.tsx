'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HotelApplication, HotelStatus } from '@/types';
import { hotelsApi } from '@/lib/api';

interface StatusProps {
  initialApplication?: HotelApplication | null;
  onEditApplication?: () => void;
}

export default function HotelApplicationStatus({
  initialApplication,
  onEditApplication,
}: StatusProps) {
  const router = useRouter();
  const [application, setApplication] = useState<HotelApplication | null>(initialApplication || null);
  const [loading, setLoading] = useState<boolean>(!initialApplication);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  useEffect(() => {
    async function loadApp() {
      if (!initialApplication) {
        setLoading(true);
        try {
          const app = await hotelsApi.getMyApplication();
          setApplication(app);
        } catch (err) {
          console.error('Failed to load application:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadApp();
  }, [initialApplication]);

  // Demo status switcher for testing and demonstration
  const handleSimulateStatus = async (status: HotelStatus) => {
    setActionLoading(true);
    try {
      const reason =
        status === 'REJECTED'
          ? 'The uploaded Food Safety / FSSAI certificate has expired (Validity ended Oct 2026). Please upload a renewed certificate with an active QR verification code.'
          : undefined;

      const updated = await hotelsApi.updateApplicationStatus(status, reason);
      if (updated) {
        setApplication(updated);
        setFeedbackMessage(`Simulated application status change to: ${status}`);
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Retrieving application status...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-gray-200 text-center shadow-lg">
        <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-3xl">
          🏨
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">No Hotel Application Found</h2>
        <p className="mt-2 text-sm text-gray-500">
          You have not submitted a hotel registration application yet. Register your property to list restaurants and manage table reservations.
        </p>
        <Link
          href="/hotel-registration"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 transition"
        >
          Begin Hotel Registration →
        </Link>
      </div>
    );
  }

  const { status, hotel, documents, timeline } = application;

  const statusConfig: Record<
    HotelStatus,
    { title: string; color: string; badge: string; icon: string; description: string }
  > = {
    DRAFT: {
      title: 'Draft Dossier',
      color: 'bg-slate-50 border-slate-200 text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: '📝',
      description: 'Your registration details are saved locally. Submit the application when all legal documents are ready.',
    },
    PENDING_APPROVAL: {
      title: 'Pending Super-Admin Review',
      color: 'bg-amber-50/70 border-amber-200 text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '⏳',
      description: 'Your hotel application dossier has been submitted and is queued for verification by the Super Administrator compliance team.',
    },
    UNDER_REVIEW: {
      title: 'Under Verification',
      color: 'bg-blue-50/70 border-blue-200 text-blue-900',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '🔍',
      description: 'Compliance officers are actively reviewing your trade licenses, food safety certificates, and dining capacity parameters.',
    },
    APPROVED: {
      title: 'Accreditation Approved & Live',
      color: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '✨',
      description: 'Congratulations! Your property has been officially approved and activated on the GrandTable platform.',
    },
    REJECTED: {
      title: 'Application Discrepancy / Action Required',
      color: 'bg-rose-50/70 border-rose-200 text-rose-900',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: '⚠️',
      description: 'The review team identified documentation or licensing issues. Review the examiner notes below and resubmit.',
    },
    SUSPENDED: {
      title: 'Listing Suspended',
      color: 'bg-gray-100 border-gray-300 text-gray-800',
      badge: 'bg-gray-200 text-gray-800 border-gray-400',
      icon: '🛑',
      description: 'This property listing is currently inactive due to administrative review or policy compliance issues.',
    },
  };

  const currentConfig = statusConfig[status] || statusConfig.PENDING_APPROVAL;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {feedbackMessage && (
        <div className="p-3 bg-indigo-600 text-white text-xs font-semibold rounded-xl text-center shadow">
          {feedbackMessage}
        </div>
      )}

      {/* Main Status Header Card */}
      <div className={`p-8 md:p-10 rounded-3xl border shadow-lg ${currentConfig.color} transition duration-300 relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full border shadow-sm ${currentConfig.badge}`}>
                {currentConfig.icon} {status.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-gray-600 bg-white/70 px-2.5 py-1 rounded-md border border-gray-200">
                Application #{application.application_number}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              {currentConfig.title}
            </h1>
            <p className="text-sm leading-relaxed opacity-90">
              {currentConfig.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs opacity-75 font-medium">
              <span>Submitted: {new Date(application.submitted_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last Updated: {new Date(application.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>•</span>
              <span>Assigned Desk: {application.assigned_reviewer || 'Super Admin Desk'}</span>
            </div>
          </div>

          {/* Quick Action Button for Status */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            {status === 'APPROVED' ? (
              <Link
                href="/hotel-admin"
                className="w-full text-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                Open Admin Portal →
              </Link>
            ) : status === 'REJECTED' ? (
              <button
                type="button"
                onClick={() => {
                  if (onEditApplication) onEditApplication();
                  else router.push('/hotel-registration');
                }}
                className="w-full text-center px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition"
              >
                Resubmit Application ↗
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onEditApplication) onEditApplication();
                  else router.push('/hotel-registration');
                }}
                className="w-full text-center px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs border border-gray-300 shadow-sm transition"
              >
                Edit Submitted Details ✏️
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full text-center px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-gray-700 font-medium text-xs transition"
            >
              Print Summary 🖨️
            </button>
          </div>
        </div>
      </div>

      {/* REJECTION REASON ALERT (FR-012 & FR-013) */}
      {status === 'REJECTED' && (
        <div className="p-6 rounded-2xl bg-white border-2 border-rose-200 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <span className="text-lg">🚫</span> Super-Admin Reviewer Feedback
          </div>
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900 text-sm font-medium leading-relaxed">
            {application.rejection_reason ||
              'Documentation issue: Please verify that all submitted government licenses are currently active and that the physical address matches the registration deed.'}
          </div>
          <div className="text-xs text-gray-600">
            <strong>Next Action:</strong> Update the requested documents and click{' '}
            <button
              onClick={() => {
                if (onEditApplication) onEditApplication();
                else router.push('/hotel-registration');
              }}
              className="text-indigo-600 underline font-semibold"
            >
              Resubmit Application
            </button>
            . Your dossier will be re-queued with elevated priority.
          </div>
        </div>
      )}

      {/* APPROVED NEXT STEPS (FR-011 & FR-014) */}
      {status === 'APPROVED' && (
        <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
            <span>🎉</span> Your Hotel is Live & Ready for Operations!
          </div>
          <p className="text-xs text-emerald-700">
            Your hotel is now certified on the GrandTable platform. Complete the following three operational steps to start welcoming dining guests:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/hotel-admin/tables"
              className="p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 transition shadow-xs text-left"
            >
              <span className="text-xs font-bold text-gray-900 block">1. Configure Tables</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                Define table capacities, booth/outdoor types, and generate QR codes.
              </span>
            </Link>
            <Link
              href="/hotel-admin/staff"
              className="p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 transition shadow-xs text-left"
            >
              <span className="text-xs font-bold text-gray-900 block">2. Add Staff & Waiters</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                Invite floor managers, assign table zones, and manage cleaning teams.
              </span>
            </Link>
            <Link
              href="/hotel-admin/alerts"
              className="p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 transition shadow-xs text-left"
            >
              <span className="text-xs font-bold text-gray-900 block">3. Connect AI Cameras</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                Enable computer-vision monitoring for automated occupancy & cleanliness.
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Four-Stage Review Progress Pipeline */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-md space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Application Accreditation Lifecycle</h2>
          <p className="text-xs text-gray-500 mt-1">
            Standard compliance review takes 24–48 business hours from initial dossier submission.
          </p>
        </div>

        <div className="relative border-l-2 border-indigo-100 ml-4 md:ml-6 pl-6 space-y-8">
          {timeline.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const isCurrent = item.status === 'in_progress';
            const isRejected = item.status === 'rejected';

            return (
              <div key={idx} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm transition ${
                    isRejected
                      ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                      : isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {isRejected ? '✕' : isCompleted ? '✓' : idx + 1}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3
                    className={`text-sm font-bold ${
                      isRejected
                        ? 'text-rose-700'
                        : isCurrent
                        ? 'text-indigo-600 font-extrabold'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.timestamp && (
                    <span className="text-[11px] font-mono text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submitted Documents & License Audit Checklist */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submitted Verification Documents</h2>
            <p className="text-xs text-gray-500 mt-1">
              Legal documents evaluated during regulatory vetting (FR-008 & FR-010).
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {documents.length} Files Attached
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-start justify-between gap-3 hover:bg-white hover:border-indigo-200 transition"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {doc.document_type.replace('_', ' ')}
                </span>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[240px]">
                  {doc.document_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{doc.file_size || '1.8 MB'}</span>
                  <span>•</span>
                  <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                {doc.status === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    ✓ Verified
                  </span>
                ) : doc.status === 'REJECTED' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                    ✕ Discrepancy
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    ⏳ In Review
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Summary Card */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Registered Property
          </span>
          <h3 className="text-base font-bold text-gray-900">{hotel.name}</h3>
          <p className="text-xs text-indigo-600 font-medium">{hotel.hotel_type}</p>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{hotel.description}</p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Location & Geo Coordinates
          </span>
          <p className="text-xs font-semibold text-gray-900">{hotel.address}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {hotel.city}, {hotel.state} - {hotel.postal_code}, {hotel.country}
          </p>
          {hotel.latitude && hotel.longitude && (
            <p className="text-[11px] font-mono text-gray-400 mt-2">
              GPS: {hotel.latitude.toFixed(4)}° N, {hotel.longitude.toFixed(4)}° E
            </p>
          )}
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Primary Contact Details
          </span>
          <p className="text-xs font-semibold text-gray-900">{hotel.email}</p>
          <p className="text-xs text-gray-600 mt-0.5">{hotel.phone}</p>
          {hotel.website && (
            <a
              href={hotel.website}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 hover:underline mt-1 block truncate"
            >
              {hotel.website}
            </a>
          )}
        </div>
      </div>

      {/* Interactive Status Switcher Demo Toolbar */}
      <div className="p-6 rounded-2xl bg-indigo-950 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-300">
              🛠️ Developer & Reviewer Live Status Switcher
            </span>
            <p className="text-xs text-indigo-200 mt-0.5">
              Simulate any of the 6 SRS-defined registration statuses to test UI reactions, timeline progression, rejection feedback, and admin activation:
            </p>
          </div>
          {actionLoading && (
            <span className="text-xs text-indigo-300 animate-pulse font-medium">Updating...</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {(['PENDING_APPROVAL', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT'] as HotelStatus[]).map(
            (st) => (
              <button
                key={st}
                type="button"
                disabled={actionLoading}
                onClick={() => handleSimulateStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  status === st
                    ? 'bg-white text-indigo-950 shadow ring-2 ring-indigo-400'
                    : 'bg-indigo-900/80 text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
