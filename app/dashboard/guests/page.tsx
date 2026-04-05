'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Guest } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Guest[]>('/guests')
      .then(setGuests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load guests.'));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Guests</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Guest records</h1>
        <p className="mt-2 text-slate-500">Contact details and recent reservation activity across your property.</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">Guest directory</h2>
          <p className="mt-1 text-sm text-slate-500">Most recent guests appear first.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Government ID</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Recent reservations</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-semibold text-slate-900">{guest.fullName}</td>
                  <td className="px-4 py-4 text-slate-600">{guest.email}</td>
                  <td className="px-4 py-4 text-slate-600">{guest.phone || '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{guest.idNumber || '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(guest.createdAt)}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {guest.reservations?.length ? guest.reservations.map((reservation) => reservation.bookingReference).join(', ') : 'No reservations yet'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
