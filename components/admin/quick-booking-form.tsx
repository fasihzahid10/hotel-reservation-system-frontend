'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { RoomType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export type QuickBookingFormProps = {
  roomTypes: RoomType[];
  /** When opening from a reservation row, pre-select that room type. */
  defaultRoomTypeId?: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function QuickBookingForm({
  roomTypes,
  defaultRoomTypeId,
  onSuccess,
  onCancel,
  submitLabel = 'Create booking',
}: QuickBookingFormProps) {
  const [booking, setBooking] = useState({
    checkInDate: '',
    checkOutDate: '',
    roomTypeId: '',
    roomsRequested: 1,
    fullName: '',
    email: '',
    phone: '',
    adults: 2,
    children: 0,
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'ONLINE_TRANSFER',
  });
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (roomTypes.length === 0) return;
    const pick =
      defaultRoomTypeId && roomTypes.some((r) => r.id === defaultRoomTypeId)
        ? defaultRoomTypeId
        : roomTypes[0].id;
    setBooking((b) => ({ ...b, roomTypeId: pick }));
  }, [roomTypes, defaultRoomTypeId]);

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault();
    setLocalError('');
    if (!booking.checkInDate || !booking.checkOutDate || !booking.roomTypeId) {
      setLocalError('Choose dates and a room type.');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          roomTypeId: booking.roomTypeId,
          roomsRequested: booking.roomsRequested,
          fullName: booking.fullName,
          email: booking.email,
          phone: booking.phone || undefined,
          adults: booking.adults,
          children: booking.children,
          paymentMethod: booking.paymentMethod,
          withPayment: false,
        }),
      });
      onSuccess();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to create booking.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submitBooking} className="grid gap-4 lg:grid-cols-2">
      {localError ? (
        <div className="lg:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {localError}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Check-in</label>
          <input
            type="date"
            className="input"
            required
            value={booking.checkInDate}
            onChange={(e) => setBooking((b) => ({ ...b, checkInDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Check-out</label>
          <input
            type="date"
            className="input"
            required
            value={booking.checkOutDate}
            onChange={(e) => setBooking((b) => ({ ...b, checkOutDate: e.target.value }))}
          />
        </div>
      </div>
      <div className="lg:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">Room type</label>
        <select
          className="select"
          required
          value={booking.roomTypeId}
          onChange={(e) => setBooking((b) => ({ ...b, roomTypeId: e.target.value }))}
        >
          <option value="">Select type</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name} — from {formatCurrency(rt.basePrice)}/night
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Rooms</label>
          <input
            type="number"
            min={1}
            max={5}
            className="input"
            value={booking.roomsRequested}
            onChange={(e) => setBooking((b) => ({ ...b, roomsRequested: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Payment</label>
          <select
            className="select"
            value={booking.paymentMethod}
            onChange={(e) =>
              setBooking((b) => ({
                ...b,
                paymentMethod: e.target.value as typeof b.paymentMethod,
              }))
            }
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="ONLINE_TRANSFER">Online transfer</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Guest name</label>
        <input
          className="input"
          required
          value={booking.fullName}
          onChange={(e) => setBooking((b) => ({ ...b, fullName: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          className="input"
          required
          value={booking.email}
          onChange={(e) => setBooking((b) => ({ ...b, email: e.target.value }))}
        />
      </div>
      <div className="lg:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">Phone (optional)</label>
        <input
          className="input"
          value={booking.phone}
          onChange={(e) => setBooking((b) => ({ ...b, phone: e.target.value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Adults</label>
          <input
            type="number"
            min={1}
            max={10}
            className="input"
            value={booking.adults}
            onChange={(e) => setBooking((b) => ({ ...b, adults: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Children</label>
          <input
            type="number"
            min={0}
            max={10}
            className="input"
            value={booking.children}
            onChange={(e) => setBooking((b) => ({ ...b, children: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 lg:col-span-2">
        <button type="submit" className="button-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="button-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
