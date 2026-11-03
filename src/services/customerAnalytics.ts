import { customerAnalyticsSeed, type CustomerSeed } from '@/data/customerAnalyticsSeed';

export interface CustomerPeriod extends CustomerSeed {
  ending_active_users: number;
  ending_registered_users: number;
  net_growth: number;
  churn_rate: number;
  active_growth_rate: number;
  blended_arpa: number;
  label: string;
  months: number;
}

export interface CustomerDataSource {
  load(): Promise<CustomerSeed[]>;
}

// Deliberately local: replace this adapter, not the demo seed, for a future live source.
export const demoCustomerDataSource: CustomerDataSource = {
  async load() { return customerAnalyticsSeed.map(row => ({ ...row })); },
};

export function calculateMonths(source: CustomerSeed[]): CustomerPeriod[] {
  let previousEnding: number | undefined;
  let previousRegistered: number | undefined;
  return [...source].sort((a, b) => a.month.localeCompare(b.month)).map(row => {
    const beginning = previousEnding ?? row.beginning_active_users;
    const registeredBeginning = previousRegistered ?? row.beginning_registered_users;
    const registeredEnding = registeredBeginning + row.new_registered_users;
    const ending = beginning + row.new_paying_users - row.churned_users;
    const result: CustomerPeriod = {
      ...row, beginning_registered_users: registeredBeginning, ending_registered_users: registeredEnding, beginning_active_users: beginning, ending_active_users: ending,
      net_growth: row.new_paying_users - row.churned_users,
      churn_rate: beginning ? row.churned_users / beginning * 100 : 0,
      active_growth_rate: beginning ? (ending / beginning - 1) * 100 : 0,
      blended_arpa: ending ? row.monthly_revenue_idr / ending : 0,
      label: new Date(`${row.month}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      months: 1,
    };
    previousEnding = ending;
    previousRegistered = registeredEnding;
    return result;
  });
}

export function filterMonths(rows: CustomerPeriod[], start: string, end: string) {
  return rows.filter(row => row.month >= start && row.month <= end);
}

export function aggregateQuarters(rows: CustomerPeriod[]): CustomerPeriod[] {
  const groups = new Map<string, CustomerPeriod[]>();
  rows.forEach(row => {
    const key = `${row.month.slice(0, 4)}-Q${Math.ceil(Number(row.month.slice(5)) / 3)}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });
  return [...groups].map(([key, group]) => {
    const first = group[0];
    const last = group[group.length - 1];
    const newUsers = group.reduce((sum, r) => sum + r.new_paying_users, 0);
    const churn = group.reduce((sum, r) => sum + r.churned_users, 0);
    const revenue = group.reduce((sum, r) => sum + r.monthly_revenue_idr, 0);
    const exposure = group.reduce((sum, r) => sum + r.beginning_active_users, 0);
    return {
      ...last, month: key, label: `${key.slice(5)}${group.length < 3 ? ' *' : ''}`,
      beginning_active_users: first.beginning_active_users,
      beginning_registered_users: first.beginning_registered_users,
      new_registered_users: group.reduce((sum, r) => sum + r.new_registered_users, 0),
      new_paying_users: newUsers, churned_users: churn, monthly_revenue_idr: revenue,
      net_growth: newUsers - churn,
      churn_rate: exposure ? churn / exposure * 100 : 0,
      active_growth_rate: first.beginning_active_users ? (last.ending_active_users / first.beginning_active_users - 1) * 100 : 0,
      blended_arpa: last.ending_active_users ? revenue / last.ending_active_users : 0,
      is_estimated: group.some(r => r.is_estimated), months: group.length,
    };
  });
}

export function summarizeCustomers(rows: CustomerPeriod[]) {
  const latest = rows[rows.length - 1];
  return {
    registered: latest?.ending_registered_users ?? 0,
    newRegistered: rows.reduce((sum, r) => sum + r.new_registered_users, 0),
    beginningActive: rows[0]?.beginning_active_users ?? 0,
    active: latest?.ending_active_users ?? 0,
    newUsers: rows.reduce((sum, r) => sum + r.new_paying_users, 0),
    churned: rows.reduce((sum, r) => sum + r.churned_users, 0),
    revenue: rows.reduce((sum, r) => sum + r.monthly_revenue_idr, 0),
    churnRate: latest?.churn_rate ?? 0,
    growthRate: latest?.active_growth_rate ?? 0,
  };
}

export function customerCsv(rows: CustomerPeriod[]) {
  const header = 'Period,Beginning Registered Users,New Signups,Ending Registered Users,Beginning Active Users,New Paying Users,Churned Users,Ending Active Users,Net Customer Growth,Churn Rate %,Revenue IDR,Blended ARPA IDR,Customer Figures,Revenue Coverage,Data Source';
  return [header, ...rows.map(r => [r.month, r.beginning_registered_users, r.new_registered_users, r.ending_registered_users, r.beginning_active_users, r.new_paying_users, r.churned_users,
    r.ending_active_users, r.net_growth, r.churn_rate.toFixed(4), r.monthly_revenue_idr, r.blended_arpa.toFixed(2),
    r.is_estimated ? 'Projected / Estimated' : 'Simulated',
    r.is_estimated ? 'Through October 22 2026 (not full month)' : 'Full period (simulated)', 'Demo / Simulated Data'].join(','))].join('\r\n');
}