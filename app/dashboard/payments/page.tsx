'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import type { Reservation } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentsPage() {
  const [pending, setPending] = useState<Reservation[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Reservation[]>('/reservations?status=PENDING')
      .then(setPending)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load payments.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-gradient-to-br from-[#121d2f] to-[#0c1528] text-sky-300">
            <DollarSign className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0c1528]">Payments</h1>
            <p className="mt-1 text-slate-500">Reservations awaiting payment (PENDING).</p>
          </div>
        </div>
        <Link href="/dashboard/reports" className="button-secondary rounded-xl px-4 py-2 text-sm">
          View financial reports
        </Link>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Pending payment</h2>
          <p className="mt-1 text-sm text-slate-500">
            Complete PayTabs checkout from the public booking flow, or confirm payment in your process.
          </p>
        </div>

        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-500">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="px-6 py-10 text-center text-slate-500">No pending payments right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Guest</th>
                  <th className="px-6 py-4 font-medium">Stay</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-semibold text-slate-900">{r.bookingReference}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{r.guest.fullName}</p>
                      <p className="text-slate-500">{r.guest.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(r.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
