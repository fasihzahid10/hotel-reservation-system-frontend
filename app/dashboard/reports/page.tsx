'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BedDouble,
  Calendar,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import type { ReportsAnalytics, User } from '@/lib/types';
import { canViewReports } from '@/lib/permissions';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [data, setData] = useState<ReportsAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await apiRequest<User>('/auth/me');
        if (cancelled) return;
        if (!canViewReports(u)) {
          setError('Reports and revenue analytics are only available to super administrators.');
          return;
        }
        const report = await apiRequest<ReportsAnalytics>('/reports/analytics');
        if (!cancelled) setData(report);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load reports.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lineData = useMemo(() => {
    if (!data?.revenueLast30Days) return [];
    return data.revenueLast30Days.map((d) => ({
      ...d,
      label: d.date.slice(5).replace('-', '/'),
    }));
  }, [data]);

  const barColors = ['#1e3a5f', '#eab308', '#14b8a6', '#ea580c'];

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-slate-500">Loading reports...</div>;
  }

  const ex = data.executive;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl font-bold text-[#0c1528]">Reports &amp; Analytics</h1>
        <p className="mt-2 text-slate-500">
          Comprehensive performance insights and productivity metrics.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <BedDouble className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Occupancy Rate</p>
            <p className="font-display text-2xl font-bold text-[#0c1528]">{data.kpis.occupancyRate}%</p>
          </div>
        </div>
        <div className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg Stay Length</p>
            <p className="font-display text-2xl font-bold text-[#0c1528]">
              {data.kpis.avgStayLengthNights} nights
            </p>
          </div>
        </div>
        <div className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg Revenue/Room</p>
            <p className="font-display text-2xl font-bold text-[#0c1528]">
              {formatCurrency(data.kpis.avgRevenuePerRoom)}
            </p>
          </div>
        </div>
        <div className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">No-shows / Cancels</p>
            <p className="font-display text-2xl font-bold text-[#0c1528]">
              {data.kpis.noShows} / {data.kpis.cancels}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        <h2 className="font-display text-lg font-bold text-[#0c1528]">Revenue (Last 30 Days)</h2>
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                contentStyle={{ borderRadius: 12 }}
              />
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <h2 className="font-display text-lg font-bold text-slate-900">Staff Productivity</h2>
          <p className="mt-8 text-center text-slate-400">No staff activity recorded yet</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <h2 className="font-display text-lg font-bold text-slate-900">Financial Integrity</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-[#f4f7f9] p-4">
              <h3 className="text-sm font-bold text-[#1a2b48]">Unpaid Reservations</h3>
              <p className="mt-2 text-sm text-[#707070]">{data.financialIntegrity.unpaidMessage}</p>
            </div>
            <div className="rounded-xl bg-[#f4f7f9] p-4">
              <h3 className="text-sm font-bold text-[#1a2b48]">Audit Summary</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#707070]">Total Transactions</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {data.financialIntegrity.auditSummary.totalTransactions}
                  </p>
                </div>
                <div>
                  <p className="text-[#707070]">Cash Payments</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {data.financialIntegrity.auditSummary.cashPayments}
                  </p>
                </div>
                <div>
                  <p className="text-[#707070]">Card Payments</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {data.financialIntegrity.auditSummary.cardPayments}
                  </p>
                </div>
                <div>
                  <p className="text-[#707070]">Activity Logs</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {data.financialIntegrity.auditSummary.activityLogs}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-[#0c1528]">Executive Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Grand Palace Hotel — high-level KPIs and trends</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Bookings', value: String(ex.totalBookings), bg: 'bg-sky-100/90' },
            { label: 'Active Bookings', value: String(ex.activeBookings), bg: 'bg-emerald-100/90' },
            { label: 'Total Revenue', value: formatCurrency(ex.totalRevenue), bg: 'bg-orange-100/90' },
            { label: 'Avg / Booking', value: formatCurrency(ex.avgPerBooking), bg: 'bg-violet-100/90' },
            { label: 'Completed', value: String(ex.completed), bg: 'bg-teal-100/90' },
            { label: 'Available Rooms', value: String(ex.availableRooms), bg: 'bg-slate-200/90' },
            { label: 'Occupancy Rate', value: `${ex.occupancyRate}%`, bg: 'bg-lime-100/90' },
            { label: 'Total Guests', value: String(ex.totalGuests), bg: 'bg-amber-100/90' },
          ].map((k) => (
            <div
              key={k.label}
              className={`rounded-xl px-4 py-4 ${k.bg} shadow-sm`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{k.label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
            <h3 className="font-display text-lg font-bold text-[#0c1528]">Monthly Revenue &amp; Occupancy</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={ex.monthlyRevenueOccupancy}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    fill="#fef08a"
                    stroke="#ca8a04"
                    fillOpacity={0.35}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#2563eb"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Occupancy %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
            <h3 className="font-display text-lg font-bold text-[#0c1528]">Revenue by Room Type (YTD)</h3>
            <div className="mt-6 h-72">
              {ex.revenueByRoomTypeYtd.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-slate-400">
                  No YTD revenue by room type yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ex.revenueByRoomTypeYtd}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{ borderRadius: 12 }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {ex.revenueByRoomTypeYtd.map((row, i) => (
                        <Cell key={row.name} fill={barColors[i % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        <h2 className="font-display text-lg font-bold text-[#0c1528]">Revenue by room type (detail)</h2>
        <div className="mt-6 h-64">
          {data.revenueByRoomType.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-slate-400">
              No revenue by room type in this period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByRoomType}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="revenue" fill="#1e3a5f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
