'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BedDouble,
  BookOpen,
  Building2,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  LifeBuoy,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/dashboard/reservations', label: 'Reservations', icon: BookOpen },
  { href: '/dashboard/check-in', label: 'Check-in / Out', icon: ClipboardList },
  { href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/guests', label: 'Guests', icon: Users },
  { href: '/dashboard/guide', label: 'Guide', icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col bg-gradient-to-b from-[#121d2f] via-[#0c1528] to-[#050812] lg:flex">
      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sky-300">
            <Building2 className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">HotelHub</h1>
            <p className="text-xs font-medium text-[#D1D5DB]">Front desk</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                active
                  ? 'border border-white/10 bg-white/10 text-white shadow-sm'
                  : 'border border-transparent text-[#D1D5DB] hover:border-white/5 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon
                className={clsx(
                  'h-5 w-5 shrink-0 transition-colors',
                  active ? 'text-sky-300' : 'text-slate-400 group-hover:text-sky-300/90',
                )}
                strokeWidth={1.75}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
