'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Reservation } from '@/lib/types';
import { formatCurrency, formatDate, getStatusBadgeClasses } from '@/lib/utils';

const statusOptions = ['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function loadReservations(selectedStatus = status) {
    setLoading(true);
    const query = selectedStatus !== 'ALL' ? `?status=${encodeURIComponent(selectedStatus)}` : '';

    try {
      const result = await apiRequest<Reservation[]>(`/reservations${query}`);
      setReservations(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load reservations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function handleAction(id: string, action: 'check-in' | 'check-out' | 'cancel') {
    setFeedback('');
    try {
      await apiRequest(`/reservations/${id}/${action}`, { method: 'PATCH' });
      setFeedback(`Reservation ${action.replace('-', ' ')} completed successfully.`);
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update reservation.');
    }
  }

  const counts = useMemo(() => reservations.reduce<Record<string, number>>((acc, reservation) => {
    acc[reservation.status] = (acc[reservation.status] ?? 0) + 1;
    return acc;
  }, {}), [reservations]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Reservations</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Booking lifecycle</h1>
        <p className="mt-2 text-slate-500">Monitor upcoming stays and manage check-in, check-out, or cancellations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statusOptions.filter((option) => option !== 'ALL').map((option) => (
          <div key={option} className="card p-4">
            <p className="text-sm text-slate-500">{option.replaceAll('_', ' ')}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{counts[option] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reservation records</h2>
            <p className="mt-1 text-sm text-slate-500">Use filters and quick actions for front desk operations.</p>
          </div>
          <div className="flex gap-3">
            <select className="select min-w-[220px]" value={status}
              onChange={async (event) => {
                const nextStatus = event.target.value;
                setStatus(nextStatus);
                await loadReservations(nextStatus);
              }}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'ALL' ? 'All statuses' : option.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            <button className="button-secondary" onClick={() => loadReservations()}>Refresh</button>
          </div>
        </div>

        {feedback ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Stay</th>
                <th className="px-4 py-3 font-medium">Rooms</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-5 text-slate-500" colSpan={7}>Loading reservations...</td></tr>
              ) : reservations.length === 0 ? (
                <tr><td className="px-4 py-5 text-slate-500" colSpan={7}>No reservations found.</td></tr>
              ) : reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-semibold text-slate-900">{reservation.bookingReference}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{reservation.guest.fullName}</p>
                    <p className="text-slate-500">{reservation.guest.email}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {reservation.reservationRooms.map((item) => `${item.room.roomNumber} (${item.room.roomType.name})`).join(', ')}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900">{formatCurrency(reservation.totalAmount)}</td>
                  <td className="px-4 py-4">
                    <span className={`badge ${getStatusBadgeClasses(reservation.status)}`}>{reservation.status.replaceAll('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {reservation.status === 'CONFIRMED' ? <button className="button-secondary px-3 py-2" onClick={() => handleAction(reservation.id, 'check-in')}>Check in</button> : null}
                      {reservation.status === 'CHECKED_IN' ? <button className="button-secondary px-3 py-2" onClick={() => handleAction(reservation.id, 'check-out')}>Check out</button> : null}
                      {['CONFIRMED', 'PENDING'].includes(reservation.status) ? <button className="button-secondary px-3 py-2" onClick={() => handleAction(reservation.id, 'cancel')}>Cancel</button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
