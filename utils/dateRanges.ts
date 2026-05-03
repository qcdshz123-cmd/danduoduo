export type Period = '7d' | '14d' | '30d' | 'thisMonth' | 'lastMonth';

export const PERIOD_OPTIONS: Array<{ key: Period; label: string }> = [
  { key: '7d', label: '近7天' },
  { key: '14d', label: '近14天' },
  { key: '30d', label: '近30天' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
];

export function getDateRange(period: Period): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);

  if (period === 'thisMonth') {
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { startDate, endDate };
  }
  if (period === 'lastMonth') {
    const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const m = now.getMonth() === 0 ? 12 : now.getMonth();
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate: end };
  }

  const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
  const d = new Date(now);
  d.setDate(d.getDate() - days + 1);
  const startDate = d.toISOString().slice(0, 10);
  return { startDate, endDate };
}
