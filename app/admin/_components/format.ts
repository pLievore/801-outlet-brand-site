export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(Math.abs(value) >= 0.1 ? 0 : 1)}%`;
}

export function formatShortDay(date: string): string {
  const [, month, day] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
}

export function financialStatusLabel(status: string): string {
  return status.toLowerCase().replace(/_/g, ' ');
}

/** Consistent palette for chart segments. */
export const CHART_PALETTE = [
  '#6f8352', // sage ink
  '#b45309', // amber
  '#0e7490', // cyan
  '#be123c', // rose
  '#7c3aed', // violet
  '#475569', // slate
];

export const STATUS_COLORS: Record<string, string> = {
  PAID: '#6f8352',
  PENDING: '#b45309',
  AUTHORIZED: '#0e7490',
  PARTIALLY_PAID: '#a16207',
  PARTIALLY_REFUNDED: '#64748b',
  REFUNDED: '#475569',
  VOIDED: '#be123c',
  EXPIRED: '#94a3b8',
  UNKNOWN: '#94a3b8',
};
