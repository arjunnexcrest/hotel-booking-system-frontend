'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { hotelsApi } from '@/lib/api';
import { HotelApplication, HotelStatus, DocumentVerificationStatus } from '@/types';

export default function SuperAdminApprovalsPage() {
  const [applications, setApplications] = useState<HotelApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<HotelApplication | null>(null);

  // Review Modal State
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await hotelsApi.getAllApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'PENDING_APPROVAL').length,
    underReview: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
    approved: applications.filter((a) => a.status === 'APPROVED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  };

  const filteredApps = applications.filter((app) => {
    const matchesFilter =
      activeFilter === 'ALL' || app.status === activeFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      app.hotel.name.toLowerCase().includes(query) ||
      app.hotel.city.toLowerCase().includes(query) ||
      app.hotel.email.toLowerCase().includes(query) ||
      app.application_number.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleDocumentStatusToggle = (docId: number, newStatus: DocumentVerificationStatus) => {
    if (!selectedApp) return;
    const updatedDocs = selectedApp.documents.map((d) =>
      d.id === docId ? { ...d, status: newStatus } : d
    );
    setSelectedApp({ ...selectedApp, documents: updatedDocs });
  };

  const handleExecuteDecision = async (decision: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW') => {
    if (!selectedApp) return;

    if (decision === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please provide a specific rejection reason explaining what documentation or compliance item needs correction.');
      return;
    }

    setActionLoading(true);
    try {
      const docUpdates = selectedApp.documents.map((d) => ({
        id: d.id,
        status: d.status,
      }));

      const updated = await hotelsApi.reviewApplication(selectedApp.id, {
        decision,
        notes: reviewNotes || `Super Admin decision: ${decision}`,
        rejection_reason: decision === 'REJECTED' ? rejectionReason : undefined,
        document_updates: docUpdates,
      });

      // Update in local state
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setSelectedApp(updated);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setReviewNotes('');
      setRejectionReason('');

      setActionSuccessMessage(
        decision === 'APPROVED'
          ? `Application #${updated.application_number} (${updated.hotel.name}) successfully APPROVED and activated for public customer bookings!`
          : decision === 'REJECTED'
          ? `Application #${updated.application_number} has been REJECTED. Compliance feedback was recorded for the hotel owner.`
          : `Application #${updated.application_number} placed UNDER REVIEW.`
      );

      setTimeout(() => setActionSuccessMessage(''), 4500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update review status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: HotelStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            ✓ Approved & Live
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            🔍 Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            ✕ Discrepancy / Rejected
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            📝 Draft
          </span>
        );
      case 'PENDING_APPROVAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
            ⏳ Pending Review
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/80 p-6 sm:p-8 lg:p-10 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              🛡️ Super Administrator Governance (FR-010, FR-011, FR-012)
            </span>
            <span className="text-xs font-mono text-gray-500">Platform Accreditation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
            Hotel Application & Compliance Review
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit submitted property credentials, verify trade and food safety licenses, and grant or reject platform accreditation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/super-admin"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-300 text-gray-700 shadow-xs hover:bg-gray-50 transition"
          >
            ← Admin Dashboard
          </Link>
          <Link
            href="/super-admin/hotels"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition"
          >
            View All Live Hotels
          </Link>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveFilter('PENDING_APPROVAL')}
          className={`p-5 rounded-2xl border text-left transition shadow-xs ${
            activeFilter === 'PENDING_APPROVAL'
              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400'
              : 'bg-white border-gray-200 hover:border-amber-300'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              activeFilter === 'PENDING_APPROVAL' ? 'text-amber-100' : 'text-gray-400'
            }`}
          >
            Pending Review
          </span>
          <p className="text-3xl font-extrabold">{counts.pending}</p>
          <span
            className={`text-[11px] font-medium mt-1 block ${
              activeFilter === 'PENDING_APPROVAL' ? 'text-amber-100' : 'text-amber-600'
            }`}
          >
            Awaiting accreditation check
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('UNDER_REVIEW')}
          className={`p-5 rounded-2xl border text-left transition shadow-xs ${
            activeFilter === 'UNDER_REVIEW'
              ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              activeFilter === 'UNDER_REVIEW' ? 'text-blue-100' : 'text-gray-400'
            }`}
          >
            Under Audit
          </span>
          <p className="text-3xl font-extrabold">{counts.underReview}</p>
          <span
            className={`text-[11px] font-medium mt-1 block ${
              activeFilter === 'UNDER_REVIEW' ? 'text-blue-100' : 'text-blue-600'
            }`}
          >
            In-progress compliance vetting
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('APPROVED')}
          className={`p-5 rounded-2xl border text-left transition shadow-xs ${
            activeFilter === 'APPROVED'
              ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400'
              : 'bg-white border-gray-200 hover:border-emerald-300'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              activeFilter === 'APPROVED' ? 'text-emerald-100' : 'text-gray-400'
            }`}
          >
            Approved & Active
          </span>
          <p className="text-3xl font-extrabold">{counts.approved}</p>
          <span
            className={`text-[11px] font-medium mt-1 block ${
              activeFilter === 'APPROVED' ? 'text-emerald-100' : 'text-emerald-600'
            }`}
          >
            Listed on customer portal
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('REJECTED')}
          className={`p-5 rounded-2xl border text-left transition shadow-xs ${
            activeFilter === 'REJECTED'
              ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400'
              : 'bg-white border-gray-200 hover:border-rose-300'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              activeFilter === 'REJECTED' ? 'text-rose-100' : 'text-gray-400'
            }`}
          >
            Discrepancies / Rejected
          </span>
          <p className="text-3xl font-extrabold">{counts.rejected}</p>
          <span
            className={`text-[11px] font-medium mt-1 block ${
              activeFilter === 'REJECTED' ? 'text-rose-100' : 'text-rose-600'
            }`}
          >
            Requires hotel resubmission
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'ALL', label: `All (${counts.all})` },
            { key: 'PENDING_APPROVAL', label: `Pending (${counts.pending})` },
            { key: 'UNDER_REVIEW', label: `Under Review (${counts.underReview})` },
            { key: 'APPROVED', label: `Approved (${counts.approved})` },
            { key: 'REJECTED', label: `Rejected (${counts.rejected})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeFilter === tab.key
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search hotel name, city, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium rounded-xl border border-gray-300 px-3.5 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Loading vetting queue...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-2xl">📭</p>
            <p className="text-sm font-bold text-gray-900">No applications match filter</p>
            <p className="text-xs text-gray-500">
              Clear search or select another status filter above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Application & Property</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Direct Contacts</th>
                  <th className="py-4 px-6">Compliance Docs</th>
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6">Review Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-purple-50/30 transition group">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] text-gray-400">
                          #{app.application_number}
                        </span>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition">
                          {app.hotel.name}
                        </p>
                        <span className="text-[11px] text-indigo-600 font-medium">
                          {app.hotel.hotel_type}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-800">
                        {app.hotel.city}, {app.hotel.state}
                      </p>
                      <p className="text-[11px] text-gray-400">{app.hotel.country}</p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-800">{app.hotel.email}</p>
                      <p className="text-[11px] text-gray-500">{app.hotel.phone}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-800">
                          {app.documents.length} Files
                        </span>
                        {app.documents.every((d) => d.status === 'VERIFIED') ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            All Verified
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            {app.documents.filter((d) => d.status === 'VERIFIED').length} / {app.documents.length} Checked
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold border border-purple-200 transition text-xs shadow-xs"
                      >
                        Review Dossier →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL DOSSIER REVIEW MODAL / DRAWER (FR-010, FR-011, FR-012) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-white/20 text-white px-2.5 py-0.5 rounded-md">
                    #{selectedApp.application_number}
                  </span>
                  <span className="text-xs font-semibold text-purple-300">
                    {selectedApp.hotel.hotel_type}
                  </span>
                </div>
                <h2 className="text-2xl font-black mt-2 tracking-tight">
                  {selectedApp.hotel.name}
                </h2>
                <p className="text-xs text-purple-200 mt-1">
                  {selectedApp.hotel.address}, {selectedApp.hotel.city}, {selectedApp.hotel.state} - {selectedApp.hotel.postal_code}, {selectedApp.hotel.country}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Hotel Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Owner & Contact
                  </span>
                  <p className="font-bold text-gray-900">{selectedApp.hotel.email}</p>
                  <p className="text-gray-600 mt-0.5">{selectedApp.hotel.phone}</p>
                  {selectedApp.hotel.website && (
                    <a
                      href={selectedApp.hotel.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-600 hover:underline mt-1 block truncate"
                    >
                      {selectedApp.hotel.website}
                    </a>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Current Audit Status
                  </span>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    Reviewer: {selectedApp.assigned_reviewer || 'Unassigned'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Submission Timestamp
                  </span>
                  <p className="font-bold text-gray-900">
                    {new Date(selectedApp.submitted_at).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Last modified: {new Date(selectedApp.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Property Image Preview */}
              {selectedApp.hotel.images.length > 0 && (
                <div className="relative aspect-video max-h-56 w-full rounded-2xl overflow-hidden border border-gray-200">
                  <Image
                    src={selectedApp.hotel.images[0].image}
                    alt={selectedApp.hotel.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-3 py-1 rounded-md text-white text-[11px] font-semibold">
                    Primary Facade Photograph (FR-008)
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Public Description & Bio
                </span>
                <p className="text-slate-800 leading-relaxed">{selectedApp.hotel.description}</p>
              </div>

              {/* COMPLIANCE DOCUMENTS VETTING PANEL (FR-008 & FR-010) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Regulatory & Compliance License Audit
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Verify authenticity, validity period, and commercial address matching.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    FR-010 Verification Desk
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedApp.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-700">
                            {doc.document_type.replace('_', ' ')}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="font-mono text-gray-600">{doc.document_name}</span>
                          <span className="text-gray-400">({doc.file_size || '2 MB'})</span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                        >
                          View Document ↗
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDocumentStatusToggle(doc.id, 'VERIFIED')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition ${
                            doc.status === 'VERIFIED'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          ✓ Verified
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDocumentStatusToggle(doc.id, 'REJECTED')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition ${
                            doc.status === 'REJECTED'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          ✕ Discrepancy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing Rejection / Admin Notes */}
              {selectedApp.rejection_reason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="font-bold block mb-1">Previous Rejection Reason on Record:</span>
                  <p>{selectedApp.rejection_reason}</p>
                </div>
              )}

              {/* Reviewer Note Input */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Internal Compliance / Auditor Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes regarding certificate validity, premises inspection, or reason for review..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs text-gray-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* REJECTION REASON CONFIRMATION DIALOG (FR-012) */}
              {showRejectDialog && (
                <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                    <span>⚠️</span> Mandatory Rejection Feedback (FR-012)
                  </div>
                  <p className="text-[11px] text-rose-700">
                    State the specific license discrepancies or safety failures. This will be transmitted directly to the hotel owner so they can correct and resubmit their dossier.
                  </p>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. The Food Safety / FSSAI certificate provided has expired on October 2026. Please upload a renewed certificate with an active QR accreditation code."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-xl border border-rose-300 p-3 text-xs text-gray-900 bg-white focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectDialog(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading || !rejectionReason.trim()}
                      onClick={() => handleExecuteDecision('REJECTED')}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold shadow-md"
                    >
                      {actionLoading ? 'Recording Rejection...' : 'Confirm Rejection (FR-012)'}
                    </button>
                  </div>
                </div>
              )}

              {/* APPROVE CONFIRMATION DIALOG (FR-011) */}
              {showApproveDialog && (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <span>✨</span> Confirm Platform Accreditation (FR-011 & FR-014)
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Approving will officially certify <strong>{selectedApp.hotel.name}</strong>, activate public listing across the GrandTable customer portal, and grant full hotel management privileges.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowApproveDialog(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleExecuteDecision('APPROVED')}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-2"
                    >
                      {actionLoading ? 'Activating Hotel...' : 'Certify & Activate Listing 🚀'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-100 transition"
                >
                  Close Dossier
                </button>
              </div>

              {!showRejectDialog && !showApproveDialog && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleExecuteDecision('UNDER_REVIEW')}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition"
                  >
                    Place Under Review
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition"
                  >
                    Reject Application (FR-012)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowApproveDialog(true)}
                    disabled={actionLoading}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                  >
                    Approve Hotel (FR-011)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
