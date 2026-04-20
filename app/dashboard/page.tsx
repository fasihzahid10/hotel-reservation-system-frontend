'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BedDouble, CalendarCheck2, CalendarDays, DollarSign, KeyRound, LogIn } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { MetricCard } from '@/components/admin/metric-card';
import { apiRequest } from '@/lib/api';
import type { DashboardSummary, User } from '@/lib/types';
import { canViewFinancialSummary } from '@/lib/permissions';
import { formatCurrency, formatDate, formatDateTime, getStatusBadgeClasses } from '@/lib/utils';

const DONUT_COLORS = {
  Available: '#10b981',
  Occupied: '#f59e0b',
  Reserved: '#6366f1',
  Maintenance: '#ef4444',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiRequest<User>('/auth/me'), apiRequest<DashboardSummary>('/dashboard/summary')])
      .then(([me, summary]) => {
        setUser(me);
        setData(summary);
        setError('');
      })
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
  const showMoney = canViewFinancialSummary(user);

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-700">{error}</div>;
  }

  if (!data) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  const todayLabel = formatDate(new Date().toISOString());
  const totalRevenue = data.kpis.totalRevenue ?? data.kpis.monthRevenue;
  const txCount = data.kpis.transactionCount ?? 0;
  const booked = data.kpis.bookedRooms ?? 0;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">Welcome back. Here&apos;s your hotel overview.</p>
      </section>

      <section
        className={`grid gap-4 sm:grid-cols-2 ${showMoney ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}
      >
        <MetricCard
          label="Total Rooms"
          value={String(data.kpis.totalRooms)}
          helper={`${data.kpis.occupiedRooms} occupied`}
          icon={<BedDouble className="h-5 w-5" strokeWidth={1.75} />}
          href="/dashboard/rooms"
        />
        <MetricCard
          label="Booked rooms"
          value={String(booked)}
          helper="Active stay allocations (confirmed / in-house)"
          icon={<KeyRound className="h-5 w-5" strokeWidth={1.75} />}
          href="/dashboard/reservations?tab=CHECKED_IN"
        />
        <MetricCard
          label="Today's Check-ins"
          value={String(data.kpis.arrivalsToday)}
          helper={todayLabel}
          icon={<LogIn className="h-5 w-5" strokeWidth={1.75} />}
          href="/dashboard/check-in?tab=CONFIRMED"
        />
        <MetricCard
          label="Active Reservations"
          value={String(data.kpis.activeReservations)}
          helper="Confirmed & checked in"
          icon={<CalendarDays className="h-5 w-5" strokeWidth={1.75} />}
          href="/dashboard/reservations?tab=ALL"
        />
        {showMoney ? (
          <MetricCard
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            helper={`${txCount} transaction${txCount === 1 ? '' : 's'}`}
            icon={<DollarSign className="h-5 w-5" strokeWidth={1.75} />}
            href="/dashboard/reports"
          />
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Link
          href="/dashboard/rooms"
          className="block rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] transition hover:border-sky-300/50 hover:shadow-md"
        >
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
            <p className="mt-4 text-center text-xs font-medium text-sky-700">Open rooms →</p>
          </div>
        </Link>

        <Link
          href="/dashboard/check-in"
          className="block rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] transition hover:border-sky-300/50 hover:shadow-md"
        >
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
          <p className="mt-2 text-center text-xs font-medium text-sky-700">Front desk workspace →</p>
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-display text-xl font-bold text-slate-900">Reservation history</h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest bookings with recorded check-out times. Open reservations for full actions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Guest</th>
                  <th className="px-6 py-4 font-medium">Stay</th>
                  <th className="px-6 py-4 font-medium">Booked</th>
                  <th className="px-6 py-4 font-medium">Check-out</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-t border-slate-100 transition hover:bg-sky-50/30"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/reservations?tab=${encodeURIComponent(reservation.status)}`}
                        className="font-semibold text-sky-800 hover:underline"
                      >
                        {reservation.bookingReference}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{reservation.guest.fullName}</p>
                      <p className="text-slate-500">{reservation.guest.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {reservation.createdAt ? formatDateTime(reservation.createdAt) : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(reservation.checkedOutAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatCurrency(reservation.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadgeClasses(reservation.status)}`}>
                        {reservation.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex w-[9.5rem] flex-col gap-1.5">
                        <Link
                          href="/dashboard/reservations"
                          className="text-sm font-semibold text-sky-700 hover:text-sky-900"
                        >
                          Manage →
                        </Link>
                        {reservation.status === 'CHECKED_OUT' &&
                        reservation.reservationRooms[0]?.room.roomTypeId ? (
                          <Link
                            href={`/dashboard/reservations?tab=CHECKED_OUT&quickRoomType=${encodeURIComponent(
                              reservation.reservationRooms[0].room.roomTypeId,
                            )}#quick-book`}
                            className="inline-flex items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-center text-xs font-semibold text-sky-900 hover:bg-sky-100"
                          >
                            Book a room
                          </Link>
                        ) : null}
                      </div>
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
            {showMoney ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                This month&apos;s recorded revenue: <strong>{formatCurrency(data.kpis.monthRevenue)}</strong>.
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <strong>{booked}</strong> room nights are tied to active reservations. Open{' '}
                <Link href="/dashboard/reservations" className="font-semibold text-sky-800 underline">
                  Reservations
                </Link>{' '}
                for check-in and check-out.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
