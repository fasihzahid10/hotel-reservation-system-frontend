import { DashboardHeader } from '@/components/admin/header';
import { MobileNav } from '@/components/admin/mobile-nav';
import { Sidebar } from '@/components/admin/sidebar';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <MobileNav />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
