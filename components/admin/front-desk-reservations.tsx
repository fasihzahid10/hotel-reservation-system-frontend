'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Building2, RefreshCw, X } from 'lucide-react';
import { QuickBookingForm } from '@/components/admin/quick-booking-form';
import { apiRequest } from '@/lib/api';
import type { Reservation, ReservationStatsSummary, Room, RoomType } from '@/lib/types';
import { formatCurrency, formatDate, formatDateTime, getStatusBadgeClasses } from '@/lib/utils';

const STATUS_TABS = ['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'AVAILABLE'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

function normalizeTab(raw: string | null): StatusTab {
  if (raw && STATUS_TABS.includes(raw as StatusTab)) return raw as StatusTab;
  return 'ALL';
}

function paymentLabel(method: string | null | undefined) {
  if (!method) return '—';
  return method.replaceAll('_', ' ');
}

type FrontDeskReservationPanelProps = {
  /** Sync from URL ?tab= on mount and when it changes */
  syncUrlTab?: boolean;
};

export function FrontDeskReservationPanel({ syncUrlTab = false }: FrontDeskReservationPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<StatusTab>('ALL');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<ReservationStatsSummary | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [quickBookRoomTypeId, setQuickBookRoomTypeId] = useState<string | null>(null);
  const bookingSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadStats = useCallback(async () => {
    const s = await apiRequest<ReservationStatsSummary>('/dashboard/reservation-tab-stats');
    setStats(s);
  }, []);

  const loadRoomTypes = useCallback(async () => {
    const list = await apiRequest<RoomType[]>('/room-types');
    setRoomTypes(list);
  }, []);

  const loadReservations = useCallback(async (t: StatusTab) => {
    if (t === 'AVAILABLE') {
      const list = await apiRequest<Room[]>('/rooms');
      setRooms(list.filter((r) => r.housekeepingStatus === 'AVAILABLE'));
      setReservations([]);
      return;
    }
    const query = t === 'ALL' ? '' : `?status=${encodeURIComponent(t)}`;
    const list = await apiRequest<Reservation[]>(`/reservations${query}`);
    setReservations(list);
    setRooms([]);
  }, []);

  const refresh = useCallback(
    async (t: StatusTab) => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([loadStats(), loadReservations(t)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load data.');
      } finally {
        setLoading(false);
      }
    },
    [loadReservations, loadStats],
  );

  useEffect(() => {
    if (syncUrlTab) {
      const next = normalizeTab(searchParams.get('tab'));
      setTab(next);
    }
  }, [searchParams, syncUrlTab]);

  useEffect(() => {
    if (!syncUrlTab) return;
    const rt = searchParams.get('quickRoomType');
    if (!rt) return;
    setQuickBookRoomTypeId(rt);
    setQuickBookOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('quickRoomType');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, syncUrlTab, pathname, router]);

  useEffect(() => {
    void loadRoomTypes().catch(() => undefined);
  }, [loadRoomTypes]);

  useEffect(() => {
    void refresh(tab);
  }, [tab, refresh]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#quick-book') return;
    const el = document.getElementById('quick-book');
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (bookingSuccessTimerRef.current) {
        clearTimeout(bookingSuccessTimerRef.current);
      }
    };
  }, []);

  function selectTab(next: StatusTab) {
    setTab(next);
    setFeedback('');
    if (syncUrlTab) {
      const params = new URLSearchParams(searchParams.toString());
      if (next === 'ALL') params.delete('tab');
      else params.set('tab', next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }

  async function handleAction(id: string, action: 'check-in' | 'check-out' | 'cancel') {
    setFeedback('');
    try {
      await apiRequest(`/reservations/${id}/${action}`, { method: 'PATCH' });
      setFeedback(`Reservation ${action.replace('-', ' ')} completed.`);
      await refresh(tab);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update reservation.');
    }
  }

  const tabCounts = useMemo(() => {
    const c = stats?.counts ?? {};
    return {
      ALL: Object.values(c).reduce((a, b) => a + b, 0),
      CONFIRMED: c.CONFIRMED ?? 0,
      CHECKED_IN: c.CHECKED_IN ?? 0,
      CHECKED_OUT: c.CHECKED_OUT ?? 0,
      CANCELLED: c.CANCELLED ?? 0,
      AVAILABLE: stats?.availableRooms ?? 0,
    };
  }, [stats]);

  function afterBookingSuccess() {
    if (bookingSuccessTimerRef.current) {
      clearTimeout(bookingSuccessTimerRef.current);
    }
    setFeedback('Booking successful.');
    bookingSuccessTimerRef.current = setTimeout(() => {
      setFeedback('');
      bookingSuccessTimerRef.current = null;
    }, 5500);
    setQuickBookOpen(false);
    setQuickBookRoomTypeId(null);
    void refresh(tab);
  }

  return (
    <div className="space-y-8">
      {quickBookOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-book-modal-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
              onClick={() => {
                setQuickBookOpen(false);
                setQuickBookRoomTypeId(null);
              }}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="quick-book-modal-title" className="pr-10 text-lg font-bold text-slate-900">
              New walk-in / phone booking
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Creates a confirmed reservation. Room type is suggested from the prior stay when opened from a checked-out row.
            </p>
            <div className="mt-6">
              <QuickBookingForm
                key={quickBookRoomTypeId ?? 'default'}
                roomTypes={roomTypes}
                defaultRoomTypeId={quickBookRoomTypeId}
                onSuccess={afterBookingSuccess}
                submitLabel="Book"
                onCancel={() => {
                  setQuickBookOpen(false);
                  setQuickBookRoomTypeId(null);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => selectTab(key)}
            className={`rounded-2xl border px-4 py-3 text-left transition sm:min-w-[140px] ${
              tab === key
                ? 'border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-200'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {key === 'AVAILABLE' ? 'Rooms' : key.replaceAll('_', ' ')}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{tabCounts[key as keyof typeof tabCounts]}</p>
          </button>
        ))}
      </div>

      <section className="card overflow-hidden">
        <div
          id="quick-book"
          className="flex scroll-mt-24 flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {tab === 'AVAILABLE' ? 'Available rooms' : 'Reservation records'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {tab === 'AVAILABLE'
                ? 'Housekeeping-available units — open a row to manage that room.'
                : 'Filter with the tabs above — click a row reference to jump to full list context.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => selectTab('AVAILABLE')}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                tab === 'AVAILABLE'
                  ? 'border-sky-500 bg-sky-50 text-sky-950 ring-1 ring-sky-200'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              Available rooms
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  tab === 'AVAILABLE' ? 'bg-sky-200/80 text-sky-950' : 'bg-slate-200/80 text-slate-800'
                }`}
              >
                {tabCounts.AVAILABLE}
              </span>
            </button>
            <Link
              href="/dashboard/rooms"
              className="button-secondary inline-flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Rooms
            </Link>
            <button
              type="button"
              className="button-primary inline-flex items-center gap-2"
              onClick={() => {
                setQuickBookRoomTypeId(null);
                setQuickBookOpen(true);
              }}
            >
              Book a room
            </button>
            <button type="button" className="button-secondary inline-flex items-center gap-2" onClick={() => refresh(tab)}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {feedback ? (
          <div className="mx-6 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        ) : null}
        {error ? (
          <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          {tab === 'AVAILABLE' ? (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Floor</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={4}>
                      Loading…
                    </td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={4}>
                      No rooms are in Available status right now.
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-semibold text-slate-900">{room.roomNumber}</td>
                      <td className="px-4 py-4 text-slate-600">{room.roomType.name}</td>
                      <td className="px-4 py-4 text-slate-600">{room.floor}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/dashboard/rooms/${room.id}`}
                          className="text-sm font-semibold text-sky-700 hover:text-sky-900"
                        >
                          Open room
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Guest</th>
                  <th className="px-4 py-3 font-medium">Stay</th>
                  <th className="px-4 py-3 font-medium">Booked</th>
                  <th className="px-4 py-3 font-medium">Check-out recorded</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Rooms</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={10}>
                      Loading reservations…
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={10}>
                      No reservations for this filter.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-t border-slate-100 transition hover:bg-sky-50/40"
                    >
                      <td className="px-4 py-4">
                        <Link
                          href={`/dashboard/reservations?tab=${encodeURIComponent(tab === 'ALL' ? 'ALL' : reservation.status)}`}
                          className="font-semibold text-sky-800 hover:underline"
                        >
                          {reservation.bookingReference}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{reservation.guest.fullName}</p>
                        <p className="text-slate-500">{reservation.guest.email}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {reservation.createdAt ? formatDateTime(reservation.createdAt) : '—'}
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDateTime(reservation.checkedOutAt)}</td>
                      <td className="px-4 py-4 text-slate-600">{paymentLabel(reservation.paymentMethod)}</td>
                      <td className="min-w-[10rem] max-w-[14rem] whitespace-normal break-words px-4 py-4 text-slate-600 sm:max-w-[18rem]">
                        {reservation.reservationRooms
                          .map((item) => `${item.room.roomNumber} (${item.room.roomType.name})`)
                          .join(', ')}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {formatCurrency(reservation.totalAmount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`badge ${getStatusBadgeClasses(reservation.status)}`}>
                          {reservation.status.replaceAll('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-[20rem] flex-col gap-1.5">
                          {reservation.status === 'CONFIRMED' || reservation.status === 'PENDING' ? (
                            <button
                              type="button"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                              onClick={() => handleAction(reservation.id, 'check-in')}
                            >
                              Check in
                            </button>
                          ) : null}
                          {reservation.status === 'CHECKED_IN' ? (
                            <button
                              type="button"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                              onClick={() => handleAction(reservation.id, 'check-out')}
                            >
                              Check out
                            </button>
                          ) : null}
                          {['CONFIRMED', 'PENDING'].includes(reservation.status) ? (
                            <button
                              type="button"
                              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50"
                              onClick={() => handleAction(reservation.id, 'cancel')}
                            >
                              Cancel
                            </button>
                          ) : null}
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href="/dashboard/rooms"
                              className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-slate-50"
                            >
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              Rooms
                            </Link>
                            {reservation.status === 'CHECKED_OUT' ? (
                              <button
                                type="button"
                                className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100"
                                onClick={() => {
                                  const tid = reservation.reservationRooms[0]?.room.roomTypeId ?? null;
                                  setQuickBookRoomTypeId(tid);
                                  setQuickBookOpen(true);
                                }}
                              >
                                Book a room
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
