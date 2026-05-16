import { useRef, useState } from 'react';
import { Loader2, Upload, Brain, Eye, Ear, MessageSquare, Target, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BrainScores {
  visual_cortex: number;
  attention_control: number;
  auditory_processing: number;
  language_network: number;
  focus_drift: number;
}
interface Result {
  viral_score: number;
  hook_score: number;
  hold_rate: number;
  verdict: string;
  brain: BrainScores;
  improvements: string[];
}

const ViralPredictor = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<'TikTok' | 'Reels' | 'YouTube Shorts'>('TikTok');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onPick = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) { toast.error('Upload a video file.'); return; }
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      if (v.duration > 15.5) {
        toast.error('Clip must be 15 seconds or shorter.');
        URL.revokeObjectURL(url);
        return;
      }
      setFile(f);
      setPreviewUrl(url);
      setDuration(v.duration);
    };
  };

  const predict = async () => {
    if (!file) { toast.error('Upload a clip first.'); return; }
    setLoading(true);
    setResult(null);
    try {
      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/viral-predictor`;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          durationSeconds: duration,
          sizeBytes: file.size,
          description,
          platform,
        }),
      });
      const json = await r.json();
      if (!r.ok) { toast.error(json?.error || 'Failed.'); return; }
      setResult(json);
    } catch (e) {
      console.error(e); toast.error('Network error.');
    } finally { setLoading(false); }
  };

  const regions = result ? [
    { key: 'visual_cortex', label: 'Visual cortex', icon: Eye, value: result.brain.visual_cortex, invert: false },
    { key: 'attention_control', label: 'Attention control', icon: Target, value: result.brain.attention_control, invert: false },
    { key: 'auditory_processing', label: 'Auditory processing', icon: Ear, value: result.brain.auditory_processing, invert: false },
    { key: 'language_network', label: 'Language network', icon: MessageSquare, value: result.brain.language_network, invert: false },
    { key: 'focus_drift', label: 'Focus drift (lower better)', icon: TrendingDown, value: result.brain.focus_drift, invert: true },
  ] : [];

  const heatColor = (v: number, invert: boolean) => {
    const score = invert ? 100 - v : v;
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Viral Predictor</h2>
        <p className="text-sm text-muted-foreground">Upload a clip up to 15 seconds. Get a viral score, hook strength, hold rate, and brain-region heatmap before you spend a cent on ads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-3">
          <input ref={inputRef} type="file" accept="video/*" hidden
            onChange={(e) => onPick(e.target.files?.[0])} />

          {!previewUrl ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-video border-2 border-dashed border-slate-700 rounded flex flex-col items-center justify-center gap-2 hover:border-[#8C52FF] transition-colors">
              <Upload className="w-8 h-8 text-slate-500" />
              <p className="text-sm text-slate-400">Click to upload clip</p>
              <p className="text-xs text-slate-600">MP4, MOV, WebM. Max 15 seconds.</p>
            </button>
          ) : (
            <div className="space-y-2">
              <video src={previewUrl} controls className="w-full rounded border border-slate-800" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate">{file?.name}</span>
                <span className="text-slate-500">{duration.toFixed(1)}s</span>
              </div>
              <button onClick={() => inputRef.current?.click()}
                className="text-xs text-[#b88bff] hover:underline">Replace</button>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Platform</label>
            <div className="flex gap-1">
              {(['TikTok', 'Reels', 'YouTube Shorts'] as const).map((p) => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`px-3 py-1 rounded text-xs border ${platform === p
                    ? 'bg-[#8C52FF] border-[#8C52FF] text-white'
                    : 'border-slate-700 text-slate-400 hover:text-white'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Describe the clip (optional, sharpens prediction)</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Founder talking head, hook 'You're losing money on every ad', urgent tone, captions on screen."
              className="bg-slate-950/50 border-slate-700 text-white text-sm min-h-[80px]" />
          </div>

          <Button onClick={predict} disabled={!file || loading}
            className="w-full bg-[#8C52FF] hover:bg-[#7a45e0] text-white">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Predicting…</> : <><Brain className="w-4 h-4 mr-2" />Predict virality</>}
          </Button>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-4">
          {!result && !loading && (
            <div className="h-full flex items-center justify-center text-center text-sm text-slate-500 min-h-[300px]">
              Results appear here after prediction.
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-2 min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#8C52FF]" />
              <p className="text-sm text-slate-400">Analyzing neural response…</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Viral score', value: result.viral_score, color: 'text-[#8C52FF]' },
                  { label: 'Hook score', value: result.hook_score, color: 'text-emerald-400' },
                  { label: 'Hold rate', value: result.hold_rate, color: 'text-amber-400', suffix: '%' },
                ].map((m) => (
                  <div key={m.label} className="bg-slate-950/60 rounded border border-slate-800 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{m.label}</p>
                    <p className={`text-2xl font-black ${m.color}`}>{m.value}{m.suffix || ''}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-200 italic">"{result.verdict}"</p>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> Brain region activation
                </p>
                <div className="space-y-2">
                  {regions.map((r) => (
                    <div key={r.key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <r.icon className="w-3 h-3" /> {r.label}
                        </span>
                        <span className="text-slate-400 font-mono">{r.value}</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded overflow-hidden">
                        <div className={`h-full ${heatColor(r.value, r.invert)} transition-all`}
                          style={{ width: `${r.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Top improvements</p>
                <ol className="space-y-1.5">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <Badge className="bg-[#8C52FF]/20 text-[#b88bff] border-0 shrink-0 h-5">{i + 1}</Badge>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ViralPredictor;
