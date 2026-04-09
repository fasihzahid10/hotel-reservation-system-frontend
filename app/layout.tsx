import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

/** Same geometric sans as the staff sign-in panel (Inter, 400–800). */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HotelHub — Hotel Reservation System',
  description: 'NestJS + Next.js hotel reservation platform',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
