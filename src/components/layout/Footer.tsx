import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-xs shadow-xs">
              HBS
            </span>
            <span className="font-bold text-sm text-gray-900 tracking-tight">GrandTable</span>
            <span className="text-xs text-gray-500">© 2026 All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-600">
            <Link href="/hotels" className="hover:text-indigo-600 transition">
              Explore Hotels
            </Link>
            <Link href="/hotel-registration" className="hover:text-indigo-600 transition">
              Partner With Us
            </Link>
            <Link href="/hotel-admin" className="hover:text-indigo-600 transition">
              Hotel Portal
            </Link>
            <Link href="/super-admin/approvals" className="hover:text-indigo-600 transition">
              Compliance Review
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
