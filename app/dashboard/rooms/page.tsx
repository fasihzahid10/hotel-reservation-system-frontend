'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { resolveRoomTypeImageUrl } from '@/lib/room-type-placeholders';
import type { Room, RoomType } from '@/lib/types';
import { formatCurrency, getStatusBadgeClasses } from '@/lib/utils';

const statusOptions = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE'];

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    capacity: 2,
    basePrice: 100,
    amenities: 'Wi-Fi, Smart TV',
    imageUrl: '',
  });
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: 1,
    roomTypeId: '',
    housekeepingStatus: 'AVAILABLE',
    imageUrl: '',
  });

  async function loadData() {
    try {
      const [roomTypesResult, roomsResult] = await Promise.all([
        apiRequest<RoomType[]>('/room-types'),
        apiRequest<Room[]>('/rooms'),
      ]);
      setRoomTypes(roomTypesResult);
      setRooms(roomsResult);
      setError('');
      if (!roomForm.roomTypeId && roomTypesResult.length > 0) {
        setRoomForm((current) => ({ ...current, roomTypeId: roomTypesResult[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load room data.');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredRooms = useMemo(() => {
    if (typeFilter === 'all') return rooms;
    return rooms.filter((r) => r.roomTypeId === typeFilter);
  }, [rooms, typeFilter]);

  async function createRoomType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('');
    try {
      const body: Record<string, unknown> = {
        name: roomTypeForm.name,
        description: roomTypeForm.description,
        capacity: roomTypeForm.capacity,
        basePrice: roomTypeForm.basePrice,
        amenities: roomTypeForm.amenities.split(',').map((item) => item.trim()).filter(Boolean),
      };
      if (roomTypeForm.imageUrl.trim()) {
        body.imageUrl = roomTypeForm.imageUrl.trim();
      }
      await apiRequest('/room-types', { method: 'POST', body: JSON.stringify(body) });
      setRoomTypeForm({
        name: '',
        description: '',
        capacity: 2,
        basePrice: 100,
        amenities: 'Wi-Fi, Smart TV',
        imageUrl: '',
      });
      setFeedback('Room type created successfully.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create room type.');
    }
  }

  async function createRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('');
    try {
      const body: Record<string, unknown> = {
        roomNumber: roomForm.roomNumber,
        floor: roomForm.floor,
        roomTypeId: roomForm.roomTypeId,
        housekeepingStatus: roomForm.housekeepingStatus,
      };
      if (roomForm.imageUrl.trim()) {
        body.imageUrl = roomForm.imageUrl.trim();
      }
      await apiRequest('/rooms', { method: 'POST', body: JSON.stringify(body) });
      setRoomForm((prev) => ({
        roomNumber: '',
        floor: 1,
        roomTypeId: prev.roomTypeId || roomTypes[0]?.id || '',
        housekeepingStatus: 'AVAILABLE',
        imageUrl: '',
      }));
      setFeedback('Room added successfully.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create room.');
    }
  }

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0c1528]">Rooms</h1>
          <p className="mt-1 text-sm text-slate-500">Browse categories, then open a room for details and housekeeping.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="select max-w-[220px]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All rooms</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
          <a
            href="#admin"
            className="button-primary inline-flex items-center gap-2 rounded-xl bg-[#0c1528] px-5 py-3 text-white hover:bg-[#152a45]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add room / type
          </a>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Room type catalog</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {roomTypes.map((roomType) => {
            const img = resolveRoomTypeImageUrl(roomType.imageUrl, roomType.id);
            return (
              <article
                key={roomType.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 ring-1 ring-inset ring-black/[0.04]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-blue-700 shadow-sm ring-1 ring-slate-200/80">
                    {formatCurrency(roomType.basePrice)}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-base font-extrabold text-[#0c1528]">{roomType.name}</h3>
                  <p className="line-clamp-3 text-sm text-slate-600">{roomType.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {roomType.amenities.slice(0, 5).map((a) => (
                      <span
                        key={a}
                        className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/80"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="pt-2 text-xs text-slate-500">
                    Capacity: {roomType.capacity} guests · Rooms: {roomType._count?.rooms ?? 0}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">All rooms</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'}
            {typeFilter !== 'all' ? ' in this filter' : ''} — select a row to open details.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Floor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-28" />
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/rooms/${room.id}`}
                      className="font-semibold text-[#0c1528] hover:underline"
                    >
                      Room {room.roomNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{room.roomType.name}</td>
                  <td className="px-4 py-3 text-slate-600">{room.floor}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusBadgeClasses(room.housekeepingStatus)}`}>
                      {room.housekeepingStatus.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/rooms/${room.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900"
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRooms.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">No rooms match this filter.</p>
        ) : null}
      </section>

      <details id="admin" className="card scroll-mt-24 overflow-hidden">
        <summary className="cursor-pointer list-none border-b border-slate-200 px-6 py-4 text-base font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
          Administration — add room types &amp; rooms
        </summary>
        <div className="grid gap-6 p-6 xl:grid-cols-2">
          <form onSubmit={createRoomType} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <div>
              <h3 className="font-semibold text-slate-900">Create room type</h3>
              <p className="mt-1 text-xs text-slate-500">Shown in booking search and in the catalog above.</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                className="input"
                required
                value={roomTypeForm.name}
                onChange={(e) => setRoomTypeForm((c) => ({ ...c, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="input min-h-[100px]"
                required
                value={roomTypeForm.description}
                onChange={(e) => setRoomTypeForm((c) => ({ ...c, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Capacity</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={roomTypeForm.capacity}
                  onChange={(e) =>
                    setRoomTypeForm((c) => ({ ...c, capacity: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Base price</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  step="0.01"
                  value={roomTypeForm.basePrice}
                  onChange={(e) =>
                    setRoomTypeForm((c) => ({ ...c, basePrice: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amenities (comma separated)</label>
              <input
                className="input"
                value={roomTypeForm.amenities}
                onChange={(e) => setRoomTypeForm((c) => ({ ...c, amenities: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Catalog image URL (optional)
              </label>
              <input
                className="input"
                placeholder="/room-placeholders/1.jpg or https://…"
                value={roomTypeForm.imageUrl}
                onChange={(e) => setRoomTypeForm((c) => ({ ...c, imageUrl: e.target.value }))}
              />
            </div>
            <button type="submit" className="button-primary">
              Create room type
            </button>
          </form>

          <form onSubmit={createRoom} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <div>
              <h3 className="font-semibold text-slate-900">Add physical room</h3>
              <p className="mt-1 text-xs text-slate-500">Link to a room type for pricing and availability.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Room number</label>
                <input
                  className="input"
                  required
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm((c) => ({ ...c, roomNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Floor</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm((c) => ({ ...c, floor: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Room type</label>
              <select
                className="select"
                value={roomForm.roomTypeId}
                onChange={(e) => setRoomForm((c) => ({ ...c, roomTypeId: e.target.value }))}
              >
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Initial status</label>
              <select
                className="select"
                value={roomForm.housekeepingStatus}
                onChange={(e) =>
                  setRoomForm((c) => ({ ...c, housekeepingStatus: e.target.value }))
                }
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Photo URL (optional)</label>
              <input
                className="input"
                placeholder="https://…"
                value={roomForm.imageUrl}
                onChange={(e) => setRoomForm((c) => ({ ...c, imageUrl: e.target.value }))}
              />
            </div>
            <button type="submit" className="button-primary">
              Add room
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
