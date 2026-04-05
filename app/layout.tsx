import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hotel Reservation System',
  description: 'NestJS + Next.js hotel reservation platform',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
