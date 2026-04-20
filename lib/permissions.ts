import type { User } from '@/lib/types';

export function isSuperAdmin(user: User | null | undefined): boolean {
  return user?.role === 'SUPER_ADMIN';
}

export function canViewReports(user: User | null | undefined): boolean {
  return isSuperAdmin(user);
}

export function canViewPayments(user: User | null | undefined): boolean {
  return isSuperAdmin(user);
}

export function canManageInventory(user: User | null | undefined): boolean {
  return isSuperAdmin(user);
}

export function canViewFinancialSummary(user: User | null | undefined): boolean {
  return isSuperAdmin(user);
}
