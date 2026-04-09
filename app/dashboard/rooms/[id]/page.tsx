'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Users } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { resolveRoomImageUrl } from '@/lib/room-placeholders';
import type { Room } from '@/lib/types';
import { formatCurrency, getStatusBadgeClasses } from '@/lib/utils';

const statusOptions = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE'];

function labelForRoomStatus(status: string) {
  if (status === 'CLEANING') return 'Reserved (cleaning)';
  if (status === 'OUT_OF_SERVICE') return 'Out of service';
  return status.replaceAll('_', ' ');
}

/** Prefer GET /rooms/:id; if the server has no route (older deploy), use GET /rooms and find by id. */
async function fetchRoomFlexible(roomId: string): Promise<Room | null> {
  try {
    return await apiRequest<Room>(`/rooms/${roomId}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    const missingGetById = msg.includes('Cannot GET') && msg.includes('/rooms/');
    if (!missingGetById) {
      throw e;
    }
    const all = await apiRequest<Room[]>('/rooms');
    return all.find((r) => r.id === roomId) ?? null;
  }
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [photoDraft, setPhotoDraft] = useState('');

  useEffect(() => {
    if (!id) return;
    setError('');
    fetchRoomFlexible(id)
      .then((r) => {
        if (r) {
          setRoom(r);
          setPhotoDraft(r.imageUrl ?? '');
        } else {
          setError('Room not found.');
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load room.'));
  }, [id]);

  async function savePhoto() {
    if (!room) return;
    setFeedback('');
    try {
      const raw = photoDraft.trim();
      await apiRequest(`/rooms/${room.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ imageUrl: raw.length ? raw : null }),
      });
      setFeedback('Photo URL saved.');
      const updated = await fetchRoomFlexible(room.id);
      if (updated) setRoom(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save.');
    }
  }

  async function updateStatus(housekeepingStatus: string) {
    if (!room) return;
    setFeedback('');
    try {
      await apiRequest(`/rooms/${room.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ housekeepingStatus }),
      });
      setFeedback('Status updated.');
      const updated = await fetchRoomFlexible(room.id);
      if (updated) setRoom(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  }

  if (!id) {
    return null;
  }

  if (error && !room) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/rooms')}
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to rooms
        </button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      </div>
    );
  }

  if (!room) {
    return <p className="text-sm text-slate-500">Loading room…</p>;
  }

  const img = resolveRoomImageUrl(room.imageUrl, room.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/rooms')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0c1528]"
        >
          <ArrowLeft className="h-4 w-4" />
          All rooms
        </button>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${room.id}-${room.imageUrl ?? 'p'}`}
              src={img}
              alt={`Room ${room.roomNumber}`}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Room</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0c1528]">
              Room {room.roomNumber}
            </h1>
            <p className="mt-2 text-slate-600">{room.roomType.name}</p>
            <p className="mt-1 text-sm text-slate-500">Floor {room.floor}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`badge ${getStatusBadgeClasses(room.housekeepingStatus)}`}>
              {labelForRoomStatus(room.housekeepingStatus)}
            </span>
            <span className="text-lg font-bold text-[#0c1528]">
              {formatCurrency(room.roomType.basePrice)}
              <span className="text-sm font-normal text-slate-500"> /night</span>
            </span>
          </div>

          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            Up to {room.roomType.capacity} guests
          </p>

          <p className="text-sm leading-relaxed text-slate-600">{room.roomType.description}</p>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {room.roomType.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Camera className="h-4 w-4 text-sky-600" />
              Custom photo URL
            </p>
            <input
              className="input mb-2 py-2 text-sm"
              placeholder="https://… or path under /public"
              value={photoDraft}
              onChange={(e) => setPhotoDraft(e.target.value)}
            />
            <button type="button" onClick={savePhoto} className="button-primary text-sm">
              Save photo
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-900">Housekeeping status</label>
            <select
              className="select"
              value={room.housekeepingStatus}
              onChange={(e) => updateStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
