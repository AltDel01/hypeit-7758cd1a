import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Zap, FileText, Clock, Play, Download } from 'lucide-react';

interface UserCreditHistoryProps {
  userId: string;
  userName: string;
}

interface RequestRecord {
  id: string;
  created_at: string | null;
  request_type: string;
  prompt: string;
  status: string | null;
  credits_used: number;
  result_url: string | null;
  video_played_at: string | null;
  video_downloaded_at: string | null;
}

const statusVariant = (status: string | null): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string } => {
  switch (status) {
    case 'completed': return { variant: 'default', label: 'Completed' };
    case 'in_progress':
    case 'assigned':
    case 'new': return { variant: 'secondary', label: status === 'new' ? 'New' : status === 'assigned' ? 'Assigned' : 'In Progress' };
    case 'failed':
    case 'cancelled': return { variant: 'destructive', label: status === 'failed' ? 'Failed' : 'Cancelled' };
    default: return { variant: 'outline', label: status || 'Unknown' };
  }
};

const TrackingIndicator = ({ timestamp, label }: { timestamp: string | null; label: string }) => {
  if (!timestamp) return <span title={`Not ${label.toLowerCase()} yet`}>❌</span>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">✅</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{format(new Date(timestamp), 'MMM d, yyyy HH:mm')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const UserCreditHistory: React.FC<UserCreditHistoryProps> = ({ userId, userName }) => {
  const [records, setRecords] = useState<RequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('generation_requests')
          .select('id, created_at, request_type, prompt, status, credits_used, result_url, video_played_at, video_downloaded_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRecords((data as RequestRecord[]) || []);
      } catch (e) {
        console.error('Error loading credit history:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId]);

  const totalCredits = records.reduce((s, r) => s + (r.status === 'completed' ? r.credits_used : 0), 0);
  const completedCount = records.filter(r => r.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <FileText className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground">{records.length}</p>
          <span className="text-xs text-muted-foreground">Total Requests</span>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground">{totalCredits}</p>
          <span className="text-xs text-muted-foreground">Credits Used</span>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground">{completedCount}</p>
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
      </div>

      {records.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No credit usage history found for {userName}</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2 max-h-[50vh] overflow-y-auto">
            {records.map(r => {
              const s = statusVariant(r.status);
              return (
                <div key={r.id} className="bg-card/50 border border-border rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">
                      {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy HH:mm') : '—'}
                    </span>
                    <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>
                  </div>
                  <p className="text-sm text-foreground truncate">{r.prompt}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{r.request_type}</span>
                    <span className="font-medium text-foreground">{r.credits_used} credits</span>
                  </div>
                  {r.request_type === 'video' && (
                    <div className="flex gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" /> Played: <TrackingIndicator timestamp={r.video_played_at} label="Played" />
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> Downloaded: <TrackingIndicator timestamp={r.video_downloaded_at} label="Downloaded" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block max-h-[50vh] overflow-y-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Prompt</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Played</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Downloaded</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Credits</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const s = statusVariant(r.status);
                  return (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy HH:mm') : '—'}
                      </td>
                      <td className="p-3 capitalize text-foreground">{r.request_type}</td>
                      <td className="p-3 text-foreground max-w-[200px] truncate">{r.prompt}</td>
                      <td className="p-3 text-center">
                        <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        {r.request_type === 'video' ? (
                          <TrackingIndicator timestamp={r.video_played_at} label="Played" />
                        ) : '—'}
                      </td>
                      <td className="p-3 text-center">
                        {r.request_type === 'video' ? (
                          <TrackingIndicator timestamp={r.video_downloaded_at} label="Downloaded" />
                        ) : '—'}
                      </td>
                      <td className="p-3 text-right font-medium text-foreground">{r.credits_used}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserCreditHistory;
