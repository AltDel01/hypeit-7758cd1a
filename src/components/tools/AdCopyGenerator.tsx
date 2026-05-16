import { useState } from 'react';
import { Loader2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Campaign {
  format: string;
  placement: string;
  size: string;
  tone: string;
  angle: string;
  headline: string;
  body: string;
  cta: string;
}

const AdCopyGenerator = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const analyze = async () => {
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Paste a full URL starting with https://');
      return;
    }
    setLoading(true);
    setCampaigns([]);
    setSummary('');
    try {
      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ad-copy-generator`;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ url }),
      });
      const json = await r.json();
      if (!r.ok) { toast.error(json?.error || 'Failed to analyze.'); return; }
      setSummary(json.brand_summary || '');
      setCampaigns(json.campaigns || []);
      toast.success(`Generated ${json.campaigns?.length || 0} campaigns.`);
    } catch (e) {
      console.error(e); toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const copyCampaign = (c: Campaign, i: number) => {
    const text = `${c.format} (${c.size}) - ${c.tone}\n\nHeadline: ${c.headline}\nBody: ${c.body}\nCTA: ${c.cta}\nAngle: ${c.angle}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Ad Copy Generator</h2>
        <p className="text-sm text-muted-foreground">Paste a brand URL. AI generates 15 ad campaigns across formats and tones.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="https://your-brand.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9 bg-slate-950/50 border-slate-700 text-white"
            onKeyDown={(e) => { if (e.key === 'Enter') analyze(); }}
          />
        </div>
        <Button onClick={analyze} disabled={loading} className="bg-[#8C52FF] hover:bg-[#7a45e0] text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
          {loading ? 'Analyzing brand…' : 'Generate 15 campaigns'}
        </Button>
      </div>

      {summary && (
        <Card className="bg-slate-900/60 border-slate-800 p-4">
          <p className="text-xs text-muted-foreground mb-1">Brand read</p>
          <p className="text-sm text-white">{summary}</p>
        </Card>
      )}

      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {campaigns.map((c, i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="border-[#8C52FF]/40 text-[#b88bff] text-[10px]">{c.placement}</Badge>
                  <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">{c.size}</Badge>
                  <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">{c.tone}</Badge>
                </div>
                <button onClick={() => copyCampaign(c, i)} className="text-slate-500 hover:text-white">
                  {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Headline</p>
                <p className="text-sm font-semibold text-white">{c.headline}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Body</p>
                <p className="text-sm text-slate-200">{c.body}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">CTA</p>
                <p className="text-sm text-[#b88bff] font-medium">{c.cta}</p>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-auto pt-2 border-t border-slate-800">Angle: {c.angle}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdCopyGenerator;
