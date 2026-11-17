import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12 text-sm text-gray-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                HBS
              </div>
              <span className="text-base font-bold text-gray-900">GrandTable</span>
            </div>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Intelligent multi-hotel dining table reservation and computer-vision powered table management platform.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Platform</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/hotels" className="hover:text-indigo-600">Discover Hotels</Link></li>
              <li><Link href="/bookings" className="hover:text-indigo-600">Table Reservations</Link></li>
              <li><Link href="/hotel-admin" className="hover:text-indigo-600">Hotel Partners Portal</Link></li>
              <li><Link href="/staff" className="hover:text-indigo-600">Staff Service Terminal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">AI Capabilities</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="text-gray-500">Live Occupancy Detection</li>
              <li className="text-gray-500">Waiter Presence Monitoring</li>
              <li className="text-gray-500">Table Cleanliness Auditing</li>
              <li className="text-gray-500">Automated Turnaround Workflow</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Demo Accounts</h4>
            <div className="mt-3 text-xs space-y-1 bg-white p-3 rounded-lg border border-gray-200 font-mono text-[11px]">
              <p><strong className="text-gray-800">Admin:</strong> admin@hotelbooking.com / Admin@12345</p>
              <p><strong className="text-gray-800">Owner:</strong> owner@grandpalace.com / Owner@12345</p>
              <p><strong className="text-gray-800">Customer:</strong> john@example.com / Customer@12345</p>
              <p><strong className="text-gray-800">Staff:</strong> waiter@grandpalace.com / Staff@12345</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Hotel Table Booking & AI Management System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
