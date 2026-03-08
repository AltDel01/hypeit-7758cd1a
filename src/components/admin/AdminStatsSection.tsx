import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3, Users, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface EditorStat {
  name: string;
  completed: number;
  inProgress: number;
  avgHours: number | null;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminStatsSection = () => {
  const [editorStats, setEditorStats] = useState<EditorStat[]>([]);
  const [totalStats, setTotalStats] = useState({ total: 0, completed: 0, inProgress: 0, newCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: requests } = await supabase.from('generation_requests').select('*');
      if (!requests) { setIsLoading(false); return; }

      setTotalStats({
        total: requests.length,
        completed: requests.filter((r) => r.status === 'completed').length,
        inProgress: requests.filter((r) => r.status === 'in-progress').length,
        newCount: requests.filter((r) => r.status === 'new').length,
      });

      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'editor');
      if (!roles || roles.length === 0) { setEditorStats([]); setIsLoading(false); return; }

      const editorIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from('profiles').select('id, display_name, email').in('id', editorIds);

      const stats: EditorStat[] = editorIds.map((uid) => {
        const profile = profiles?.find((p) => p.id === uid);
        const name = profile?.display_name || profile?.email?.split('@')[0] || 'Unknown';
        const editorReqs = requests.filter((r) => r.assigned_to === uid);
        const completedReqs = editorReqs.filter((r) => r.status === 'completed');
        const inProgressReqs = editorReqs.filter((r) => r.status === 'in-progress');

        const turnarounds = completedReqs
          .filter((r) => r.assigned_at && r.completed_at)
          .map((r) => (new Date(r.completed_at!).getTime() - new Date(r.assigned_at!).getTime()) / (1000 * 60 * 60));

        return {
          name,
          completed: completedReqs.length,
          inProgress: inProgressReqs.length,
          avgHours: turnarounds.length > 0 ? turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length : null,
        };
      });

      setEditorStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const pieData = [
    { name: 'Completed', value: totalStats.completed },
    { name: 'In Progress', value: totalStats.inProgress },
    { name: 'New', value: totalStats.newCount },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Stats</h2>
          <p className="text-muted-foreground text-sm">Track editor performance and request metrics</p>
        </div>
        <Button onClick={() => { loadStats(); toast.info('Refreshed'); }} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: totalStats.total, icon: BarChart3, color: 'text-primary' },
              { label: 'Completed', value: totalStats.completed, icon: CheckCircle, color: 'text-green-500' },
              { label: 'In Progress', value: totalStats.inProgress, icon: Clock, color: 'text-yellow-500' },
              { label: 'Editors', value: editorStats.length, icon: Users, color: 'text-primary' },
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

          <div className="grid md:grid-cols-2 gap-6">
            {pieData.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Request Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {editorStats.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Completions by Editor</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={editorStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Completed" />
                    <Bar dataKey="inProgress" fill="#f59e0b" radius={[4, 4, 0, 0]} name="In Progress" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {editorStats.length > 0 && (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
              <h3 className="font-semibold text-foreground p-4 pb-2">Editor Speed Rankings</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">#</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Editor</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Completed</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">In Progress</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Avg Turnaround</th>
                  </tr>
                </thead>
                <tbody>
                  {[...editorStats].sort((a, b) => b.completed - a.completed).map((editor, i) => (
                    <tr key={editor.name} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3 font-medium text-foreground">{editor.name}</td>
                      <td className="p-3 text-center text-foreground">{editor.completed}</td>
                      <td className="p-3 text-center text-foreground">{editor.inProgress}</td>
                      <td className="p-3 text-center text-foreground">
                        {editor.avgHours === null ? '—' : editor.avgHours < 1 ? `${Math.round(editor.avgHours * 60)}m` : `${editor.avgHours.toFixed(1)}h`}
                      </td>
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

export default AdminStatsSection;
