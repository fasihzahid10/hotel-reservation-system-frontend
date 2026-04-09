'use client';

import Link from 'next/link';
import { Building2, LogIn } from 'lucide-react';

export function PublicNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-slate-900">
          <span className="rounded-2xl bg-blue-600 p-2 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          HotelHub
        </Link>
        <Link href="/login" className="button-secondary gap-2">
          <LogIn className="h-4 w-4" />
          Staff Login
        </Link>
      </div>
    </header>
  );
}
