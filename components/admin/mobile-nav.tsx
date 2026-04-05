'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/reservations', label: 'Reservations' },
  { href: '/dashboard/rooms', label: 'Rooms' },
  { href: '/dashboard/guests', label: 'Guests' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap',
                active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
