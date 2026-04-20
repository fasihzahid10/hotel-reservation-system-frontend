'use client';

import { Suspense } from 'react';
import { FrontDeskReservationPanel } from '@/components/admin/front-desk-reservations';

export default function ReservationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Reservations</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Booking lifecycle</h1>
        <p className="mt-2 text-slate-500">
          Search by status, create bookings with payment type, and run check-in or check-out in one place.
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-slate-500">Loading workspace…</div>}>
        <FrontDeskReservationPanel syncUrlTab />
      </Suspense>
    </div>
  );
}
