'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, BedDouble, ShieldCheck, Sparkles } from 'lucide-react';
import { PublicNav } from '@/components/public/public-nav';
import { apiRequest } from '@/lib/api';
import type {
  AvailabilitySearchResponse,
  PaymentsConfig,
  PublicReservationResponse,
  RoomType,
} from '@/lib/types';
import { formatCurrency, pluralize } from '@/lib/utils';

type BookingState = {
  checkInDate: string;
  checkOutDate: string;
  roomsRequested: number;
  adults: number;
  children: number;
  roomTypeId: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  notes: string;
};

function suggestedGuestDateRange() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  checkIn.setHours(0, 0, 0, 0);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);
  return {
    checkInDate: checkIn.toISOString().slice(0, 10),
    checkOutDate: checkOut.toISOString().slice(0, 10),
  };
}

const initialBookingState: BookingState = {
  ...suggestedGuestDateRange(),
  roomsRequested: 1,
  adults: 1,
  children: 0,
  roomTypeId: '',
  fullName: '',
  email: '',
  phone: '',
  idNumber: '',
  notes: '',
};

export default function HomePage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableTypes, setAvailableTypes] = useState<RoomType[]>([]);
  const [booking, setBooking] = useState<BookingState>(initialBookingState);
  const [searchError, setSearchError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [createdReservation, setCreatedReservation] = useState<PublicReservationResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paytabsEnabled, setPaytabsEnabled] = useState(false);

  useEffect(() => {
    apiRequest<RoomType[]>('/room-types/public').then(setRoomTypes).catch(() => undefined);
  }, []);

  useEffect(() => {
    apiRequest<PaymentsConfig>('/payments/config')
      .then((c) => setPaytabsEnabled(Boolean(c.paytabs)))
      .catch(() => setPaytabsEnabled(false));
  }, []);

  const selectedRoomType = useMemo(
    () => availableTypes.find((roomType) => roomType.id === booking.roomTypeId),
    [availableTypes, booking.roomTypeId],
  );

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError('');
    setBookingError('');
    setBookingSuccess('');
    setCreatedReservation(null);
    setSearching(true);

    try {
      const params = new URLSearchParams({
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        roomsRequested: String(booking.roomsRequested),
      });

      const data = await apiRequest<AvailabilitySearchResponse | RoomType[]>(
        `/reservations/availability?${params.toString()}`,
      );
      const results = Array.isArray(data) ? data : (data.roomTypes ?? []);
      const hint = Array.isArray(data) ? undefined : data.meta?.hint;
      setAvailableTypes(results);
      if (results.length > 0) {
        setBooking((current) => ({ ...current, roomTypeId: current.roomTypeId || results[0].id }));
        setSearchError('');
      } else {
        setSearchError(
          hint ??
            'No matching rooms are available for the selected dates. Try fewer rooms or different dates.',
        );
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Unable to search availability.');
    } finally {
      setSearching(false);
    }
  }

  async function submitBooking() {
    setBookingError('');
    setBookingSuccess('');
    setSubmitting(true);

    try {
      const payload = paytabsEnabled ? { ...booking, withPayment: true as const } : booking;

      const reservation = await apiRequest<PublicReservationResponse>('/reservations/public', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (reservation.payment?.redirectUrl) {
        window.location.assign(reservation.payment.redirectUrl);
        return;
      }

      setCreatedReservation(reservation);
      setBookingSuccess(`Reservation confirmed. Your reference is ${reservation.bookingReference}.`);
      setBooking({
        ...initialBookingState,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        roomsRequested: 1,
      });
      setAvailableTypes([]);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Unable to create reservation.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleBookingFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitBooking();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <PublicNav />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.25),_transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Modern hotel booking, operations, and front desk control
              </p>
              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Manage guest stays with a polished, real-world reservation platform.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-blue-100">
                Search availability, confirm reservations, and give your staff a reliable dashboard for rooms, arrivals,
                departures, and daily operations.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Real-time availability', icon: <CalendarDays className="h-5 w-5" /> },
                  { label: 'Room inventory control', icon: <BedDouble className="h-5 w-5" /> },
                  { label: 'Secure staff access', icon: <ShieldCheck className="h-5 w-5" /> },
                ].map((feature) => (
                  <div key={feature.label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="mb-3 text-blue-200">{feature.icon}</div>
                    <p className="font-semibold">{feature.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 lg:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Check availability</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Book your next stay</h2>
                <p className="mt-2 text-sm text-slate-500">Search by dates and choose from available room types.</p>
                <p className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-800">Tip:</span> Check-in / check-out default to about{' '}
                  <strong>one week from today</strong> so you usually get matches after running{' '}
                  <code className="rounded bg-white px-1 py-0.5 text-[11px]">prisma:seed</code>. If nothing appears, try{' '}
                  <strong>1 room</strong> or dates further out — the demo booking may occupy one room in a narrow window.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Check-in</label>
                    <input className="input" type="date" required value={booking.checkInDate}
                      onChange={(event) => setBooking((current) => ({ ...current, checkInDate: event.target.value }))}/>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Check-out</label>
                    <input className="input" type="date" required value={booking.checkOutDate}
                      onChange={(event) => setBooking((current) => ({ ...current, checkOutDate: event.target.value }))}/>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Rooms required</label>
                  <select className="select" value={booking.roomsRequested}
                    onChange={(event) => setBooking((current) => ({ ...current, roomsRequested: Number(event.target.value) }))}>
                    {[1, 2, 3].map((count) => (
                      <option key={count} value={count}>{pluralize(count, 'room')}</option>
                    ))}
                  </select>
                </div>

                {searchError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchError}</div>
                ) : null}

                <button className="button-primary w-full" disabled={searching}>
                  {searching ? 'Searching...' : 'Search availability'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Stay categories</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Room types</h2>
            <p className="mt-2 text-slate-500">These are available in the property inventory and ready for booking searches.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {roomTypes.map((roomType) => (
              <article key={roomType.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{roomType.name}</h3>
                    <p className="mt-2 text-sm text-slate-500">{roomType.description}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                    {formatCurrency(roomType.basePrice)}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {roomType.amenities.map((amenity) => (
                    <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {amenity}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm font-medium text-slate-600">Capacity: {pluralize(roomType.capacity, 'guest')}</p>
              </article>
            ))}
          </div>
        </section>

        {availableTypes.length > 0 ? (
          <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 lg:grid-cols-[1fr_0.95fr]">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Available now</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Choose your room type</h2>
                <p className="mt-2 text-slate-500">Availability reflects overlapping reservations and rooms under maintenance.</p>
              </div>

              <div className="space-y-4">
                {availableTypes.map((roomType) => {
                  const selected = booking.roomTypeId === roomType.id;
                  return (
                    <button key={roomType.id} type="button"
                      onClick={() => setBooking((current) => ({ ...current, roomTypeId: roomType.id }))}
                      className={`card w-full p-5 text-left transition ${selected ? 'border-blue-600 ring-2 ring-blue-100' : ''}`}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{roomType.name}</h3>
                          <p className="mt-2 text-sm text-slate-500">{roomType.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {roomType.amenities.map((amenity) => (
                              <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-lg font-bold text-slate-900">{formatCurrency(roomType.basePrice)} / night</p>
                          <p className="mt-2 text-sm text-emerald-600">{roomType.availableCount} rooms available</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card h-fit p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Confirm booking</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Guest information</h2>
              </div>

              <form onSubmit={handleBookingFormSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                    <input className="input" required value={booking.fullName}
                      onChange={(event) => setBooking((current) => ({ ...current, fullName: event.target.value }))}/>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                    <input className="input" type="email" required value={booking.email}
                      onChange={(event) => setBooking((current) => ({ ...current, email: event.target.value }))}/>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                    <input className="input" value={booking.phone}
                      onChange={(event) => setBooking((current) => ({ ...current, phone: event.target.value }))}/>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Government ID</label>
                    <input className="input" value={booking.idNumber}
                      onChange={(event) => setBooking((current) => ({ ...current, idNumber: event.target.value }))}/>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Adults</label>
                    <input className="input" type="number" min={1} max={10} value={booking.adults}
                      onChange={(event) => setBooking((current) => ({ ...current, adults: Number(event.target.value) }))}/>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Children</label>
                    <input className="input" type="number" min={0} max={10} value={booking.children}
                      onChange={(event) => setBooking((current) => ({ ...current, children: Number(event.target.value) }))}/>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Rooms</label>
                    <input className="input" type="number" min={1} max={5} value={booking.roomsRequested}
                      onChange={(event) => setBooking((current) => ({ ...current, roomsRequested: Number(event.target.value) }))}/>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                  <textarea className="input min-h-[120px]" value={booking.notes}
                    onChange={(event) => setBooking((current) => ({ ...current, notes: event.target.value }))}/>
                </div>

                {selectedRoomType ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{selectedRoomType.name}</p>
                    <p className="mt-1 text-slate-600">Starting from {formatCurrency(selectedRoomType.basePrice)} per night</p>
                  </div>
                ) : null}

                {bookingError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{bookingError}</div>
                ) : null}

                {bookingSuccess ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{bookingSuccess}</div>
                ) : null}

                {paytabsEnabled ? (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
                    Secure checkout runs on PayTabs. Depending on your PayTabs merchant profile, customers may see{' '}
                    <strong>Apple Pay</strong>, cards, and regional wallets (for example <strong>STC Pay</strong> when enabled
                    in PayTabs).
                  </p>
                ) : null}

                <button className="button-primary w-full" disabled={submitting} type="submit">
                  {submitting
                    ? paytabsEnabled
                      ? 'Starting checkout…'
                      : 'Confirming...'
                    : paytabsEnabled
                      ? 'Proceed to secure payment'
                      : 'Confirm reservation'}
                </button>
              </form>

              {createdReservation ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Booking reference: {createdReservation.bookingReference}</p>
                  <p className="mt-2">
                    Reserved for {createdReservation.guest.fullName} from {createdReservation.checkInDate.slice(0, 10)} to {createdReservation.checkOutDate.slice(0, 10)}.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
