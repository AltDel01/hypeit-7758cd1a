import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ListChecks, Loader2, Clock, CheckCircle2, XCircle, ListTodo,
  Instagram, Facebook, Image as ImageIcon, Video,
} from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import TikTokIcon from '@/components/tools/TikTokIcon';
import { resolveResultUrl } from '@/utils/resolveResultUrl';

type PostStatus = 'queued' | 'processing' | 'posted' | 'failed';

interface PostRow {
  id: string;
  day: string;
  position: number;
  concept: string;
  hook: string;
  body: string;
  asset_type: string;
  asset_url: string | null;
  platforms: Record<string, boolean> | null;
  scheduled_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const STATUS_META: Record<PostStatus, { label: string; icon: typeof Clock; className: string; spin?: boolean }> = {
  queued: { label: 'Queued', icon: ListTodo, className: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  processing: { label: 'Processing', icon: Loader2, className: 'bg-sky-500/15 text-sky-500 border-sky-500/30', spin: true },
  posted: { label: 'Posted', icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-red-500/15 text-red-500 border-red-500/30' },
};

const FILTERS: ('all' | PostStatus)[] = ['all', 'queued', 'processing', 'posted', 'failed'];

const PlatformIcons = ({ platforms }: { platforms: Record<string, boolean> | null }) => {
  if (!platforms) return null;
  return (
    <div className="flex items-center gap-1.5">
      {platforms.tiktok && <TikTokIcon className="h-3.5 w-3.5 text-foreground" />}
      {platforms.instagram && <Instagram className="h-3.5 w-3.5 text-pink-500" />}
      {platforms.facebook && <Facebook className="h-3.5 w-3.5 text-blue-500" />}
    </div>
  );
};

const Thumb = ({ url, type }: { url: string | null; type: string }) => {
  const [resolved, setResolved] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!url) { setResolved(null); return; }
    resolveResultUrl(url).then((u) => { if (active) setResolved(u); });
    return () => { active = false; };
  }, [url]);

  if (!url) {
    return (
      <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground/50">
        {type === 'video' ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
      </div>
    );
  }
  if (!resolved) {
    return (
      <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin text-[#8C52FF]" />
      </div>
    );
  }
  return type === 'video' ? (
    <video src={resolved} className="h-16 w-12 shrink-0 rounded-md object-cover" />
  ) : (
    <img src={resolved} alt={type} className="h-16 w-12 shrink-0 rounded-md object-cover" />
  );
};

const PostingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [filter, setFilter] = useState<'all' | PostStatus>('all');

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('creative_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setPosts((data as PostRow[]) || []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const visible = (posts || []).filter((p) => filter === 'all' || p.status === filter);

  return (
    <AuroraBackground>
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Workflow
        </Button>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#8C52FF]/15 p-2.5 text-[#8C52FF]">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Posting History</h1>
            <p className="text-sm text-muted-foreground">
              Every piece of content you generated and scheduled, with its current status.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                filter === f
                  ? 'border-[#8C52FF] bg-[#8C52FF]/15 text-[#8C52FF]'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {f === 'all' ? 'All' : STATUS_META[f].label}
            </button>
          ))}
        </div>

        {posts === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#8C52FF]" />
          </div>
        ) : visible.length === 0 ? (
          <Card className="border-dashed border-border bg-card/30 p-12 text-center">
            <ListChecks className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No posts yet. Generate and schedule content in the{' '}
              <Link to="/dashboard" className="text-[#8C52FF] underline">Creative Workflow</Link>.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map((p) => {
              const meta = STATUS_META[(p.status as PostStatus)] || STATUS_META.queued;
              const Icon = meta.icon;
              return (
                <Card key={p.id} className="flex items-center gap-3 bg-card/60 p-3 backdrop-blur-sm">
                  <Thumb url={p.asset_url} type={p.asset_type} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{p.day || `Day-${p.position + 1}`}</span>
                      <PlatformIcons platforms={p.platforms} />
                    </div>
                    <p className="truncate text-sm font-medium text-foreground">{p.concept || 'Untitled concept'}</p>
                    {p.hook && <p className="truncate text-xs text-muted-foreground">{p.hook}</p>}
                    <p className="text-[11px] text-muted-foreground">
                      {p.scheduled_time && <span>Scheduled {p.scheduled_time.replace('T', ' ')} · </span>}
                      Updated {new Date(p.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
                      meta.className,
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', meta.spin && 'animate-spin')} />
                    {meta.label}
                  </span>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AuroraBackground>
  );
};

export default PostingHistory;
