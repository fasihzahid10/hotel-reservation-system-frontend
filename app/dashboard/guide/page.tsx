import { BedDouble, CalendarDays } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <h1 className="font-display text-3xl font-bold text-[#0c1528]">User Guide</h1>
        <p className="mt-2 text-slate-500">
          Quick steps for booking and room management in HotelHub.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CalendarDays className="h-6 w-6" />
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900">Booking Engine</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            9 steps
          </span>
        </div>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600">
          <li>Click &quot;New booking&quot; (or use the public site) to open the booking form.</li>
          <li>Select a customer from the guest list — guest details can be reused across stays.</li>
          <li>Choose check-in and check-out dates. The system calculates nights automatically.</li>
          <li>Select a room type, then pick from available rooms for that type.</li>
          <li>Double-booking prevention runs automatically — conflicts block the booking with a warning.</li>
          <li>Set booking status (active, upcoming, completed, cancelled, no-show) and payment status.</li>
          <li>Total amount is typically nights × price per night (plus any fees your property configures).</li>
          <li>Use search and status filters on the Reservations page to find bookings quickly.</li>
          <li>Edit or cancel bookings from the reservation row actions where your role allows.</li>
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <BedDouble className="h-6 w-6" />
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900">Room Management</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            7 steps
          </span>
        </div>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600">
          <li>View all rooms on the Rooms page as visual cards, organized by floor in the table below.</li>
          <li>Each card shows room number, type, capacity, price, status, and amenities.</li>
          <li>Save an optional photo URL on a card to show a real photo; otherwise a generic image is used.</li>
          <li>Add new rooms with the &quot;Add Room&quot; button and link them to a room type.</li>
          <li>Filter rooms by type using the dropdown at the top of the Rooms page.</li>
          <li>
            Room statuses include Available, Occupied, Cleaning, Maintenance, and Out of service — aligned
            with housekeeping workflow.
          </li>
          <li>Rooms in maintenance or out of service should be excluded from new assignments.</li>
        </ol>
      </section>
    </div>
  );
}
