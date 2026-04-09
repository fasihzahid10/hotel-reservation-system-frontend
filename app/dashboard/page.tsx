'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  DollarSign,
  LogIn,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { MetricCard } from '@/components/admin/metric-card';
import { apiRequest } from '@/lib/api';
import type { DashboardSummary } from '@/lib/types';
import { formatCurrency, formatDate, getStatusBadgeClasses } from '@/lib/utils';

const DONUT_COLORS = {
  Available: '#10b981',
  Occupied: '#f59e0b',
  Reserved: '#6366f1',
  Maintenance: '#ef4444',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<DashboardSummary>('/dashboard/summary')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard.'));
  }, []);

  const occupancyData = useMemo(() => {
    const b = data?.kpis.roomStatusBreakdown;
    if (!b) {
      return [
        { name: 'Available', value: data?.kpis.availableRooms ?? 0 },
        { name: 'Occupied', value: data?.kpis.occupiedRooms ?? 0 },
        { name: 'Reserved', value: 0 },
        { name: 'Maintenance', value: 0 },
      ];
    }
    return [
      { name: 'Available', value: b.available },
      { name: 'Occupied', value: b.occupied },
      { name: 'Reserved', value: b.reserved },
      { name: 'Maintenance', value: b.maintenance },
    ];
  }, [data]);

  const totalSlices = occupancyData.reduce((s, x) => s + x.value, 0);

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-700">{error}</div>;
  }

  if (!data) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  const todayLabel = formatDate(new Date().toISOString());
  const totalRevenue = data.kpis.totalRevenue ?? data.kpis.monthRevenue;
  const txCount = data.kpis.transactionCount ?? 0;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">Welcome back. Here&apos;s your hotel overview.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Rooms"
          value={String(data.kpis.totalRooms)}
          helper={`${data.kpis.occupiedRooms} occupied`}
          icon={<BedDouble className="h-5 w-5" strokeWidth={1.75} />}
        />
        <MetricCard
          label="Today's Check-ins"
          value={String(data.kpis.arrivalsToday)}
          helper={todayLabel}
          icon={<LogIn className="h-5 w-5" strokeWidth={1.75} />}
        />
        <MetricCard
          label="Active Reservations"
          value={String(data.kpis.activeReservations)}
          helper="Confirmed & checked in"
          icon={<CalendarDays className="h-5 w-5" strokeWidth={1.75} />}
        />
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          helper={`${txCount} transaction${txCount === 1 ? '' : 's'}`}
          icon={<DollarSign className="h-5 w-5" strokeWidth={1.75} />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <h2 className="font-display text-lg font-bold text-slate-900">Room Occupancy</h2>
          <div className="mt-6 flex flex-col items-center">
            <div className="h-56 w-full max-w-[280px]">
              {totalSlices === 0 ? (
                <p className="pt-20 text-center text-sm text-slate-500">No rooms to display yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {occupancyData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={DONUT_COLORS[entry.name as keyof typeof DONUT_COLORS]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, 'Rooms']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-600">
              {occupancyData.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{
                      backgroundColor: DONUT_COLORS[d.name as keyof typeof DONUT_COLORS],
                    }}
                  />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <h2 className="font-display text-lg font-bold text-slate-900">Today&apos;s Activity</h2>
          <div className="mt-6 min-h-[200px]">
            {(data.todayActivity ?? []).length > 0 ? (
              <ul className="space-y-3 text-sm text-slate-600">
                {(data.todayActivity ?? []).map((item) => (
                  <li key={item.id} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0">
                    <span className="text-xs text-slate-400">
                      {new Date(item.at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex min-h-[180px] items-center justify-center text-center text-slate-400">
                No activity yet today
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-display text-xl font-bold text-slate-900">Recent reservations</h2>
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
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatCurrency(reservation.totalAmount)}
                    </td>
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
            <span className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">At a glance</h2>
              <p className="text-sm text-slate-500">Departures today: {data.kpis.departuresToday}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Occupancy rate is <strong>{data.kpis.occupancyRate}%</strong> with{' '}
              <strong>{data.kpis.availableRooms}</strong> rooms available for sale.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              This month&apos;s recorded revenue: <strong>{formatCurrency(data.kpis.monthRevenue)}</strong>.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
