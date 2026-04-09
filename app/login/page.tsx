'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import type { User } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@hotel.local');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRequest<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-gradient-to-b from-[#121d2f] via-[#0c1528] to-[#050812] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sky-300">
            <Building2 className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">HotelHub</p>
            <p className="text-sm font-medium text-[#D1D5DB]">Operations platform</p>
          </div>
        </div>

        <div>
          <h1 className="max-w-xl text-5xl font-extrabold tracking-tight text-white">
            Staff sign-in for reservations, front desk, and occupancy control.
          </h1>
          <div className="mt-10 grid max-w-lg gap-4">
            {[
              'Role-based access for admin and staff',
              'Real-time room inventory and arrivals',
              'Check-in, check-out, and reservation workflows',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4"
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-sky-300" strokeWidth={1.75} />
                <span className="font-medium text-[#D1D5DB]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="card w-full max-w-md p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Secure access</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Use a seeded account or replace with your own records after setup.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input className="input" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button className="button-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Seeded accounts</p>
            <p className="mt-2">Admin: admin@hotel.local / Admin@123</p>
            <p>Staff: staff@hotel.local / Staff@123</p>
          </div>
        </div>
      </section>
    </main>
  );
}
