import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Globe, Users, HelpCircle, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CountryRow {
  code: string;
  name: string;
  users: number;
  orders: number;
  revenueIdr: number;
  requests: number;
}

const formatIdr = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

const AdminCountriesSection = () => {
  const [rows, setRows] = useState<CountryRow[]>([]);
  const [unknown, setUnknown] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: profiles }, { data: orders }, { data: requests }] = await Promise.all([
        supabase.from('profiles').select('id, country_code, country_name'),
        supabase.from('payment_orders').select('user_id, status, base_amount_idr, unique_amount_idr'),
        supabase.from('generation_requests').select('user_id'),
      ]);

      const list = profiles || [];
      setTotalUsers(list.length);

      const byUser = new Map<string, { code: string; name: string }>();
      const map = new Map<string, CountryRow>();
      let unknownCount = 0;

      list.forEach((p: any) => {
        const code = (p.country_code || '').toUpperCase();
        if (!code) {
          unknownCount += 1;
          return;
        }
        byUser.set(p.id, { code, name: p.country_name || code });
        const row = map.get(code) || { code, name: p.country_name || code, users: 0, orders: 0, revenueIdr: 0, requests: 0 };
        row.users += 1;
        map.set(code, row);
      });

      (orders || []).forEach((o: any) => {
        if (!['paid', 'approved', 'completed', 'settled'].includes(String(o.status))) return;
        const geo = byUser.get(o.user_id);
        if (!geo) return;
        const row = map.get(geo.code);
        if (!row) return;
        row.orders += 1;
        row.revenueIdr += Number(o.unique_amount_idr || o.base_amount_idr || 0);
      });

      (requests || []).forEach((r: any) => {
        const geo = byUser.get(r.user_id);
        if (!geo) return;
        const row = map.get(geo.code);
        if (row) row.requests += 1;
      });

      setRows([...map.values()].sort((a, b) => b.users - a.users));
      setUnknown(unknownCount);
    } catch (error) {
      console.error('Error loading country stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const known = totalUsers - unknown;
  const chartData = rows.slice(0, 10).map((r) => ({ name: r.code, users: r.users }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Countries</h2>
          <p className="text-muted-foreground text-sm">Where your signed-up users come from</p>
        </div>
        <Button onClick={() => { loadData(); toast.info('Refreshed'); }} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-primary' },
              { label: 'With Country', value: known, icon: Globe, color: 'text-green-500' },
              { label: 'Unknown', value: unknown, icon: HelpCircle, color: 'text-yellow-500' },
              { label: 'Countries', value: rows.length, icon: Wallet, color: 'text-primary' },
            ].map((card) => (
              <div key={card.label} className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Top Countries by Users</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {rows.length === 0 ? (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
              No country data yet. It fills in as users sign up or sign in again.
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
              <h3 className="font-semibold text-foreground p-4 pb-2">Breakdown</h3>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {rows.map((r) => (
                  <div key={r.code} className="p-3">
                    <p className="font-medium text-foreground text-sm">{r.name} ({r.code})</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{r.users} users</span>
                      <span>{r.orders} orders</span>
                      <span>{formatIdr(r.revenueIdr)}</span>
                      <span>{r.requests} requests</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Country</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Users</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Paid Orders</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.code} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-3 font-medium text-foreground">{r.name} <span className="text-muted-foreground">({r.code})</span></td>
                      <td className="p-3 text-center text-foreground">{r.users}</td>
                      <td className="p-3 text-center text-foreground">{r.orders}</td>
                      <td className="p-3 text-center text-foreground">{formatIdr(r.revenueIdr)}</td>
                      <td className="p-3 text-center text-foreground">{r.requests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCountriesSection;
