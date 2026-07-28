import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Loader2,
  Sparkles,
  Search,
  History,
  ArrowRight,
  SlidersHorizontal,
  Copy,
  Download,
  RotateCcw,
  Flame,
  Snowflake,
  Activity,
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  MessageCircle,
  Hash,
  Music2,
  Clock,
  Target,
  Users,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Seo from '@/components/seo/Seo';
import TikTokIcon from '@/components/tools/TikTokIcon';

type PlatformId =
  | 'youtube'
  | 'tiktok'
  | 'x'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'reddit'
  | 'pinterest'
  | 'threads'
  | 'web';

const PLATFORMS: { id: PlatformId; label: string; icon?: React.ElementType }[] = [
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'x', label: 'X / Twitter', icon: MessageCircle },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'reddit', label: 'Reddit', icon: MessageCircle },
  { id: 'pinterest', label: 'Pinterest', icon: Hash },
  { id: 'threads', label: 'Threads', icon: MessageCircle },
  { id: 'web', label: 'General Web', icon: Globe },
];

const REGIONS = ['Global', 'United States', 'United Kingdom', 'Indonesia', 'Singapore', 'Malaysia', 'Australia', 'India', 'Europe', 'Middle East', 'Latin America'];
const TIMEFRAMES = ['last 7 days', 'last 30 days', 'last 90 days', 'this year'];
const GOALS = ['Awareness', 'Engagement', 'Followers', 'Sales / conversions', 'Community', 'Brand authority'];
const TONES = ['Any', 'Bold and punchy', 'Educational', 'Funny', 'Luxury', 'Friendly', 'Inspirational', 'Straight to the point'];
const FORMATS = ['Talking head', 'Before / after', 'Listicle', 'Day in the life', 'Tutorial', 'UGC review', 'Skit', 'Green screen', 'Carousel', 'Podcast clip'];
const DEPTHS = [
  { id: 'quick', label: 'Quick', hint: 'Fast scan' },
  { id: 'standard', label: 'Standard', hint: 'Balanced' },
  { id: 'deep', label: 'Deep', hint: 'Most sources' },
];

const PRESETS: { label: string; apply: () => Partial<Filters> }[] = [
  { label: 'Viral short-form', apply: () => ({ platforms: ['tiktok', 'instagram', 'youtube'], goal: 'Awareness', formats: ['Talking head', 'Before / after'], timeframe: 'last 7 days' }) },
  { label: 'Sales driven', apply: () => ({ platforms: ['tiktok', 'instagram', 'facebook'], goal: 'Sales / conversions', formats: ['UGC review', 'Before / after'], tone: 'Bold and punchy' }) },
  { label: 'Authority / B2B', apply: () => ({ platforms: ['linkedin', 'youtube', 'x'], goal: 'Brand authority', formats: ['Listicle', 'Podcast clip'], tone: 'Educational' }) },
  { label: 'Community growth', apply: () => ({ platforms: ['reddit', 'threads', 'instagram'], goal: 'Community', formats: ['Day in the life', 'Skit'], tone: 'Friendly' }) },
];

interface Filters {
  platforms: PlatformId[];
  region: string;
  timeframe: string;
  goal: string;
  tone: string;
  formats: string[];
  depth: string;
}

interface TrendEntry {
  platform: string;
  momentum?: string;
  score?: number;
  topics: string[];
  formats: string[];
  hooks: string[];
  hashtags?: string[];
  sounds?: string[];
  bestPostTimes?: string[];
}

interface ContentIdea {
  title: string;
  platform: string;
  format?: string;
  difficulty?: string;
  viralScore?: number;
  angle: string;
  hookExample: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  whyItWorks: string;
}

interface CompetitorInsight {
  name: string;
  whatWorks: string;
  gap: string;
}

interface PastRun {
  id: string;
  industry: string;
  platforms: string[];
  report: TrendEntry[];
  ideas: ContentIdea[];
  created_at: string;
}

const momentumStyles: Record<string, { icon: React.ElementType; cls: string }> = {
  rising: { icon: Flame, cls: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  peaking: { icon: Activity, cls: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  cooling: { icon: Snowflake, cls: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
};

const TrendResearch = () => {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [keywords, setKeywords] = useState('');
  const [exclude, setExclude] = useState('');
  const [ideaCount, setIdeaCount] = useState(8);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    platforms: ['tiktok', 'instagram', 'youtube'],
    region: 'Global',
    timeframe: 'last 30 days',
    goal: 'Awareness',
    tone: 'Any',
    formats: [],
    depth: 'standard',
  });

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [report, setReport] = useState<TrendEntry[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [competitorInsights, setCompetitorInsights] = useState<CompetitorInsight[]>([]);
  const [past, setPast] = useState<PastRun[]>([]);

  const [ideaPlatformFilter, setIdeaPlatformFilter] = useState('all');
  const [ideaSort, setIdeaSort] = useState('rank');

  const loadPast = async () => {
    const { data } = await supabase
      .from('trend_research')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) {
      setPast(
        data.map((r) => ({
          id: r.id,
          industry: r.industry,
          platforms: (r.platforms as string[]) || [],
          report: (r.report as unknown as TrendEntry[]) || [],
          ideas: (r.ideas as unknown as ContentIdea[]) || [],
          created_at: r.created_at,
        })),
      );
    }
  };

  useEffect(() => {
    loadPast();
  }, []);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const togglePlatform = (id: PlatformId) =>
    setFilters((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter((p) => p !== id)
        : [...prev.platforms, id],
    }));

  const toggleFormat = (f: string) =>
    setFilters((prev) => ({
      ...prev,
      formats: prev.formats.includes(f) ? prev.formats.filter((x) => x !== f) : [...prev.formats, f],
    }));

  const resetAll = () => {
    setIndustry('');
    setAudience('');
    setCompetitors('');
    setKeywords('');
    setExclude('');
    setIdeaCount(8);
    setFilters({
      platforms: ['tiktok', 'instagram', 'youtube'],
      region: 'Global',
      timeframe: 'last 30 days',
      goal: 'Awareness',
      tone: 'Any',
      formats: [],
      depth: 'standard',
    });
    setSummary('');
    setReport([]);
    setIdeas([]);
    setCompetitorInsights([]);
  };

  const handleResearch = async () => {
    if (!industry.trim()) {
      toast.error('Enter an industry or niche to research.');
      return;
    }
    if (filters.platforms.length === 0) {
      toast.error('Select at least one platform.');
      return;
    }
    setLoading(true);
    setReport([]);
    setIdeas([]);
    setCompetitorInsights([]);
    setSummary('');
    try {
      const { data, error } = await supabase.functions.invoke('trend-research', {
        body: {
          industry: industry.trim(),
          platforms: filters.platforms,
          region: filters.region,
          timeframe: filters.timeframe,
          goal: filters.goal,
          tone: filters.tone,
          formats: filters.formats,
          depth: filters.depth,
          audience: audience.trim(),
          competitors: competitors.trim(),
          keywords: keywords.trim(),
          exclude: exclude.trim(),
          ideaCount,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const nextReport: TrendEntry[] = Array.isArray(data?.trendReport) ? data.trendReport : [];
      const nextIdeas: ContentIdea[] = Array.isArray(data?.contentIdeas) ? data.contentIdeas : [];
      setReport(nextReport);
      setIdeas(nextIdeas);
      setCompetitorInsights(Array.isArray(data?.competitorInsights) ? data.competitorInsights : []);
      setSummary(typeof data?.summary === 'string' ? data.summary : '');
      if (nextReport.length === 0 && nextIdeas.length === 0) {
        toast.error('No trends found. Try a broader industry term.');
      } else {
        toast.success('Trend research complete.');
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user) {
          await supabase.from('trend_research').insert({
            user_id: auth.user.id,
            industry: industry.trim(),
            platforms: filters.platforms,
            report: nextReport as unknown as never,
            ideas: nextIdeas as unknown as never,
          });
          loadPast();
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Trend research failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const useInWorkflow = (idea: ContentIdea) => {
    localStorage.setItem('viralin_trend_handoff', JSON.stringify(idea));
    toast.success('Idea sent to your Creative Workflow.');
    navigate('/dashboard');
  };

  const copyIdea = async (idea: ContentIdea) => {
    const text = [
      idea.title,
      idea.hookExample ? `Hook: ${idea.hookExample}` : '',
      idea.angle ? `Angle: ${idea.angle}` : '',
      idea.caption ? `Caption: ${idea.caption}` : '',
      idea.hashtags?.length ? idea.hashtags.join(' ') : '',
      idea.cta ? `CTA: ${idea.cta}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    await navigator.clipboard.writeText(text);
    toast.success('Idea copied.');
  };

  const exportCsv = () => {
    const rows = [
      ['Title', 'Platform', 'Format', 'Difficulty', 'Viral score', 'Hook', 'Angle', 'Caption', 'Hashtags', 'CTA'],
      ...ideas.map((i) => [
        i.title,
        i.platform,
        i.format || '',
        i.difficulty || '',
        String(i.viralScore ?? ''),
        i.hookExample || '',
        i.angle || '',
        i.caption || '',
        (i.hashtags || []).join(' '),
        i.cta || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `trend-ideas-${industry.trim().replace(/\s+/g, '-') || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPastRun = (run: PastRun) => {
    setIndustry(run.industry);
    setFilter('platforms', run.platforms as PlatformId[]);
    setReport(run.report);
    setIdeas(run.ideas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePastRun = async (id: string) => {
    await supabase.from('trend_research').delete().eq('id', id);
    setPast((p) => p.filter((r) => r.id !== id));
  };

  const ideaPlatforms = useMemo(
    () => Array.from(new Set(ideas.map((i) => i.platform).filter(Boolean))),
    [ideas],
  );

  const visibleIdeas = useMemo(() => {
    let list = ideas.map((i, idx) => ({ ...i, _rank: idx }));
    if (ideaPlatformFilter !== 'all') list = list.filter((i) => i.platform === ideaPlatformFilter);
    if (ideaSort === 'score') list = [...list].sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0));
    if (ideaSort === 'easiest') {
      const order: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
      list = [...list].sort((a, b) => (order[a.difficulty || 'medium'] ?? 1) - (order[b.difficulty || 'medium'] ?? 1));
    }
    return list;
  }, [ideas, ideaPlatformFilter, ideaSort]);

  const hasResults = report.length > 0 || ideas.length > 0;

  return (
    <AuroraBackground>
      <Seo
        title="Trend Research, Cross-Platform Content Ideas | Viralin AI"
        description="Research what is trending in your industry across TikTok, Instagram, YouTube, Facebook and more, then turn it into ready-to-use content ideas."
        path="/trends"
      />
      <div className="min-h-screen text-white">
        <header className="border-b border-slate-700/50 bg-background/60 backdrop-blur sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <TrendingUp className="w-6 h-6 text-[#8C52FF]" />
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-black">Trend Research</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Deep cross-platform intelligence, tuned to your market, audience and goal.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetAll} className="hidden md:inline-flex text-muted-foreground">
              <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
          {/* Search panel */}
          <Card className="p-5 md:p-6 bg-card/60 border-slate-700/50 backdrop-blur space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Industry or niche</label>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. sustainable skincare, home fitness, indie SaaS"
                  onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                  className="bg-background/60"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Market</label>
                <Select value={filters.region} onValueChange={(v) => setFilter('region', v)}>
                  <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground mr-1">Presets</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setFilters((prev) => ({ ...prev, ...p.apply() }))}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-700/60 bg-slate-800/40 text-slate-300 hover:text-white hover:border-[#8C52FF]/60 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = filters.platforms.includes(p.id);
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                        active
                          ? 'bg-[#8C52FF] text-white border-[#8C52FF] shadow-lg shadow-[#8C52FF]/30'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:text-white',
                      )}
                    >
                      {p.id === 'tiktok' ? <TikTokIcon className="w-3.5 h-3.5" /> : Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Timeframe
                </label>
                <Select value={filters.timeframe} onValueChange={(v) => setFilter('timeframe', v)}>
                  <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-muted-foreground" /> Goal
                </label>
                <Select value={filters.goal} onValueChange={(v) => setFilter('goal', v)}>
                  <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Research depth</label>
                <div className="flex rounded-lg border border-slate-700/60 overflow-hidden">
                  {DEPTHS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setFilter('depth', d.id)}
                      className={cn(
                        'flex-1 py-2 text-xs font-medium transition-colors',
                        filters.depth === d.id ? 'bg-[#8C52FF] text-white' : 'bg-slate-800/40 text-slate-300 hover:text-white',
                      )}
                      title={d.hint}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white -ml-2">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {advancedOpen ? 'Hide advanced options' : 'Advanced options'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <Separator className="bg-slate-700/50" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" /> Target audience
                    </label>
                    <Input
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. women 25-34 who care about clean beauty"
                      className="bg-background/60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone of voice</label>
                    <Select value={filters.tone} onValueChange={(v) => setFilter('tone', v)}>
                      <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Preferred formats</label>
                  <div className="flex flex-wrap gap-2">
                    {FORMATS.map((f) => (
                      <button
                        key={f}
                        onClick={() => toggleFormat(f)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs border transition-colors',
                          filters.formats.includes(f)
                            ? 'bg-[#8C52FF]/20 text-white border-[#8C52FF]'
                            : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:text-white',
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Competitors to benchmark</label>
                    <Input
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                      placeholder="@brandone, @brandtwo (comma separated)"
                      className="bg-background/60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Must-include keywords</label>
                    <Input
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="vitamin c, glass skin"
                      className="bg-background/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Avoid these topics or terms</label>
                  <Textarea
                    value={exclude}
                    onChange={(e) => setExclude(e.target.value)}
                    placeholder="e.g. politics, medical claims, discount codes"
                    className="bg-background/60 min-h-[70px]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Number of content ideas</label>
                    <span className="text-sm font-bold text-[#8C52FF]">{ideaCount}</span>
                  </div>
                  <Slider value={[ideaCount]} onValueChange={(v) => setIdeaCount(v[0])} min={3} max={20} step={1} />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button onClick={handleResearch} disabled={loading} className="bg-[#8C52FF] hover:bg-[#7a45e6] text-white">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Researching...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Research trends</>
                )}
              </Button>
              {hasResults && (
                <>
                  <Button variant="outline" onClick={exportCsv} className="border-slate-700/60">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                  <Button variant="ghost" onClick={handleResearch} disabled={loading} className="text-muted-foreground">
                    <RotateCcw className="w-4 h-4 mr-2" /> Re-run
                  </Button>
                </>
              )}
              <span className="text-xs text-muted-foreground">
                {filters.platforms.length} platforms · {filters.depth} depth · {ideaCount} ideas
              </span>
            </div>
          </Card>

          {loading && (
            <div className="text-center py-10 text-muted-foreground">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#8C52FF]" />
              Scanning platforms and analyzing what performs...
            </div>
          )}

          {hasResults && (
            <Tabs defaultValue="trends" className="space-y-5">
              <TabsList className="bg-slate-800/50 border border-slate-700/50">
                <TabsTrigger value="trends">Trend report</TabsTrigger>
                <TabsTrigger value="ideas">Content ideas ({ideas.length})</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-4">
                {summary && (
                  <Card className="p-4 bg-[#8C52FF]/10 border-[#8C52FF]/30 backdrop-blur">
                    <p className="text-sm text-slate-200">{summary}</p>
                  </Card>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {report.map((entry, i) => {
                    const m = momentumStyles[(entry.momentum || '').toLowerCase()];
                    const MIcon = m?.icon;
                    return (
                      <Card key={i} className="p-4 bg-card/60 border-slate-700/50 backdrop-blur space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-[#8C52FF]">{entry.platform}</h3>
                          <div className="flex items-center gap-2">
                            {m && (
                              <Badge variant="outline" className={cn('text-[10px] uppercase', m.cls)}>
                                {MIcon && <MIcon className="w-3 h-3 mr-1" />}
                                {entry.momentum}
                              </Badge>
                            )}
                            {typeof entry.score === 'number' && (
                              <span className="text-xs font-bold text-white">{entry.score}<span className="text-muted-foreground">/100</span></span>
                            )}
                          </div>
                        </div>
                        {typeof entry.score === 'number' && (
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-[#8C52FF]" style={{ width: `${Math.min(100, Math.max(0, entry.score))}%` }} />
                          </div>
                        )}
                        {entry.topics?.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Trending topics</p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.topics.map((t, j) => (
                                <span key={j} className="text-xs bg-slate-800 rounded px-2 py-1">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.formats?.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Winning formats</p>
                            <ul className="text-sm text-slate-300 list-disc pl-4 space-y-0.5">
                              {entry.formats.map((f, j) => <li key={j}>{f}</li>)}
                            </ul>
                          </div>
                        )}
                        {entry.hooks?.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recurring hooks</p>
                            <ul className="text-sm text-slate-300 list-disc pl-4 space-y-0.5">
                              {entry.hooks.map((h, j) => <li key={j}>{h}</li>)}
                            </ul>
                          </div>
                        )}
                        {entry.hashtags && entry.hashtags.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                              <Hash className="w-3 h-3" /> Viral hashtags
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.hashtags.map((h, j) => (
                                <button
                                  key={j}
                                  onClick={() => { navigator.clipboard.writeText(h); toast.success('Hashtag copied.'); }}
                                  className="text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-1 text-[#8C52FF]"
                                >
                                  {h}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.sounds && entry.sounds.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                              <Music2 className="w-3 h-3" /> Trending sounds
                            </p>
                            <ul className="text-sm text-slate-300 list-disc pl-4 space-y-0.5">
                              {entry.sounds.map((s, j) => <li key={j}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {entry.bestPostTimes && entry.bestPostTimes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {entry.bestPostTimes.map((t, j) => (
                              <span key={j} className="text-xs text-slate-400">{t}{j < entry.bestPostTimes!.length - 1 ? ',' : ''}</span>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="ideas" className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={ideaPlatformFilter} onValueChange={setIdeaPlatformFilter}>
                    <SelectTrigger className="w-[180px] bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All platforms</SelectItem>
                      {ideaPlatforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={ideaSort} onValueChange={setIdeaSort}>
                    <SelectTrigger className="w-[180px] bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rank">Sort: AI ranking</SelectItem>
                      <SelectItem value="score">Sort: viral score</SelectItem>
                      <SelectItem value="easiest">Sort: easiest first</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">{visibleIdeas.length} shown</span>
                </div>

                <div className="grid gap-3">
                  {visibleIdeas.map((idea, i) => (
                    <Card key={i} className="p-4 bg-card/60 border-slate-700/50 backdrop-blur">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-[#8C52FF]">#{idea._rank + 1}</span>
                            <h3 className="font-semibold">{idea.title}</h3>
                            <Badge variant="outline" className="text-[10px] uppercase border-slate-600 text-muted-foreground">
                              {idea.platform}
                            </Badge>
                            {idea.format && (
                              <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300">{idea.format}</Badge>
                            )}
                            {idea.difficulty && (
                              <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300">{idea.difficulty}</Badge>
                            )}
                            {typeof idea.viralScore === 'number' && (
                              <Badge className="text-[10px] bg-[#8C52FF]/20 text-[#8C52FF] border-[#8C52FF]/40">
                                <Flame className="w-3 h-3 mr-1" /> {idea.viralScore}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-300">{idea.angle}</p>
                          {idea.hookExample && <p className="text-sm italic text-slate-400">"{idea.hookExample}"</p>}
                          {idea.caption && (
                            <p className="text-xs text-slate-400 bg-slate-800/50 rounded p-2">{idea.caption}</p>
                          )}
                          {idea.hashtags && idea.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {idea.hashtags.map((h, j) => (
                                <span key={j} className="text-xs text-[#8C52FF]">{h}</span>
                              ))}
                            </div>
                          )}
                          {idea.cta && <p className="text-xs text-slate-400">CTA: {idea.cta}</p>}
                          {idea.whyItWorks && (
                            <p className="text-xs text-muted-foreground">Why it works: {idea.whyItWorks}</p>
                          )}
                        </div>
                        <div className="flex md:flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => useInWorkflow(idea)}
                            className="bg-[#8C52FF] hover:bg-[#7a45e6] text-white"
                          >
                            Use <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => copyIdea(idea)} className="border-slate-700/60">
                            <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-3">
                {competitorInsights.length === 0 ? (
                  <Card className="p-6 bg-card/60 border-slate-700/50 text-center text-sm text-muted-foreground">
                    Add competitor handles in advanced options to benchmark what works for them.
                  </Card>
                ) : (
                  competitorInsights.map((c, i) => (
                    <Card key={i} className="p-4 bg-card/60 border-slate-700/50 backdrop-blur space-y-1.5">
                      <h3 className="font-semibold text-[#8C52FF]">{c.name}</h3>
                      <p className="text-sm text-slate-300">What works: {c.whatWorks}</p>
                      <p className="text-sm text-emerald-300">Your gap: {c.gap}</p>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Past runs */}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" /> Recent research
              </h2>
              <div className="grid gap-2">
                {past.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 rounded-lg bg-card/40 border border-slate-700/40 hover:border-[#8C52FF]/50 transition-colors flex items-center justify-between gap-3"
                  >
                    <button onClick={() => openPastRun(run)} className="text-left flex-1">
                      <p className="font-medium">{run.industry}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.platforms.join(', ')} · {new Date(run.created_at).toLocaleDateString()}
                      </p>
                    </button>
                    <Button size="icon" variant="ghost" onClick={() => deletePastRun(run.id)} className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {!hasResults && !loading && (
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: Sparkles, title: 'Multi-platform scan', text: 'Live search across up to 10 networks, then AI synthesis.' },
                { icon: Music2, title: 'Sounds and hashtags', text: 'Surface trending audio and hashtags per platform.' },
                { icon: Target, title: 'Goal tuned ideas', text: 'Ideas scored for virality and matched to your objective.' },
              ].map((f, i) => (
                <Card key={i} className="p-4 bg-card/40 border-slate-700/40 space-y-1.5">
                  <f.icon className="w-5 h-5 text-[#8C52FF]" />
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.text}</p>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuroraBackground>
  );
};

export default TrendResearch;
