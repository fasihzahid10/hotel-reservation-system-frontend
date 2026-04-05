'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BedDouble, BookOpen, LayoutDashboard, Users } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/reservations', label: 'Reservations', icon: BookOpen },
  { href: '/dashboard/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/dashboard/guests', label: 'Guests', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-slate-200 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">HarborView</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Front Desk Console</h1>
        <p className="mt-2 text-sm text-slate-500">Manage inventory, guests, and live arrivals.</p>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                active ? 'bg-blue-600 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
