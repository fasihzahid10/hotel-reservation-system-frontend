'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import type { User } from '@/lib/types';

export function DashboardHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    apiRequest<User>('/auth/me').then(setUser).catch(() => undefined);
  }, []);

  async function handleLogout() {
    await apiRequest('/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-canvas/90 px-4 py-4 backdrop-blur lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Operations</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Hotel Reservation System</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-soft sm:block">
          <p className="text-sm font-semibold text-slate-900">{user?.fullName ?? 'Loading...'}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{user?.role ?? ''}</p>
        </div>
        <button onClick={handleLogout} className="button-secondary gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
