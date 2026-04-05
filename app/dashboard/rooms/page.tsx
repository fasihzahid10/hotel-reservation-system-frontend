'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Room, RoomType } from '@/lib/types';
import { formatCurrency, getStatusBadgeClasses } from '@/lib/utils';

const statusOptions = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE'];

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    capacity: 2,
    basePrice: 100,
    amenities: 'Wi-Fi, Smart TV',
  });
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: 1,
    roomTypeId: '',
    housekeepingStatus: 'AVAILABLE',
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

  async function createRoomType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('');
    try {
      await apiRequest('/room-types', {
        method: 'POST',
        body: JSON.stringify({
          ...roomTypeForm,
          amenities: roomTypeForm.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        }),
      });
      setRoomTypeForm({ name: '', description: '', capacity: 2, basePrice: 100, amenities: 'Wi-Fi, Smart TV' });
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
      await apiRequest('/rooms', { method: 'POST', body: JSON.stringify(roomForm) });
      setRoomForm({ roomNumber: '', floor: 1, roomTypeId: roomTypes[0]?.id ?? '', housekeepingStatus: 'AVAILABLE' });
      setFeedback('Room added successfully.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create room.');
    }
  }

  async function updateRoomStatus(roomId: string, housekeepingStatus: string) {
    setFeedback('');
    try {
      await apiRequest(`/rooms/${roomId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ housekeepingStatus }),
      });
      setFeedback('Room status updated.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update room status.');
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Inventory</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Rooms and room types</h1>
        <p className="mt-2 text-slate-500">Define sellable room categories, then add physical rooms and keep their status current.</p>
      </section>

      {feedback ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={createRoomType} className="card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Create room type</h2>
            <p className="mt-1 text-sm text-slate-500">These appear in public booking search results.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input className="input" required value={roomTypeForm.name}
                onChange={(event) => setRoomTypeForm((current) => ({ ...current, name: event.target.value }))}/>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea className="input min-h-[120px]" required value={roomTypeForm.description}
                onChange={(event) => setRoomTypeForm((current) => ({ ...current, description: event.target.value }))}/>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Capacity</label>
                <input className="input" type="number" min={1} value={roomTypeForm.capacity}
                  onChange={(event) => setRoomTypeForm((current) => ({ ...current, capacity: Number(event.target.value) }))}/>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Base price</label>
                <input className="input" type="number" min={1} step="0.01" value={roomTypeForm.basePrice}
                  onChange={(event) => setRoomTypeForm((current) => ({ ...current, basePrice: Number(event.target.value) }))}/>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amenities (comma separated)</label>
              <input className="input" value={roomTypeForm.amenities}
                onChange={(event) => setRoomTypeForm((current) => ({ ...current, amenities: event.target.value }))}/>
            </div>

            <button className="button-primary">Create room type</button>
          </div>
        </form>

        <form onSubmit={createRoom} className="card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Add physical room</h2>
            <p className="mt-1 text-sm text-slate-500">Link each room to a room type for availability and pricing.</p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Room number</label>
                <input className="input" required value={roomForm.roomNumber}
                  onChange={(event) => setRoomForm((current) => ({ ...current, roomNumber: event.target.value }))}/>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Floor</label>
                <input className="input" type="number" min={1} value={roomForm.floor}
                  onChange={(event) => setRoomForm((current) => ({ ...current, floor: Number(event.target.value) }))}/>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Room type</label>
              <select className="select" value={roomForm.roomTypeId}
                onChange={(event) => setRoomForm((current) => ({ ...current, roomTypeId: event.target.value }))}>
                {roomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Initial status</label>
              <select className="select" value={roomForm.housekeepingStatus}
                onChange={(event) => setRoomForm((current) => ({ ...current, housekeepingStatus: event.target.value }))}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </div>

            <button className="button-primary">Add room</button>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">Room type catalog</h2>
          <p className="mt-1 text-sm text-slate-500">Commercial room categories and pricing.</p>
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-3">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{roomType.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{roomType.description}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  {formatCurrency(roomType.basePrice)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {roomType.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {amenity}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600">Capacity: {roomType.capacity} guests · Rooms: {roomType._count?.rooms ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">Physical room list</h2>
          <p className="mt-1 text-sm text-slate-500">Housekeeping state controls whether rooms can be sold or assigned.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Floor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Change status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-semibold text-slate-900">{room.roomNumber}</td>
                  <td className="px-4 py-4 text-slate-600">{room.roomType.name}</td>
                  <td className="px-4 py-4 text-slate-600">{room.floor}</td>
                  <td className="px-4 py-4">
                    <span className={`badge ${getStatusBadgeClasses(room.housekeepingStatus)}`}>{room.housekeepingStatus.replaceAll('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <select className="select min-w-[220px]" value={room.housekeepingStatus}
                      onChange={(event) => updateRoomStatus(room.id, event.target.value)}>
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
