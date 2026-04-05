export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function pluralize(value: number, singular: string, plural?: string) {
  if (value === 1) return `${value} ${singular}`;
  return `${value} ${plural ?? `${singular}s`}`;
}

export function getStatusBadgeClasses(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-700';
    case 'CHECKED_IN':
      return 'bg-blue-100 text-blue-700';
    case 'CHECKED_OUT':
      return 'bg-slate-100 text-slate-700';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-700';
    case 'PENDING':
      return 'bg-amber-100 text-amber-700';
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-700';
    case 'OCCUPIED':
      return 'bg-blue-100 text-blue-700';
    case 'CLEANING':
      return 'bg-amber-100 text-amber-700';
    case 'MAINTENANCE':
    case 'OUT_OF_SERVICE':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
