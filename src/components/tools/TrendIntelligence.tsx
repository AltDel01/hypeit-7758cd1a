import React, { useState } from 'react';
import { Loader2, Radar, Search, Music2, Hash, Users, Sparkles, Instagram, Facebook, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import TikTokIcon from '@/components/tools/TikTokIcon';

type PlatformId = 'tiktok' | 'instagram' | 'facebook' | 'youtube';

const PLATFORMS: { id: PlatformId; label: string; icon: React.ElementType }[] = [
  { id: 'tiktok', label: 'TikTok', icon: TikTokIcon },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
];

interface PlatformTrend {
  platform: string;
  topics: string[];
  formats: string[];
  hooks: string[];
  postingTip: string;
}
interface SoundItem {
  name: string;
  platform: string;
  vibe: string;
  useFor: string;
}
interface HashtagItem {
  tag: string;
  platform: string;
  momentum: string;
  note: string;
}
interface CompetitorItem {
  name: string;
  whatTheyPost: string;
  whatWorks: string;
  gapForYou: string;
}

const TrendIntelligence = () => {
  const [industry, setIndustry] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [selected, setSelected] = useState<PlatformId[]>(['tiktok', 'instagram', 'youtube']);
  const [loading, setLoading] = useState(false);
  const [platformTrends, setPlatformTrends] = useState<PlatformTrend[]>([]);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [hashtags, setHashtags] = useState<HashtagItem[]>([]);
  const [rivals, setRivals] = useState<CompetitorItem[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  const toggle = (id: PlatformId) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleScan = async () => {
    if (!industry.trim()) {
      toast.error('Enter your industry or niche.');
      return;
    }
    if (selected.length === 0) {
      toast.error('Select at least one platform.');
      return;
    }
    setLoading(true);
    setPlatformTrends([]);
    setSounds([]);
    setHashtags([]);
    setRivals([]);
    setActions([]);
    try {
      const { data, error } = await supabase.functions.invoke('trend-intel', {
        body: {
          industry: industry.trim(),
          platforms: selected,
          competitors: competitors
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlatformTrends(Array.isArray(data?.platforms) ? data.platforms : []);
      setSounds(Array.isArray(data?.sounds) ? data.sounds : []);
      setHashtags(Array.isArray(data?.hashtags) ? data.hashtags : []);
      setRivals(Array.isArray(data?.competitors) ? data.competitors : []);
      setActions(Array.isArray(data?.actions) ? data.actions : []);
      toast.success('Trend intelligence ready.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Trend scan failed.');
    } finally {
      setLoading(false);
    }
  };

  const hasResults = platformTrends.length > 0 || sounds.length > 0 || hashtags.length > 0 || rivals.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radar className="h-6 w-6 text-[#8C52FF]" />
          Social Media Trend Intelligence
        </h1>
        <p className="text-sm text-muted-foreground">
          Track TikTok, Instagram, Facebook and YouTube trends, trending sounds, viral hashtags and competitors, so you
          create content people already want.
        </p>
      </div>

      <Card className="p-5 space-y-4 bg-card/60 backdrop-blur-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your industry or niche</label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Organic skincare for sensitive skin"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Competitors to monitor (optional)</label>
            <Input
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="e.g. Somethinc, Skintific, Avoskin"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                    active
                      ? 'border-[#8C52FF] bg-[#8C52FF]/15 text-[#8C52FF]'
                      : 'border-border text-muted-foreground hover:bg-muted/50',
                  )}
                >
                  <p.icon className="h-4 w-4" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={handleScan} disabled={loading} className="gap-2 bg-[#8C52FF] hover:bg-[#7a45e0]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? 'Scanning platforms...' : 'Scan trends'}
        </Button>
      </Card>

      {loading && (
        <Card className="p-8 text-center text-sm text-muted-foreground bg-card/60">
          Pulling live signals from {selected.length} platform{selected.length > 1 ? 's' : ''}, sounds, hashtags and
          competitors. This can take up to a minute.
        </Card>
      )}

      {hasResults && (
        <div className="space-y-6 animate-fade-in">
          {actions.length > 0 && (
            <Card className="p-5 bg-[#8C52FF]/10 border-[#8C52FF]/30">
              <h2 className="font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#8C52FF]" /> Do this next
              </h2>
              <ul className="space-y-2 text-sm">
                {actions.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#8C52FF]">{i + 1}.</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {platformTrends.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {platformTrends.map((t, i) => (
                <Card key={i} className="p-5 space-y-3 bg-card/60">
                  <h3 className="font-semibold">{t.platform}</h3>
                  {(t.topics || []).length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Trending topics</p>
                      <div className="flex flex-wrap gap-1.5">
                        {t.topics.map((x, j) => (
                          <span key={j} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(t.formats || []).length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Formats that work</p>
                      <p className="text-sm">{t.formats.join(', ')}</p>
                    </div>
                  )}
                  {(t.hooks || []).length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Hook styles</p>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        {t.hooks.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {t.postingTip && <p className="text-xs text-muted-foreground italic">{t.postingTip}</p>}
                </Card>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {sounds.length > 0 && (
              <Card className="p-5 space-y-3 bg-card/60">
                <h3 className="font-semibold flex items-center gap-2">
                  <Music2 className="h-4 w-4 text-[#8C52FF]" /> Trending sounds
                </h3>
                <ul className="space-y-3">
                  {sounds.map((s, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium">
                        {s.name} <span className="text-xs text-muted-foreground">({s.platform})</span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {s.vibe}, use for {s.useFor}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {hashtags.length > 0 && (
              <Card className="p-5 space-y-3 bg-card/60">
                <h3 className="font-semibold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-[#8C52FF]" /> Viral hashtags
                </h3>
                <ul className="space-y-2">
                  {hashtags.map((h, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <span className="text-[#8C52FF] font-medium">{h.tag}</span>
                        <p className="text-xs text-muted-foreground">{h.note}</p>
                      </div>
                      <span className="text-xs whitespace-nowrap rounded-full bg-muted px-2 py-0.5">{h.momentum}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {rivals.length > 0 && (
            <Card className="p-5 space-y-4 bg-card/60">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-[#8C52FF]" /> Competitor monitoring
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {rivals.map((c, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1">
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Posts: {c.whatTheyPost}</p>
                    <p className="text-xs text-muted-foreground">Works: {c.whatWorks}</p>
                    <p className="text-xs text-[#8C52FF]">Your gap: {c.gapForYou}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendIntelligence;
