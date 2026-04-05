'use client';

import { useEffect, useState } from 'react';
import { BedDouble, CalendarCheck2, DollarSign, Hotel, Users } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { apiRequest } from '@/lib/api';
import type { DashboardSummary } from '@/lib/types';
import { formatCurrency, formatDate, getStatusBadgeClasses } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<DashboardSummary>('/dashboard/summary')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard.'));
  }, []);

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-700">{error}</div>;
  }

  if (!data) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Summary</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Today’s operations</h1>
        <p className="mt-2 text-slate-500">A live snapshot of availability, departures, arrivals, and active stays.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupancy" value={`${data.kpis.occupancyRate}%`}
          helper={`${data.kpis.occupiedRooms} occupied of ${data.kpis.totalRooms} total rooms`}
          icon={<Hotel className="h-5 w-5" />} />
        <StatCard label="Available rooms" value={String(data.kpis.availableRooms)}
          helper="Ready for new or upcoming reservations" icon={<BedDouble className="h-5 w-5" />} />
        <StatCard label="Arrivals / departures" value={`${data.kpis.arrivalsToday} / ${data.kpis.departuresToday}`}
          helper="Scheduled for today" icon={<CalendarCheck2 className="h-5 w-5" />} />
        <StatCard label="Month revenue" value={formatCurrency(data.kpis.monthRevenue)}
          helper={`${data.kpis.activeReservations} currently active reservations`} icon={<DollarSign className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">Recent reservations</h2>
            <p className="mt-1 text-sm text-slate-500">The latest bookings created in the system.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Guest</th>
                  <th className="px-6 py-4 font-medium">Stay</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-semibold text-slate-900">{reservation.bookingReference}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{reservation.guest.fullName}</p>
                      <p className="text-slate-500">{reservation.guest.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(reservation.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadgeClasses(reservation.status)}`}>
                        {reservation.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-blue-50 p-3 text-blue-700"><Users className="h-5 w-5" /></span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Operational tips</h2>
              <p className="text-sm text-slate-500">Suggested defaults for the seeded setup.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              After a guest checks out, rooms move to <strong>CLEANING</strong>. Staff can change them back to <strong>AVAILABLE</strong> from the Rooms page once prepared.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Reservation availability is based on overlapping dates, so future bookings do not block rooms permanently.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Use the seeded admin account first, then create your own operational users directly in the database or extend the user management module.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
