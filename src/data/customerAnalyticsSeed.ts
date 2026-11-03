export interface CustomerSeed {
  month: string;
  beginning_active_users: number;
  new_paying_users: number;
  churned_users: number;
  monthly_revenue_idr: number;
  is_estimated: boolean;
  data_source: 'demo';
}

const values = [
  ['2026-01', 380, 55, 35, 88000000],
  ['2026-02', 400, 85, 40, 96000000],
  ['2026-03', 445, 45, 70, 91000000],
  ['2026-04', 420, 100, 40, 104000000],
  ['2026-05', 480, 55, 80, 98000000],
  ['2026-06', 455, 105, 40, 113000000],
  ['2026-07', 520, 205, 45, 146000000],
  ['2026-08', 680, 90, 130, 137000000],
  ['2026-09', 640, 150, 55, 108196886],
  ['2026-10', 735, 115, 70, 120047675],
] as const;

export const customerAnalyticsSeed: CustomerSeed[] = values.map(([month, beginning, newUsers, churned, revenue]) => ({
  month, beginning_active_users: beginning, new_paying_users: newUsers,
  churned_users: churned, monthly_revenue_idr: revenue,
  is_estimated: month === '2026-10', data_source: 'demo',
}));