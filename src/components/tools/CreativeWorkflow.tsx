import { useState, useEffect, useRef } from 'react';
import {
  CalendarRange, Sparkles, Loader2, Wand2, ChevronRight, Clock,
  Flame, X, Play, Check, Globe, Instagram, ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/* ---------------- Types ---------------- */

type DayStatus = 'Draft' | 'Generating' | 'Ready to Post' | 'Published';
type GenStage = 'idle' | 'generating' | 'ready';
type Platform = 'tiktok' | 'instagram' | 'facebook';

interface Scene {
  id: string;
  visual: string;
  voiceover: string;
}

interface DayPlan {
  id: string;
  day: string;
  status: DayStatus;
  benchmark: string;
  concept: string;
  hook: string;
  body: string;
  scenes: Scene[];
  genStage: GenStage;
  platforms: Record<Platform, boolean>;
  time: string;
}

/* ---------------- Static seed data ---------------- */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BENCHMARKS = [
  '🔥 Inspired by Top Meta Skincare Ad, 85% Hold Rate',
  '🔥 Modeled on viral TikTok unboxing, 4.2M views',
  '📈 Based on best CTR Reel format, 12% engagement',
  '⚡ Mirrors trending "POV" hook, 92% retention',
  '🎯 Derived from high-ROAS UGC ad, 6.1x return',
  '💬 Patterned on comment-bait carousel, 38k saves',
  '🚀 Built from top Story swipe-up, 19% conversion',
];

const CONCEPTS = [
  'The 7-second glow transformation',
  'Behind the brand: founder story',
  'Myth vs Fact: skincare edition',
  '3 mistakes ruining your routine',
  'Real customer before & after',
  'Trend remix with our product',
  'Weekend self-care ritual',
];

const HOOKS = [
  'Stop scrolling, this changed my skin in 7 days',
  'Nobody tells you this about your morning routine',
  'I tried it for 30 days, here is what happened',
  'POV: you finally found the one product that works',
  'This is why your skincare is not working',
  'Watch this before you buy another serum',
  'The 30-second ritual that went viral',
];

const BODIES = [
  'Quick cuts of texture, application, and the glowing result with bold on-screen captions.',
  'Founder talks to camera, intercut with product b-roll and warm lifestyle shots.',
  'Side-by-side split screen comparing the wrong way vs the right way.',
  'Fast-paced listicle format with kinetic text and trending audio.',
  'Authentic UGC selfie style with real reactions and a clear CTA card.',
  'Aesthetic flat-lay reveal building to a satisfying close-up payoff.',
  'Calm ASMR-style sequence ending on the logo and offer.',
];

const STAGES = ['Cloning voice...', 'Rendering scenes...', 'Adding captions...', 'Color grading...', 'Finalizing export...'];

const PLATFORM_META: Record<Platform, { label: string; on: string; glyph: string }> = {
  tiktok: { label: 'TikTok', on: 'bg-foreground text-background', glyph: 'TT' },
  instagram: { label: 'Instagram Reels', on: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white', glyph: 'IG' },
  facebook: { label: 'Facebook Reels', on: 'bg-blue-600 text-white', glyph: 'f' },
};

const uid = () => Math.random().toString(36).slice(2);
const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

function buildDay(i: number): DayPlan {
  // Pre-seed a few different operational stages to simulate a live board.
  const presets: Partial<DayPlan>[] = [
    { status: 'Published', genStage: 'ready' },
    { status: 'Ready to Post', genStage: 'ready' },
    { status: 'Draft', genStage: 'idle' },
    { status: 'Generating', genStage: 'generating' },
    { status: 'Draft', genStage: 'idle' },
    { status: 'Ready to Post', genStage: 'ready' },
    { status: 'Draft', genStage: 'idle' },
  ];
  const preset = presets[i] || {};
  return {
    id: uid(),
    day: DAYS[i],
    status: 'Draft',
    benchmark: pick(BENCHMARKS, i),
    concept: pick(CONCEPTS, i),
    hook: pick(HOOKS, i),
    body: pick(BODIES, i),
    scenes: [
      { id: uid(), visual: 'Extreme close-up of product texture on fingertip, soft daylight.', voiceover: pick(HOOKS, i) },
      { id: uid(), visual: 'Quick application montage, mirror reflection, satisfying glide.', voiceover: 'Here is the routine that actually delivers results.' },
      { id: uid(), visual: 'Final glowing result, smile to camera, product held up.', voiceover: 'Tap the link, your skin will thank you.' },
    ],
    genStage: 'idle',
    platforms: { tiktok: true, instagram: i % 2 === 0, facebook: i % 3 === 0 },
    time: ['16:30', '12:00', '18:45', '09:15', '20:00', '11:30', '17:00'][i] || '16:30',
    ...preset,
  };
}

/* ---------------- Status badge ---------------- */

const STATUS_STYLES: Record<DayStatus, string> = {
  'Draft': 'bg-muted text-muted-foreground',
  'Generating': 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  'Ready to Post': 'bg-[#8C52FF]/15 text-[#8C52FF] border border-[#8C52FF]/30',
  'Published': 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
};

/* ---------------- Component ---------------- */

const BRAND_COLOR_PRESETS = ['#8C52FF', '#FF2E63', '#00C2A8', '#FF8A00', '#1DA1F2', '#111111'];

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
  const [days, setDays] = useState<DayPlan[] | null>(null);
  const [scriptDay, setScriptDay] = useState<DayPlan | null>(null);

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





  const patchDay = (id: string, patch: Partial<DayPlan>) =>
    setDays((prev) => (prev ? prev.map((d) => (d.id === id ? { ...d, ...patch } : d)) : prev));

  const handleStrategy = () => {
    if (!brandName.trim()) {
      toast.error('Add your brand name first.');
      return;
    }
    if (!product.trim()) {
      toast.error('Add a product or service description first.');
      return;
    }
    setGenerating(true);
    setDays(null);
    setTimeout(() => {
      setDays(DAYS.map((_, i) => buildDay(i)));
      setGenerating(false);
      const linked = [
        ...Object.values(social).filter(Boolean),
        ...Object.values(ecommerce).filter(Boolean),
      ].length;
      toast.success(`7-day strategy tailored to ${brandName}${linked ? `, benchmarked against ${linked} linked channel${linked > 1 ? 's' : ''}` : ''}.`);
    }, 1400);
  };


  const handleGenerateAsset = (day: DayPlan) => {
    patchDay(day.id, { genStage: 'generating', status: 'Generating' });
    setTimeout(() => {
      patchDay(day.id, { genStage: 'ready', status: 'Draft' });
    }, 3000);
  };

  const togglePlatform = (day: DayPlan, p: Platform) =>
    patchDay(day.id, { platforms: { ...day.platforms, [p]: !day.platforms[p] } });

  const approve = (day: DayPlan) => {
    patchDay(day.id, { status: 'Ready to Post' });
    toast.success(`${day.day} approved to queue.`);
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

      {/* Brand profile funnel */}
      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border space-y-4">
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
            Ready when you are, we benchmark your industry and build a data-driven week for <span className="text-foreground font-medium">{brandName || 'your brand'}</span>.
          </p>
          <Button
            onClick={handleStrategy}
            disabled={generating}
            className="bg-[#8C52FF] hover:bg-[#7a45e0] text-white gap-2 h-10"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Data-Driven 7-Day Strategy
          </Button>
        </div>
      </Card>

      {/* Empty state */}
      {!days && !generating && (
        <Card className="p-12 text-center border-dashed border-border bg-card/30">
          <CalendarRange className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Describe your product and generate a strategy to populate your 7-day workflow calendar.
          </p>
        </Card>
      )}

      {generating && (
        <Card className="p-12 text-center border-border bg-card/30">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8C52FF]" />
          <p className="mt-3 text-sm text-muted-foreground">Analyzing benchmarks and building your week...</p>
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
              <div className="rounded-lg border border-border p-2.5">
                <div className="relative mx-auto aspect-[9/16] w-full max-w-[140px] overflow-hidden rounded-lg bg-gradient-to-b from-muted to-muted/40">
                  {day.genStage === 'idle' && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">No asset yet</p>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateAsset(day)}
                        className="h-7 gap-1 bg-[#8C52FF] hover:bg-[#7a45e0] text-white text-[11px]"
                      >
                        <Wand2 className="h-3 w-3" /> Generate Asset
                      </Button>
                    </div>
                  )}
                  {day.genStage === 'generating' && <GeneratingPreview />}
                  {day.genStage === 'ready' && <MockPlayer />}
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
                  onClick={() => approve(day)}
                  disabled={day.status === 'Ready to Post' || day.status === 'Published'}
                  className="h-8 w-full gap-1 bg-[#8C52FF] hover:bg-[#7a45e0] text-white text-xs disabled:opacity-60"
                >
                  {day.status === 'Ready to Post' || day.status === 'Published'
                    ? <><Check className="h-3.5 w-3.5" /> Queued</>
                    : 'Approve to Queue'}
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
                <div key={scene.id} className="rounded-lg border border-border bg-background/40 p-3 space-y-2">
                  <p className="text-xs font-semibold text-[#8C52FF]">Scene {idx + 1}</p>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Visual prompt</label>
                    <Textarea
                      value={scene.visual}
                      onChange={(e) => {
                        const scenes = scriptDay.scenes.map((s) => s.id === scene.id ? { ...s, visual: e.target.value } : s);
                        const next = { ...scriptDay, scenes };
                        setScriptDay(next);
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
                        const scenes = scriptDay.scenes.map((s) => s.id === scene.id ? { ...s, voiceover: e.target.value } : s);
                        const next = { ...scriptDay, scenes };
                        setScriptDay(next);
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

const GeneratingPreview = () => {
  const [stage, setStage] = useState(0);
  // advance through stages every ~600ms for the 3s window
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      if (i >= STAGES.length) { clearInterval(t); return; }
      setStage(i);
    }, 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#8C52FF]" />
      <p className="text-[10px] text-muted-foreground animate-pulse">{STAGES[stage]}</p>
    </div>
  );
};

const MockPlayer = () => (
  <div className="group relative flex h-full w-full items-end justify-center overflow-hidden bg-gradient-to-b from-[#8C52FF]/30 via-background to-black">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
        <Play className="h-5 w-5 fill-white text-white" />
      </div>
    </div>
    <div className="relative z-10 w-full p-2">
      <span className="inline-block rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(140,82,255,0.8)]">
        ✨ Glow up in 7 days ✨
      </span>
    </div>
  </div>
);

export default CreativeWorkflow;
