import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Zap, Search, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import UserCreditHistory from './UserCreditHistory';
import { toast } from 'sonner';

interface UserCredit {
  id: string;
  email: string;
  display_name: string | null;
  subscription_tier: string | null;
  generations_this_month: number;
  monthly_generation_limit: number;
  bonus_credits: number;
}

const AdminCreditsSection = () => {
  const [users, setUsers] = useState<UserCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'usage' | 'name'>('usage');

  const loadCredits = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, subscription_tier, generations_this_month, monthly_generation_limit, bonus_credits');
      if (error) throw error;
      setUsers((data as UserCredit[]) || []);
    } catch (e) {
      console.error('Error loading credits:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCredits(); }, [loadCredits]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = users.filter(u =>
      !q || u.email.toLowerCase().includes(q) || (u.display_name || '').toLowerCase().includes(q)
    );
    return list.sort((a, b) => {
      if (sortKey === 'usage') return b.generations_this_month - a.generations_this_month;
      return (a.display_name || a.email).localeCompare(b.display_name || b.email);
    });
  }, [users, search, sortKey]);

  const totalUsed = users.reduce((s, u) => s + (u.generations_this_month || 0), 0);
  const totalLimit = users.reduce((s, u) => s + (u.monthly_generation_limit || 0) + (u.bonus_credits || 0), 0);

  const getUsage = (u: UserCredit) => {
    const cap = (u.monthly_generation_limit || 0) + (u.bonus_credits || 0);
    return cap > 0 ? Math.min((u.generations_this_month / cap) * 100, 100) : 0;
  };

  const usageColor = (pct: number) =>
    pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-yellow-500' : 'bg-primary';

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Credit Usage</h2>
          <p className="text-muted-foreground text-sm">Monitor credit consumption across all users</p>
        </div>
        <Button onClick={() => { loadCredits(); toast.info('Refreshed'); }} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Users', value: users.length },
              { label: 'Credits Used', value: totalUsed },
              { label: 'Total Capacity', value: totalLimit },
            ].map(c => (
              <div key={c.label} className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <p className="text-2xl font-bold text-foreground">{c.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant={sortKey === 'usage' ? 'default' : 'outline'} size="sm" onClick={() => setSortKey('usage')}>By Usage</Button>
              <Button variant={sortKey === 'name' ? 'default' : 'outline'} size="sm" onClick={() => setSortKey('name')}>By Name</Button>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(u => {
              const pct = getUsage(u);
              return (
                <div key={u.id} className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{u.display_name || u.email.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground shrink-0">{u.subscription_tier || 'free'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{u.generations_this_month} / {u.monthly_generation_limit}{u.bonus_credits > 0 ? ` +${u.bonus_credits}` : ''}</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" indicatorClassName={usageColor(pct)} />
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Used</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Limit</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Bonus</th>
                  <th className="p-3 font-medium text-muted-foreground w-48">Usage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const pct = getUsage(u);
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-3">
                        <p className="font-medium text-foreground">{u.display_name || u.email.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{u.subscription_tier || 'free'}</span>
                      </td>
                      <td className="p-3 text-center text-foreground">{u.generations_this_month}</td>
                      <td className="p-3 text-center text-foreground">{u.monthly_generation_limit}</td>
                      <td className="p-3 text-center text-foreground">{u.bonus_credits}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 flex-1" indicatorClassName={usageColor(pct)} />
                          <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(pct)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreditsSection;
