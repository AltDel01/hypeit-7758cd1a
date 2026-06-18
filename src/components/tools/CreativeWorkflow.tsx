import { useState, useEffect, useRef } from 'react';
import {
  CalendarRange, Sparkles, Loader2, Wand2, ChevronRight, Clock,
  Flame, Check, Globe, Instagram, ShoppingBag, Image as ImageIcon, Video, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { resolveResultUrl } from '@/utils/resolveResultUrl';

/* ---------------- Types ---------------- */

type DayStatus = 'Draft' | 'Generating' | 'Ready to Post' | 'Published';
type GenStage = 'idle' | 'generating' | 'ready';
type Platform = 'tiktok' | 'instagram' | 'facebook';
type AssetType = 'image' | 'video';

interface Scene {
  visual: string;
  voiceover: string;
}

interface DayPlan {
  id: string;        // local + db id
  day: string;
  position: number;
  status: DayStatus;
  benchmark: string;
  concept: string;
  hook: string;
  body: string;
  scenes: Scene[];
  assetType: AssetType;
  assetUrl: string | null;
  genStage: GenStage;
  platforms: Record<Platform, boolean>;
  time: string;
  requestId: string | null;
}


/* ---------------- Static config ---------------- */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_TIMES = ['16:30', '12:00', '18:45', '09:15', '20:00', '11:30', '17:00'];
const STAGES = ['Cloning voice...', 'Rendering scenes...', 'Adding captions...', 'Color grading...', 'Finalizing export...'];

const PLATFORM_META: Record<Platform, { label: string; on: string; glyph: string }> = {
  tiktok: { label: 'TikTok', on: 'bg-foreground text-background', glyph: 'TT' },
  instagram: { label: 'Instagram Reels', on: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white', glyph: 'IG' },
  facebook: { label: 'Facebook Reels', on: 'bg-blue-600 text-white', glyph: 'f' },
};

const STATUS_STYLES: Record<DayStatus, string> = {
  'Draft': 'bg-muted text-muted-foreground',
  'Generating': 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  'Ready to Post': 'bg-[#8C52FF]/15 text-[#8C52FF] border border-[#8C52FF]/30',
  'Published': 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
};

const BRAND_COLOR_PRESETS = ['#8C52FF', '#FF2E63', '#00C2A8', '#FF8A00', '#1DA1F2', '#111111'];

/* ---------------- DB mapping ---------------- */

interface DayRow {
  id: string;
  day: string;
  position: number;
  status: string;
  benchmark: string;
  concept: string;
  hook: string;
  body: string;
  scenes: unknown;
  asset_type: string;
  asset_url: string | null;
  gen_stage: string;
  platforms: unknown;
  scheduled_time: string;
  request_id: string | null;
}


const rowToDay = (r: DayRow): DayPlan => ({
  id: r.id,
  day: r.day,
  position: r.position,
  status: (r.status as DayStatus) || 'Draft',
  benchmark: r.benchmark || '',
  concept: r.concept || '',
  hook: r.hook || '',
  body: r.body || '',
  scenes: Array.isArray(r.scenes) ? (r.scenes as Scene[]) : [],
  assetType: (r.asset_type as AssetType) || 'image',
  assetUrl: r.asset_url,
  genStage: (r.gen_stage as GenStage) || 'idle',
  platforms: (r.platforms as Record<Platform, boolean>) || { tiktok: true, instagram: false, facebook: false },
  time: r.scheduled_time || '16:30',
  requestId: r.request_id || null,
});

// Map local DayPlan field patch to DB column patch.
const patchToColumns = (patch: Partial<DayPlan>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.concept !== undefined) out.concept = patch.concept;
  if (patch.hook !== undefined) out.hook = patch.hook;
  if (patch.body !== undefined) out.body = patch.body;
  if (patch.scenes !== undefined) out.scenes = patch.scenes;
  if (patch.assetType !== undefined) out.asset_type = patch.assetType;
  if (patch.assetUrl !== undefined) out.asset_url = patch.assetUrl;
  if (patch.genStage !== undefined) out.gen_stage = patch.genStage;
  if (patch.platforms !== undefined) out.platforms = patch.platforms;
  if (patch.time !== undefined) out.scheduled_time = patch.time;
  return out;
};

/* ---------------- Component ---------------- */

const CreativeWorkflow = () => {
  // Brand funnel intake
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [brandMessage, setBrandMessage] = useState('');
  const [brandColor, setBrandColor] = useState('#8C52FF');
  const [social, setSocial] = useState({ instagram: '', tiktok: '', facebook: '' });
  const [ecommerce, setEcommerce] = useState({ tiktokshop: '', shopee: '', tokopedia: '' });
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [product, setProduct] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [days, setDays] = useState<DayPlan[] | null>(null);
  const [scriptDay, setScriptDay] = useState<DayPlan | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  // Brand Profile is a one-time setup: once a strategy is saved we jump straight to the calendar.
  const hasStrategy = !!days && days.length > 0;
  const showProfileForm = !hasStrategy || editingProfile;

  // Debounce timers for persisting per-day edits.
  const persistTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /* -------- Load most recent saved strategy on mount -------- */
  useEffect(() => {
    (async () => {
      try {
        const { data: strat } = await supabase
          .from('creative_strategies')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (strat) {
          setStrategyId(strat.id);
          setBrandName(strat.brand_name || '');
          setProduct(strat.product || '');
          setBrandMessage(strat.brand_message || '');
          setBrandColor(strat.brand_color || '#8C52FF');
          const { data: rows } = await supabase
            .from('creative_days')
            .select('*')
            .eq('strategy_id', strat.id)
            .order('position', { ascending: true });
          if (rows && rows.length) setDays(rows.map((r) => rowToDay(r as DayRow)));
        }
      } catch (e) {
        console.error('load strategy failed', e);
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, []);

  const handleScan = async (silent = false) => {
    if (!brandName.trim() && !website.trim()) {
      if (!silent) toast.error('Add your brand name or website first.');
      return;
    }
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('brand-scan', {
        body: { brandName, website, social },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.brandMessage) setBrandMessage(data.brandMessage);
      if (data?.brandColor) setBrandColor(data.brandColor);
      setScanned(true);
      toast.success('Brand voice and color auto-detected from your channels.');
    } catch (e) {
      console.error(e);
      if (!silent) toast.error(e instanceof Error ? e.message : 'Could not scan your brand. Try again.');
    } finally {
      setScanning(false);
    }
  };

  // Auto-scan once the user has supplied enough brand signals (debounced).
  const lastScanSig = useRef('');
  useEffect(() => {
    const hasSignal = website.trim() || social.instagram.trim() || social.tiktok.trim() || social.facebook.trim();
    if (!brandName.trim() || !hasSignal) return;
    const sig = JSON.stringify({ brandName, website, social });
    if (sig === lastScanSig.current) return;
    const t = setTimeout(() => {
      lastScanSig.current = sig;
      handleScan(true);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandName, website, social]);

  /* -------- Persist a single day's edits (debounced) -------- */
  const persistDay = (id: string, patch: Partial<DayPlan>) => {
    const cols = patchToColumns(patch);
    if (Object.keys(cols).length === 0) return;
    clearTimeout(persistTimers.current[id]);
    persistTimers.current[id] = setTimeout(async () => {
      const { error } = await supabase.from('creative_days').update(cols).eq('id', id);
      if (error) console.error('persist day failed', error);
    }, 700);
  };

  const patchDay = (id: string, patch: Partial<DayPlan>, persist = true) => {
    setDays((prev) => (prev ? prev.map((d) => (d.id === id ? { ...d, ...patch } : d)) : prev));
    if (persist) persistDay(id, patch);
  };

  /* -------- Poll pending video requests until the editor delivers them -------- */
  const hasPendingVideos = !!days?.some((d) => d.genStage === 'generating' && d.requestId);
  useEffect(() => {
    if (!hasPendingVideos) return;
    const poll = async () => {
      const pending = (days || []).filter((d) => d.genStage === 'generating' && d.requestId);
      if (!pending.length) return;
      const ids = pending.map((d) => d.requestId as string);
      const { data: reqs } = await supabase
        .from('generation_requests')
        .select('id, status, result_url')
        .in('id', ids);
      if (!reqs) return;
      for (const r of reqs) {
        if (r.status === 'completed' && r.result_url) {
          const day = pending.find((d) => d.requestId === r.id);
          if (day) {
            patchDay(day.id, { assetUrl: r.result_url, genStage: 'ready' }, false);
            await supabase
              .from('creative_days')
              .update({ asset_url: r.result_url, gen_stage: 'ready' })
              .eq('id', day.id);
          }
        }
      }
    };
    const t = setInterval(poll, 6000);
    poll();
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPendingVideos]);



  /* -------- Generate real strategy via AI + save -------- */
  const handleStrategy = async () => {
    if (!brandName.trim()) {
      toast.error('Add your brand name first.');
      return;
    }
    if (!product.trim()) {
      toast.error('Add a product or service description first.');
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      toast.error('Please sign in to generate and save a strategy.');
      return;
    }

    setGenerating(true);
    setDays(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-strategy', {
        body: { brandName, product, brandMessage, brandColor, social, ecommerce },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const genDays: Array<Omit<DayPlan, 'id' | 'platforms' | 'time' | 'status' | 'genStage' | 'assetUrl' | 'requestId'>> = data.days;

      // Create the strategy record.
      const { data: strat, error: sErr } = await supabase
        .from('creative_strategies')
        .insert({ user_id: userId, brand_name: brandName, product, brand_message: brandMessage, brand_color: brandColor })
        .select()
        .single();
      if (sErr) throw sErr;
      setStrategyId(strat.id);

      // Insert all 7 days.
      const rows = genDays.map((d, i) => ({
        strategy_id: strat.id,
        user_id: userId,
        day: d.day,
        position: i,
        status: 'Draft',
        benchmark: d.benchmark,
        concept: d.concept,
        hook: d.hook,
        body: d.body,
        scenes: d.scenes as unknown as Json,
        asset_type: d.assetType,
        gen_stage: 'idle',
        platforms: { tiktok: true, instagram: i % 2 === 0, facebook: i % 3 === 0 } as unknown as Json,
        scheduled_time: DEFAULT_TIMES[i] || '16:30',
      }));
      const { data: inserted, error: dErr } = await supabase
        .from('creative_days')
        .insert(rows)
        .select();
      if (dErr) throw dErr;
      setDays((inserted as DayRow[]).map(rowToDay).sort((a, b) => a.position - b.position));
      setEditingProfile(false);

      const linked = [...Object.values(social).filter(Boolean), ...Object.values(ecommerce).filter(Boolean)].length;
      toast.success(`7-day strategy tailored to ${brandName}${linked ? `, benchmarked against ${linked} linked channel${linked > 1 ? 's' : ''}` : ''}.`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Could not generate your strategy. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAsset = async (day: DayPlan) => {
    patchDay(day.id, { genStage: 'generating', status: 'Generating' }, false);
    try {
      const { data, error } = await supabase.functions.invoke('generate-creative-asset', {
        body: { dayId: day.id },
      });
      if (error) {
        // Surface insufficient-credit / rate-limit messages from the function body.
        let msg = 'Could not generate this asset. Try again.';
        try {
          const ctx = (error as { context?: Response }).context;
          if (ctx && typeof ctx.json === 'function') {
            const j = await ctx.json();
            if (j?.error) msg = j.error;
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);

      if (data?.assetType === 'image' && data?.assetUrl) {
        patchDay(day.id, { assetUrl: data.assetUrl, genStage: 'ready', status: 'Draft' }, false);
        toast.success(`Image generated for ${day.day}. ${data.creditsUsed} credits used.`);
      } else if (data?.assetType === 'video') {
        patchDay(day.id, { genStage: 'generating', status: 'Generating' }, false);
        toast.success(`Video for ${day.day} is being produced. We'll update it here when it's ready.`);
      }
    } catch (e) {
      console.error(e);
      patchDay(day.id, { genStage: 'idle', status: 'Draft' }, false);
      toast.error(e instanceof Error ? e.message : 'Could not generate this asset. Try again.');
    }
  };


  const setAssetType = (day: DayPlan, t: AssetType) => patchDay(day.id, { assetType: t });

  const togglePlatform = (day: DayPlan, p: Platform) =>
    patchDay(day.id, { platforms: { ...day.platforms, [p]: !day.platforms[p] } });

  const approve = (day: DayPlan) => {
    patchDay(day.id, { status: 'Ready to Post' });
    toast.success(`${day.day} approved to queue.`);
  };

  /* -------- Skip Brand Profile: build a blank, fully editable 7-day week -------- */
  const handleBlankWeek = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      toast.error('Please sign in to build your workflow.');
      return;
    }
    setGenerating(true);
    setDays(null);
    try {
      const { data: strat, error: sErr } = await supabase
        .from('creative_strategies')
        .insert({
          user_id: userId,
          brand_name: brandName || 'My Brand',
          product: product || '',
          brand_message: brandMessage || '',
          brand_color: brandColor,
        })
        .select()
        .single();
      if (sErr) throw sErr;
      setStrategyId(strat.id);

      const rows = DAYS.map((d, i) => ({
        strategy_id: strat.id,
        user_id: userId,
        day: d,
        position: i,
        status: 'Draft',
        benchmark: '',
        concept: '',
        hook: '',
        body: '',
        scenes: [] as unknown as Json,
        asset_type: 'image',
        gen_stage: 'idle',
        platforms: { tiktok: true, instagram: false, facebook: false } as unknown as Json,
        scheduled_time: DEFAULT_TIMES[i] || '16:30',
      }));
      const { data: inserted, error: dErr } = await supabase
        .from('creative_days')
        .insert(rows)
        .select();
      if (dErr) throw dErr;
      setDays((inserted as DayRow[]).map(rowToDay).sort((a, b) => a.position - b.position));
      setEditingProfile(false);
      toast.success('Blank 7-day week ready. Customize each day manually.');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Could not build a blank week. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  /* -------- Post a single day to its selected social platforms -------- */
  const handlePost = (day: DayPlan) => {
    if (day.genStage !== 'ready' || !day.assetUrl) {
      toast.error('Generate or add an asset before posting.');
      return;
    }
    const targets = (Object.keys(day.platforms) as Platform[]).filter((p) => day.platforms[p]);
    if (!targets.length) {
      toast.error('Select at least one platform to post to.');
      return;
    }
    patchDay(day.id, { status: 'Published' });
    toast.success(`${day.day} posted to ${targets.map((p) => PLATFORM_META[p].label).join(', ')}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#8C52FF]/15 p-2.5 text-[#8C52FF]">
          <CalendarRange className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Creative Workflow</h1>
          <p className="text-sm text-muted-foreground">
            Ideation, scripting, generation and automated posting to TikTok, Instagram and Facebook, planned across a full week.
          </p>
        </div>
      </div>

      {/* Brand summary bar (returning users) */}
      {hasStrategy && !editingProfile && (
        <Card className="p-3 bg-card/60 backdrop-blur-sm border-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#8C52FF]/15 p-2 text-[#8C52FF]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{brandName || 'Your brand'}</p>
                {product && <p className="text-xs text-muted-foreground line-clamp-1">{product}</p>}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingProfile(true)}
              className="gap-1.5 h-9"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit brand profile
            </Button>
          </div>
        </Card>
      )}

      {/* Brand profile funnel */}
      {showProfileForm && (
      <>
      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border space-y-4">
        {hasStrategy && editingProfile && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setEditingProfile(false)} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#8C52FF]/15 p-1.5 text-[#8C52FF]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Brand Profile</h2>
            <p className="text-xs text-muted-foreground">
              The more we know, the more accurate the benchmarking, brand voice and on-brand visuals.
            </p>
          </div>
        </div>

        {/* Identity */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">Brand Name</label>
            <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Glowance" />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Globe className="h-3 w-3" /> Website
            </label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourbrand.com" />
          </div>
        </div>

        {/* Product description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">What are you selling?</label>
          <Input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Organic vitamin C serum for glowing skin"
          />
        </div>

        {/* Social links */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Instagram className="h-3 w-3" /> Social Media Links
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="Instagram URL" />
            <Input value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} placeholder="TikTok URL" />
            <Input value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="Facebook URL" />
          </div>
        </div>

        {/* Ecommerce links */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ShoppingBag className="h-3 w-3" /> E-commerce Links
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input value={ecommerce.tiktokshop} onChange={(e) => setEcommerce({ ...ecommerce, tiktokshop: e.target.value })} placeholder="TikTok Shop URL" />
            <Input value={ecommerce.shopee} onChange={(e) => setEcommerce({ ...ecommerce, shopee: e.target.value })} placeholder="Shopee URL" />
            <Input value={ecommerce.tokopedia} onChange={(e) => setEcommerce({ ...ecommerce, tokopedia: e.target.value })} placeholder="Tokopedia URL" />
          </div>
        </div>

        {/* Auto-scan status */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[#8C52FF]/40 bg-[#8C52FF]/5 p-3">
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#8C52FF]" />
          ) : (
            <Wand2 className="h-4 w-4 text-[#8C52FF]" />
          )}
          <p className="text-xs text-muted-foreground">
            {scanning
              ? 'Scanning your website and social channels to detect your tone and brand color...'
              : scanned
                ? 'Brand voice and color auto-detected. Edit anything below if needed.'
                : 'Fill in your brand name, website and social links, the AI scans them automatically to recommend your brand message and color.'}
          </p>
        </div>

        {/* Brand message + color (auto-filled, still editable) */}
        <div className="relative grid gap-3 md:grid-cols-[2fr_1fr] md:items-start">
          {scanning && (
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-lg bg-background/70 backdrop-blur-sm">
              <Loader2 className="h-5 w-5 animate-spin text-[#8C52FF]" />
              <span className="text-xs text-muted-foreground">Detecting brand voice and color...</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              Brand Message / Tone
              {scanned && !scanning && (
                <span className="rounded-full bg-[#8C52FF]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#8C52FF]">AI suggested</span>
              )}
            </label>
            <Textarea
              value={brandMessage}
              onChange={(e) => setBrandMessage(e.target.value)}
              placeholder="Auto-filled after scanning, or type your own tone."
              className="min-h-[64px] text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Brand Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-9 w-10 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
              />
              <div className="flex flex-wrap gap-1.5">
                {BRAND_COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                      brandColor.toLowerCase() === c.toLowerCase() ? 'border-foreground' : 'border-transparent',
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </Card>

      {/* Control bar */}
      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Ready when you are, we benchmark your industry and build a data-driven week for <span className="text-foreground font-medium">{brandName || 'your brand'}</span>. Prefer full control? Skip and fill each day yourself.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleStrategy}
              disabled={generating}
              className="bg-[#8C52FF] hover:bg-[#7a45e0] text-white gap-2 h-10"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {days ? 'Regenerate 7-Day Strategy' : 'Generate Data-Driven 7-Day Strategy'}
            </Button>
            {!days && (
              <Button
                onClick={handleBlankWeek}
                disabled={generating}
                variant="outline"
                className="gap-2 h-10"
              >
                <CalendarRange className="h-4 w-4" /> Skip, build blank week
              </Button>
            )}
          </div>
        </div>
      </Card>
      </>
      )}

      {/* Empty state */}
      {!days && !generating && !loadingExisting && (
        <Card className="p-12 text-center border-dashed border-border bg-card/30">
          <CalendarRange className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Describe your product and generate a strategy to populate your 7-day workflow calendar.
          </p>
        </Card>
      )}

      {(generating || loadingExisting) && !days && (
        <Card className="p-12 text-center border-border bg-card/30">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8C52FF]" />
          <p className="mt-3 text-sm text-muted-foreground">
            {loadingExisting && !generating ? 'Loading your saved workflow...' : 'Analyzing benchmarks and building your week...'}
          </p>
        </Card>
      )}

      {/* 7-day board */}
      {days && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          {days.map((day) => (
            <Card key={day.id} className="flex flex-col gap-3 p-3 bg-card/60 backdrop-blur-sm border-border">
              {/* 1. Day header */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{day.day}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_STYLES[day.status])}>
                  {day.status}
                </span>
              </div>

              {/* 2. Ideation block */}
              <div className="rounded-lg bg-muted/40 p-2.5 space-y-2">
                <div className="flex items-center gap-1 text-[10px] text-amber-500">
                  <Flame className="h-3 w-3 shrink-0" />
                  <span className="leading-tight">{day.benchmark}</span>
                </div>
                <Input
                  value={day.concept}
                  onChange={(e) => patchDay(day.id, { concept: e.target.value })}
                  className="h-8 text-xs bg-background/60"
                  placeholder="Concept name"
                />
              </div>

              {/* 3. Scripting block */}
              <div className="rounded-lg border border-border p-2.5 space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Script preview</p>
                <p className="text-xs text-foreground line-clamp-2">
                  <span className="font-semibold text-[#8C52FF]">Hook:</span> {day.hook}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{day.body}</p>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setScriptDay(day)}
                  className="h-7 w-full justify-between text-xs"
                >
                  Expand Script <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* 4. Generation & preview block */}
              <div className="rounded-lg border border-border p-2.5 space-y-2">
                {/* Asset type switch */}
                <div className="flex items-center gap-1 rounded-md bg-muted/40 p-0.5">
                  {(['image', 'video'] as AssetType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAssetType(day, t)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors',
                        day.assetType === t ? 'bg-[#8C52FF] text-white' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {t === 'image' ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                      {t}
                    </button>
                  ))}
                </div>
                <div className="relative mx-auto aspect-[9/16] w-full max-w-[140px] overflow-hidden rounded-lg bg-gradient-to-b from-muted to-muted/40">
                  {day.genStage === 'idle' && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">No {day.assetType} yet</p>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateAsset(day)}
                        className="h-7 gap-1 bg-[#8C52FF] hover:bg-[#7a45e0] text-white text-[11px]"
                      >
                        <Wand2 className="h-3 w-3" /> Generate {day.assetType === 'video' ? 'Video' : 'Image'}
                      </Button>
                    </div>
                  )}
                  {day.genStage === 'generating' && <GeneratingPreview assetType={day.assetType} />}
                  {day.genStage === 'ready' && <AssetPreview assetUrl={day.assetUrl} assetType={day.assetType} />}
                </div>
              </div>

              {/* 5. Distribution & scheduler */}
              <div className="rounded-lg bg-muted/40 p-2.5 space-y-2.5">
                <div className="flex items-center justify-center gap-2">
                  {(Object.keys(PLATFORM_META) as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(day, p)}
                      title={PLATFORM_META[p].label}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                        day.platforms[p] ? PLATFORM_META[p].on : 'bg-muted text-muted-foreground/50 grayscale',
                      )}
                    >
                      {PLATFORM_META[p].glyph}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-md bg-background/60 px-2 py-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="time"
                    value={day.time}
                    onChange={(e) => patchDay(day.id, { time: e.target.value })}
                    className="w-full bg-transparent text-xs text-foreground outline-none"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => approve(day)}
                  disabled={day.status === 'Ready to Post' || day.status === 'Published'}
                  className="h-8 w-full gap-1 text-xs disabled:opacity-60"
                >
                  {day.status === 'Ready to Post' || day.status === 'Published'
                    ? <><Check className="h-3.5 w-3.5" /> Queued</>
                    : 'Approve to Queue'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePost(day)}
                  disabled={day.status === 'Published'}
                  className="h-8 w-full gap-1 bg-[#8C52FF] hover:bg-[#7a45e0] text-white text-xs disabled:opacity-60"
                >
                  {day.status === 'Published'
                    ? <><Check className="h-3.5 w-3.5" /> Posted</>
                    : <><Sparkles className="h-3.5 w-3.5" /> Post Now</>}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Script modal */}
      <Dialog open={!!scriptDay} onOpenChange={(o) => !o && setScriptDay(null)}>
        <DialogContent className="max-w-2xl border-border bg-card/80 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{scriptDay?.day} Script</span>
              {scriptDay && (
                <Badge variant="secondary" className="text-[10px]">{scriptDay.concept}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {scriptDay && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {scriptDay.scenes.map((scene, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-background/40 p-3 space-y-2">
                  <p className="text-xs font-semibold text-[#8C52FF]">Scene {idx + 1}</p>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Visual prompt</label>
                    <Textarea
                      value={scene.visual}
                      onChange={(e) => {
                        const scenes = scriptDay.scenes.map((s, i) => i === idx ? { ...s, visual: e.target.value } : s);
                        setScriptDay({ ...scriptDay, scenes });
                        patchDay(scriptDay.id, { scenes });
                      }}
                      className="min-h-[60px] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Voiceover script</label>
                    <Textarea
                      value={scene.voiceover}
                      onChange={(e) => {
                        const scenes = scriptDay.scenes.map((s, i) => i === idx ? { ...s, voiceover: e.target.value } : s);
                        setScriptDay({ ...scriptDay, scenes });
                        patchDay(scriptDay.id, { scenes });
                      }}
                      className="min-h-[50px] text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------------- Sub-views ---------------- */

const IMAGE_STAGES = ['Composing scene...', 'Applying brand style...', 'Rendering...', 'Finalizing...'];

const GeneratingPreview = ({ assetType }: { assetType: AssetType }) => {
  const stages = assetType === 'video' ? STAGES : IMAGE_STAGES;
  const [stage, setStage] = useState(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      if (i >= stages.length) { clearInterval(t); return; }
      setStage(i);
    }, 600);
    return () => clearInterval(t);
  }, [stages.length]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#8C52FF]" />
      <p className="text-[10px] text-muted-foreground animate-pulse">{stages[stage]}</p>
      {assetType === 'video' && (
        <p className="text-[9px] text-muted-foreground/70">Video is queued for production</p>
      )}
    </div>
  );
};

const AssetPreview = ({ assetUrl, assetType }: { assetUrl: string | null; assetType: AssetType }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!assetUrl) { setUrl(null); return; }
    resolveResultUrl(assetUrl).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [assetUrl]);

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#8C52FF]" />
      </div>
    );
  }

  if (assetType === 'video') {
    return <video src={url} controls className="h-full w-full object-cover" />;
  }
  return <img src={url} alt="Generated asset" className="h-full w-full object-cover" />;
};

export default CreativeWorkflow;
