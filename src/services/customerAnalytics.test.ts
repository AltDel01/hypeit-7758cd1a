import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customerAnalyticsSeed } from '../data/customerAnalyticsSeed';
import { calculateMonths, aggregateQuarters, summarizeCustomers, filterMonths, customerCsv } from './customerAnalytics';

const rows = calculateMonths(customerAnalyticsSeed);
test('January starts with 380 active users', () => assert.equal(rows[0].beginning_active_users, 380));
test('October ends with 780, not a sum of monthly customers', () => assert.equal(summarizeCustomers(rows).active, 780));
test('YTD new paying users is 1005', () => assert.equal(summarizeCustomers(rows).newUsers, 1005));
test('YTD churned users is 605', () => assert.equal(summarizeCustomers(rows).churned, 605));
test('October churn rate is approximately 9.52%', () => assert.ok(Math.abs(rows[9].churn_rate - 9.5238095) < 0.0001));
test('September ends with 735 active users', () => assert.equal(rows[8].ending_active_users, 735));
test('October active growth is approximately 6.12%', () => assert.ok(Math.abs(rows[9].active_growth_rate - 6.122449) < 0.0001));
test('YTD revenue is Rp1101244561', () => assert.equal(summarizeCustomers(rows).revenue, 1101244561));
test('each next beginning equals the prior ending', () => rows.slice(1).forEach((r, i) => assert.equal(r.beginning_active_users, rows[i].ending_active_users)));
test('source changes recalculate downstream values', () => {
  const changed = calculateMonths(customerAnalyticsSeed.map((r, i) => i === 0 ? { ...r, new_paying_users: 65 } : r));
  assert.equal(changed[1].beginning_active_users, 410);
  assert.equal(changed[9].ending_active_users, 790);
});
test('quarterly totals retain end-of-period customers and revenue', () => {
  const quarters = aggregateQuarters(rows);
  assert.equal(quarters[0].ending_active_users, 420);
  assert.equal(quarters[0].new_paying_users, 185);
  assert.equal(summarizeCustomers(quarters).revenue, 1101244561);
  assert.equal(quarters[3].ending_active_users, 780);
});
test('date filters preserve monthly formulas', () => {
  const filtered = filterMonths(rows, '2026-09', '2026-10');
  assert.equal(filtered.length, 2);
  assert.equal(summarizeCustomers(filtered).newUsers, 265);
  assert.equal(summarizeCustomers(filtered).active, 780);
});
test('October customers are estimated and revenue has a distinct cutoff', () => {
  assert.equal(rows[9].is_estimated, true);
  assert.equal(rows[8].is_estimated, false);
  assert.ok(customerCsv(rows).includes('Through October 22 2026 (not full month)'));
  assert.ok(customerCsv(rows).includes('Demo / Simulated Data'));
});