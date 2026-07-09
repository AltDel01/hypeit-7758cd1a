import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Loader2, Sparkles, Search, History, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Seo from '@/components/seo/Seo';
import TikTokIcon from '@/components/tools/TikTokIcon';

type PlatformId = 'youtube' | 'tiktok' | 'x' | 'instagram' | 'web';

const PLATFORMS: { id: PlatformId; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'web', label: 'General Web' },
];

interface TrendEntry {
  platform: string;
  topics: string[];
  formats: string[];
  hooks: string[];
}

interface ContentIdea {
  title: string;
  platform: string;
  angle: string;
  hookExample: string;
  whyItWorks: string;
}

interface PastRun {
  id: string;
  industry: string;
  platforms: string[];
  report: TrendEntry[];
  ideas: ContentIdea[];
  created_at: string;
}

const TrendResearch = () => {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('');
  const [selected, setSelected] = useState<PlatformId[]>(['youtube', 'tiktok', 'web']);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TrendEntry[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [past, setPast] = useState<PastRun[]>([]);

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

  const togglePlatform = (id: PlatformId) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleResearch = async () => {
    if (!industry.trim()) {
      toast.error('Enter an industry or niche to research.');
      return;
    }
    if (selected.length === 0) {
      toast.error('Select at least one platform.');
      return;
    }
    setLoading(true);
    setReport([]);
    setIdeas([]);
    try {
      const { data, error } = await supabase.functions.invoke('trend-research', {
        body: { industry: industry.trim(), platforms: selected },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const nextReport: TrendEntry[] = Array.isArray(data?.trendReport) ? data.trendReport : [];
      const nextIdeas: ContentIdea[] = Array.isArray(data?.contentIdeas) ? data.contentIdeas : [];
      setReport(nextReport);
      setIdeas(nextIdeas);
      if (nextReport.length === 0 && nextIdeas.length === 0) {
        toast.error('No trends found. Try a broader industry term.');
      } else {
        toast.success('Trend research complete.');
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user) {
          await supabase.from('trend_research').insert({
            user_id: auth.user.id,
            industry: industry.trim(),
            platforms: selected,
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

  const openPastRun = (run: PastRun) => {
    setIndustry(run.industry);
    setSelected(run.platforms as PlatformId[]);
    setReport(run.report);
    setIdeas(run.ideas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuroraBackground>
      <Seo
        title="Trend Research, Cross-Platform Content Ideas | Viralin AI"
        description="Research what is trending in your industry across YouTube, TikTok, X, Instagram and the web, then turn it into ready-to-use content ideas."
        path="/trends"
      />
      <div className="min-h-screen text-white">
        <header className="border-b border-slate-700/50 bg-background/60 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <TrendingUp className="w-6 h-6 text-[#8C52FF]" />
            <div>
              <h1 className="text-xl md:text-2xl font-black">Trend Research</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                See what is trending in your industry, then turn it into content.
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
          {/* Search panel */}
          <Card className="p-5 md:p-6 bg-card/60 border-slate-700/50 backdrop-blur space-y-4">
            <div>
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
              <label className="text-sm font-medium mb-2 block">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = selected.includes(p.id);
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
                      {p.id === 'tiktok' && <TikTokIcon className="w-3.5 h-3.5" />}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              onClick={handleResearch}
              disabled={loading}
              className="bg-[#8C52FF] hover:bg-[#7a45e6] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" /> Research trends
                </>
              )}
            </Button>
          </Card>

          {loading && (
            <div className="text-center py-10 text-muted-foreground">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#8C52FF]" />
              Scanning platforms and analyzing what performs...
            </div>
          )}

          {/* Trend report */}
          {report.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8C52FF]" /> Trend report
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {report.map((entry, i) => (
                  <Card key={i} className="p-4 bg-card/60 border-slate-700/50 backdrop-blur space-y-3">
                    <h3 className="font-semibold text-[#8C52FF]">{entry.platform}</h3>
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
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Content ideas */}
          {ideas.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8C52FF]" /> Content ideas
              </h2>
              <div className="grid gap-3">
                {ideas.map((idea, i) => (
                  <Card key={i} className="p-4 bg-card/60 border-slate-700/50 backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#8C52FF]">#{i + 1}</span>
                          <h3 className="font-semibold">{idea.title}</h3>
                          <span className="text-[10px] uppercase tracking-wide bg-slate-800 rounded px-2 py-0.5 text-muted-foreground">
                            {idea.platform}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{idea.angle}</p>
                        {idea.hookExample && (
                          <p className="text-sm italic text-slate-400">"{idea.hookExample}"</p>
                        )}
                        {idea.whyItWorks && (
                          <p className="text-xs text-muted-foreground">Why it works: {idea.whyItWorks}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => useInWorkflow(idea)}
                        className="shrink-0 border-[#8C52FF]/50 text-[#8C52FF] hover:bg-[#8C52FF]/10"
                      >
                        Use <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Past runs */}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" /> Recent research
              </h2>
              <div className="grid gap-2">
                {past.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => openPastRun(run)}
                    className="text-left p-3 rounded-lg bg-card/40 border border-slate-700/40 hover:border-[#8C52FF]/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{run.industry}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.platforms.join(', ')} · {new Date(run.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </AuroraBackground>
  );
};

export default TrendResearch;
