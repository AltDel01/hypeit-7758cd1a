import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Coins, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

interface RequestRow {
  created_at: string | null;
  credits_used: number;
  status: string | null;
  request_type: string;
  user_id: string;
}

interface ProfileRow {
  id: string;
  subscription_tier: string | null;
  generations_this_month: number | null;
  monthly_generation_limit: number | null;
  bonus_credits: number;
}

const COLORS = [
  'hsl(var(--primary))', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'
];

const AdminTokenDashboard = () => {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqRes, profRes] = await Promise.all([
        supabase.from('generation_requests').select('created_at, credits_used, status, request_type, user_id'),
        supabase.from('profiles').select('id, subscription_tier, generations_this_month, monthly_generation_limit, bonus_credits'),
      ]);
      setRequests((reqRes.data as RequestRow[]) || []);
      setProfiles((profRes.data as ProfileRow[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Summary stats
  const stats = useMemo(() => {
    const totalTokensUsed = requests
      .filter(r => r.status === 'completed')
      .reduce((s, r) => s + (r.credits_used || 0), 0);
    const totalCapacity = profiles.reduce((s, p) => s + (p.monthly_generation_limit || 0) + (p.bonus_credits || 0), 0);
    const activeUsers = new Set(requests.filter(r => {
      if (!r.created_at) return false;
      const d = new Date(r.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).map(r => r.user_id)).size;
    const avgPerUser = activeUsers > 0 ? Math.round(totalTokensUsed / activeUsers) : 0;
    return { totalTokensUsed, totalCapacity, activeUsers, avgPerUser };
  }, [requests, profiles]);

  // Daily token usage (last 30 days)
  const dailyUsage = useMemo(() => {
    const now = new Date();
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    requests.filter(r => r.status === 'completed' && r.created_at).forEach(r => {
      const key = r.created_at!.slice(0, 10);
      if (key in days) days[key] += r.credits_used || 0;
    });
    return Object.entries(days).map(([date, tokens]) => ({
      date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      tokens,
    }));
  }, [requests]);

  // Tokens by request type
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    requests.filter(r => r.status === 'completed').forEach(r => {
      const t = r.request_type || 'unknown';
      map[t] = (map[t] || 0) + (r.credits_used || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [requests]);

  // Tokens by tier
  const byTier = useMemo(() => {
    const userTier: Record<string, string> = {};
    profiles.forEach(p => { userTier[p.id] = p.subscription_tier || 'free'; });
    const map: Record<string, number> = {};
    requests.filter(r => r.status === 'completed').forEach(r => {
      const tier = userTier[r.user_id] || 'free';
      map[tier] = (map[tier] || 0) + (r.credits_used || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [requests, profiles]);

  // Weekly trend (last 8 weeks)
  const weeklyTrend = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; start: Date; end: Date; tokens: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      weeks.push({
        label: `W${8 - i}`,
        start, end, tokens: 0,
      });
    }
    requests.filter(r => r.status === 'completed' && r.created_at).forEach(r => {
      const d = new Date(r.created_at!);
      for (const w of weeks) {
        if (d >= w.start && d <= w.end) {
          w.tokens += r.credits_used || 0;
          break;
        }
      }
    });
    return weeks.map(w => ({ week: w.label, tokens: w.tokens }));
  }, [requests]);

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Token Usage Dashboard</h2>
          <p className="text-muted-foreground text-sm">Real-time token consumption analytics</p>
        </div>
        <Button onClick={() => { load(); toast.info('Refreshed'); }} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tokens Consumed', value: stats.totalTokensUsed.toLocaleString(), icon: Coins, color: 'text-primary' },
              { label: 'Total Capacity', value: stats.totalCapacity.toLocaleString(), icon: TrendingUp, color: 'text-green-500' },
              { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'text-purple-500' },
              { label: 'Avg / User', value: stats.avgPerUser.toLocaleString(), icon: Activity, color: 'text-yellow-500' },
            ].map(c => (
              <div key={c.label} className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Daily usage area chart */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Daily Token Usage (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyUsage}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" fill="url(#tokenGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* By request type */}
            {byType.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Tokens by Content Type</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" name="Tokens" radius={[0, 4, 4, 0]}>
                      {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* By subscription tier */}
            {byTier.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Tokens by Subscription Tier</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byTier} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {byTier.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Weekly trend */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Weekly Token Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTokenDashboard;
