'use client';

import { Suspense } from 'react';
import { ClipboardList } from 'lucide-react';
import { FrontDeskReservationPanel } from '@/components/admin/front-desk-reservations';

export default function CheckInOutPage() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-gradient-to-br from-[#121d2f] to-[#0c1528] text-sky-300">
            <ClipboardList className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0c1528]">Check-in / Check-out</h1>
            <p className="mt-1 text-slate-500">Arrivals, in-house guests, departures, and quick bookings.</p>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="text-sm text-slate-500">Loading desk…</div>}>
        <FrontDeskReservationPanel syncUrlTab />
      </Suspense>
    </div>
  );
}
