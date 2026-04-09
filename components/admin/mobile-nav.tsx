'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/rooms', label: 'Rooms' },
  { href: '/dashboard/reservations', label: 'Bookings' },
  { href: '/dashboard/check-in', label: 'Check-in' },
  { href: '/dashboard/payments', label: 'Pay' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/dashboard/guide', label: 'Guide' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10 bg-gradient-to-b from-[#121d2f] to-[#050812] px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const active =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition',
                active
                  ? 'border border-white/10 bg-white/10 text-white'
                  : 'border border-transparent text-[#D1D5DB] hover:bg-white/5 hover:text-white',
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
