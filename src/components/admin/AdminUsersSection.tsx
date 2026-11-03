import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, Download, RefreshCw, Users, UserPlus, UserMinus, Activity } from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { aggregateQuarters, calculateMonths, customerCsv, demoCustomerDataSource, filterMonths, summarizeCustomers, type CustomerDataSource, type CustomerPeriod } from '@/services/customerAnalytics';
import type { CustomerSeed } from '@/data/customerAnalyticsSeed';

const number = (value: number) => value.toLocaleString('en-US');
const rupiah = (value: number) => `Rp${Math.round(value).toLocaleString('id-ID')}`;
const chartConfig = {
  new_paying_users: { label: 'New paying users', color: 'hsl(var(--analytics-new))' },
  ending_active_users: { label: 'Active paying users', color: 'hsl(var(--analytics-active))' },
  churned_users: { label: 'Churned users', color: 'hsl(var(--analytics-churn))' },
  churn_rate: { label: 'Churn rate (%)', color: 'hsl(var(--analytics-churn))' },
  monthly_revenue_idr: { label: 'Revenue (IDR)', color: 'hsl(var(--analytics-revenue))' },
};
type Metric = 'active' | 'new' | 'churn' | 'revenue';
type SortKey = 'month' | 'beginning_active_users' | 'new_paying_users' | 'churned_users' | 'ending_active_users' | 'net_growth' | 'churn_rate' | 'monthly_revenue_idr' | 'blended_arpa';
const columns: [SortKey, string][] = [['month', 'Month'], ['beginning_active_users', 'Beginning active'], ['new_paying_users', 'New paying'], ['churned_users', 'Churned'], ['ending_active_users', 'Ending active'], ['net_growth', 'Net growth'], ['churn_rate', 'Churn rate'], ['monthly_revenue_idr', 'Revenue (IDR)'], ['blended_arpa', 'Blended ARPA']];

function CustomerChart({ rows, kind, showChurn = false }: { rows: CustomerPeriod[]; kind: Metric | 'combined' | 'comparison' | 'rate'; showChurn?: boolean }) {
  return <ChartContainer config={chartConfig} className={kind === 'combined' || kind === 'revenue' || kind === 'new' || kind === 'churn' ? 'h-[320px] w-full aspect-auto' : 'h-[200px] w-full aspect-auto'}>
    <ComposedChart data={rows} margin={{ top: 16, right: 12, left: 0, bottom: 8 }} accessibilityLayer>
      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
      <YAxis tickLine={false} axisLine={false} width={60} tickFormatter={v => kind === 'revenue' ? `${Number(v) / 1000000}m` : kind === 'rate' ? `${v}%` : String(v)} />
      <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => {
        const row = payload?.[0]?.payload as CustomerPeriod | undefined;
        return `${row?.month ?? ''}${row?.is_estimated ? ' · Estimated customers' : ''}`;
      }} formatter={(value, name) => <div className="flex flex-wrap items-center justify-between gap-4 w-full"><span className="text-muted-foreground">{String(name)}</span><span className="font-mono tabular-nums">{name === 'Revenue (IDR)' ? rupiah(Number(value)) : name === 'Churn rate (%)' ? `${Number(value).toFixed(2)}%` : number(Number(value))}</span></div>} />} />
      {(kind === 'combined' || kind === 'new' || kind === 'comparison') && <Bar isAnimationActive={false} dataKey="new_paying_users" name="New paying users" fill="var(--color-new_paying_users)" radius={[3, 3, 0, 0]} maxBarSize={36} />}
      {(kind === 'combined' || kind === 'active') && <Line isAnimationActive={false} type="linear" dataKey="ending_active_users" name="Active paying users" stroke="var(--color-ending_active_users)" strokeWidth={3} dot={{ r: 3 }} />}
      {(showChurn || kind === 'churn' || kind === 'comparison') && <Bar isAnimationActive={false} dataKey="churned_users" name="Churned users" fill="var(--color-churned_users)" radius={[3, 3, 0, 0]} maxBarSize={36} />}
      {kind === 'rate' && <Line isAnimationActive={false} type="linear" dataKey="churn_rate" name="Churn rate (%)" stroke="var(--color-churn_rate)" strokeWidth={2} dot={{ r: 3 }} />}
      {kind === 'revenue' && <Bar isAnimationActive={false} dataKey="monthly_revenue_idr" name="Revenue (IDR)" fill="var(--color-monthly_revenue_idr)" radius={[3, 3, 0, 0]} maxBarSize={36} />}
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
    </ComposedChart>
  </ChartContainer>;
}

export default function AdminUsersSection({ dataSource = demoCustomerDataSource }: { dataSource?: CustomerDataSource }) {
  const [source, setSource] = useState<CustomerSeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [start, setStart] = useState('2026-01');
  const [end, setEnd] = useState('2026-10');
  const [view, setView] = useState('monthly');
  const [metric, setMetric] = useState<Metric>('active');
  const [showChurn, setShowChurn] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; ascending: boolean }>({ key: 'month', ascending: true });

  useEffect(() => {
    let alive = true;
    setLoading(true); setError(false);
    dataSource.load().then(data => { if (alive) setSource(data); }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [dataSource, reload]);
  const months = useMemo(() => filterMonths(calculateMonths(source), start, end), [source, start, end]);
  const rows = useMemo(() => view === 'quarterly' ? aggregateQuarters(months) : months, [months, view]);
  const totals = useMemo(() => summarizeCustomers(months), [months]);
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const x = a[sort.key], y = b[sort.key];
    const result = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y) : Number(x) - Number(y);
    return sort.ascending ? result : -result;
  }), [rows, sort]);
  const last = months[months.length - 1];
  const isYtd = start === '2026-01';
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + customerCsv(sorted)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `demo-customers-${start}-${end}-${view}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const cards = [
    { title: 'Active Paying Users', value: number(totals.active), icon: Users, detail: last ? `${totals.growthRate >= 0 ? '+' : ''}${totals.growthRate.toFixed(1)}% versus prior month${last.is_estimated ? ' · Estimated' : ''}` : 'End of selected period' },
    { title: `New Paying Users ${isYtd ? 'YTD' : 'in Period'}`, value: number(totals.newUsers), icon: UserPlus, detail: `${months.length} selected months` },
    { title: `Churned Paying Users ${isYtd ? 'YTD' : 'in Period'}`, value: number(totals.churned), icon: UserMinus, detail: 'Cumulative customer departures' },
    { title: `Monthly Churn Rate${last ? ` (${last.label})` : ''}`, value: `${totals.churnRate.toFixed(1)}%`, icon: Activity, detail: last ? `${last.churned_users} of ${number(last.beginning_active_users)} beginning active users` : 'No selected month' },
  ];

  return <section className="space-y-6 min-w-0" aria-label="Customer analytics">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl md:text-3xl font-semibold tracking-normal">Customer Analytics</h1><span className="rounded border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary">Demo / Simulated Data</span></div><p className="text-sm text-muted-foreground">Paid customers · January to October 2026</p></div>
      <Button variant="outline" onClick={exportCsv} disabled={loading || error || !rows.length}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
    </header>
    <div className="flex flex-wrap items-end gap-3 border-y border-border py-4">
      <div className="space-y-2"><Label htmlFor="customer-start">From</Label><Input id="customer-start" type="month" value={start} onChange={e => setStart(e.target.value)} className="w-[170px]" /></div>
      <div className="space-y-2"><Label htmlFor="customer-end">To</Label><Input id="customer-end" type="month" value={end} onChange={e => setEnd(e.target.value)} className="w-[170px]" /></div>
      <div className="space-y-2"><Label htmlFor="customer-status">User Status</Label><Select value="paid"><SelectTrigger id="customer-status" className="w-[155px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">Paid Users</SelectItem><SelectItem value="free" disabled>Free Users (no data)</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="customer-metric">Metric</Label><Select value={metric} onValueChange={value => setMetric(value as Metric)}><SelectTrigger id="customer-metric" className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent>{(['active', 'new', 'churn', 'revenue'] as const).map(m => <SelectItem key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</SelectItem>)}</SelectContent></Select></div>
      <Tabs value={view} onValueChange={setView} className="sm:ml-auto"><TabsList><TabsTrigger value="monthly">Monthly</TabsTrigger><TabsTrigger value="quarterly">Quarterly</TabsTrigger></TabsList></Tabs>
    </div>
    <div className="border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">All figures are illustrative, not verified production metrics. October customer figures are end-of-month estimates. October revenue covers transactions through <span className="text-foreground">October 22, 2026 only</span>.</div>
    {loading ? <div role="status" className="py-20 text-center text-muted-foreground">Loading customer data...</div> : error ? <div role="alert" className="py-16 text-center space-y-4"><p>Couldn’t load the demo data.</p><Button variant="outline" onClick={() => setReload(n => n + 1)}><RefreshCw className="h-4 w-4 mr-2" />Try again</Button></div> : !rows.length ? <div className="py-16 text-center space-y-3"><p>No customer data for this date range.</p><Button variant="outline" onClick={() => { setStart('2026-01'); setEnd('2026-10'); }}>Reset dates</Button></div> : <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{cards.map(card => <div key={card.title} className="rounded-lg border border-border bg-card p-5 space-y-3"><div className="flex justify-between gap-3 text-sm text-muted-foreground"><span>{card.title}</span><card.icon className="h-4 w-4 shrink-0" /></div><div className="text-3xl font-semibold tabular-nums">{card.value}</div><p className="text-xs text-muted-foreground">{card.detail}</p></div>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4"><span className="text-sm text-muted-foreground">{isYtd ? 'YTD' : 'Selected period'} Revenue <strong className="ml-2 font-mono text-foreground">{rupiah(totals.revenue)}</strong></span><span className="text-xs text-muted-foreground">Active users are period-end balances, never monthly sums.</span></div>
      <div className="space-y-4"><div className="flex flex-wrap justify-between items-center gap-3"><div><h2 className="text-lg font-semibold">{metric === 'revenue' ? 'Paid User Revenue' : metric === 'new' ? 'New Paying Users' : metric === 'churn' ? 'Churned Paying Users' : 'Paid User Growth & Retention'}</h2><p className="text-xs text-muted-foreground mt-1">{metric === 'revenue' ? 'Revenue in IDR' : 'Number of paying users'} · {view === 'quarterly' ? 'Quarter-end active balance' : 'Month-end active balance'}</p></div>{metric === 'active' && <div className="flex items-center gap-2"><Switch id="customer-churn" checked={showChurn} onCheckedChange={setShowChurn} /><Label htmlFor="customer-churn" className="text-xs">Show churned users</Label></div>}</div><CustomerChart rows={rows} kind={metric === 'active' ? 'combined' : metric} showChurn={metric === 'active' && showChurn} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-y border-border py-6">{([{ title: 'Active Paying Users Trend', kind: 'active' }, { title: 'New Customers vs. Churned Customers', kind: 'comparison' }, { title: 'Monthly Churn Rate', kind: 'rate' }] as const).map(chart => <div key={chart.kind} className="min-w-0"><h3 className="text-sm font-medium mb-3">{chart.kind === 'rate' && view === 'quarterly' ? 'Weighted Monthly Churn Rate by Quarter' : chart.title}</h3><CustomerChart rows={rows} kind={chart.kind} /></div>)}</div>
      <div><h2 className="text-lg font-semibold mb-4">Customer Data</h2><Table><TableHeader><TableRow>{columns.map(([key, label]) => <TableHead key={key} className="whitespace-nowrap" aria-sort={sort.key === key ? sort.ascending ? 'ascending' : 'descending' : 'none'}><Button variant="ghost" size="sm" className="px-0 gap-1 text-xs" onClick={() => setSort(s => ({ key, ascending: s.key === key ? !s.ascending : true }))}>{view === 'quarterly' && key === 'month' ? 'Quarter' : label}<ArrowDownUp className="h-3 w-3" /></Button></TableHead>)}</TableRow></TableHeader><TableBody>{sorted.map(row => <TableRow key={row.month}><TableCell className="whitespace-nowrap font-medium">{row.month}{row.is_estimated && <span className="block text-xs text-primary">Estimated customers</span>}{view === 'quarterly' && row.months < 3 && <span className="block text-xs text-muted-foreground">Partial quarter</span>}</TableCell>{columns.slice(1).map(([key]) => <TableCell key={key} className="text-right whitespace-nowrap font-mono text-xs tabular-nums">{key === 'churn_rate' ? `${row.churn_rate.toFixed(2)}%` : key === 'monthly_revenue_idr' || key === 'blended_arpa' ? rupiah(Number(row[key])) : number(Number(row[key]))}{key === 'monthly_revenue_idr' && row.is_estimated && <span className="block text-muted-foreground font-sans mt-1">Through Oct 22 only</span>}</TableCell>)}</TableRow>)}</TableBody></Table><p className="text-xs text-muted-foreground mt-3">{view === 'quarterly' ? '* Partial quarter. Quarterly churn is the weighted monthly rate; ARPA is period revenue divided by ending active users.' : 'Blended ARPA = monthly revenue / ending active users.'} Demo / Simulated Data.</p></div>
    </>}
  </section>;
}