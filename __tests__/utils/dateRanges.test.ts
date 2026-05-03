import { getDateRange, PERIOD_OPTIONS, Period } from '../../utils/dateRanges';

describe('getDateRange', () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  it('returns correct range for 7d period', () => {
    const { startDate, endDate } = getDateRange('7d');
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    expect(startDate).toBe(d.toISOString().slice(0, 10));
    expect(endDate).toBe(todayStr);
  });

  it('returns correct range for 14d period', () => {
    const { startDate, endDate } = getDateRange('14d');
    const d = new Date(today);
    d.setDate(d.getDate() - 13);
    expect(startDate).toBe(d.toISOString().slice(0, 10));
    expect(endDate).toBe(todayStr);
  });

  it('returns correct range for 30d period', () => {
    const { startDate, endDate } = getDateRange('30d');
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    expect(startDate).toBe(d.toISOString().slice(0, 10));
    expect(endDate).toBe(todayStr);
  });

  it('returns correct range for thisMonth', () => {
    const { startDate, endDate } = getDateRange('thisMonth');
    expect(startDate).toBe(today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-01');
    expect(endDate).toBe(todayStr);
  });

  it('returns correct range for lastMonth', () => {
    const { startDate, endDate } = getDateRange('lastMonth');
    const y = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    const m = today.getMonth() === 0 ? 12 : today.getMonth();
    expect(startDate).toBe(y + '-' + String(m).padStart(2, '0') + '-01');
    const lastDay = new Date(y, m, 0).getDate();
    expect(endDate).toBe(y + '-' + String(m).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0'));
  });

  it('returns ISO date format strings', () => {
    const { startDate, endDate } = getDateRange('7d');
    expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('PERIOD_OPTIONS', () => {
  const validPeriods: Period[] = ['7d', '14d', '30d', 'thisMonth', 'lastMonth'];

  it('has exactly 5 options', () => {
    expect(PERIOD_OPTIONS).toHaveLength(5);
  });

  it('each option has a key and label', () => {
    for (const option of PERIOD_OPTIONS) {
      expect(option).toHaveProperty('key');
      expect(option).toHaveProperty('label');
      expect(typeof option.key).toBe('string');
      expect(typeof option.label).toBe('string');
    }
  });

  it('all keys are valid Period values', () => {
    for (const option of PERIOD_OPTIONS) {
      expect(validPeriods).toContain(option.key);
    }
  });

  it('has no duplicate keys', () => {
    const keys = PERIOD_OPTIONS.map((o) => o.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
