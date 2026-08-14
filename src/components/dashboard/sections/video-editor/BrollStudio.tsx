import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Film,
  Upload,
  Sparkles,
  Loader2,
  Trash2,
  Download,
  RefreshCw,
  X,
  Wand2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCredits } from '@/hooks/useUserCredits';
import { loadVideoMeta, sampleFrames, type VideoMeta } from '@/utils/broll/frames';
import {
  compositeBroll,
  MAX_SOURCE_BYTES,
  MAX_SOURCE_SECONDS,
  type CompositeClip,
} from '@/utils/broll/composite';

type Stage = 'idle' | 'analyzing' | 'review' | 'generating' | 'compositing' | 'done';

interface Moment {
  id: string;
  start: number;
  duration: number;
  reason: string;
  brollPrompt: string;
  overlayText: string;
  accepted: boolean;
  status: 'idle' | 'generating' | 'ready' | 'failed';
  url?: string;
  error?: string;
}

const CREDITS_PER_CLIP = 60;
const POLL_MS = 8000;

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const BrollStudio: React.FC = () => {
  const { user } = useAuth();
  const { remaining, isLoading: creditsLoading } = useUserCredits();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<(VideoMeta & { url: string }) | null>(null);
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [summary, setSummary] = useState('');
  const [moments, setMoments] = useState<Moment[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const acceptedCount = useMemo(
    () => moments.filter((m) => m.accepted).length,
    [moments],
  );
  const totalCredits = acceptedCount * CREDITS_PER_CLIP;
  const tooLong = (meta?.duration ?? 0) > MAX_SOURCE_SECONDS;

  const reset = () => {
    setFile(null);
    setMeta(null);
    setMoments([]);
    setSummary('');
    setStage('idle');
    setResultUrl(null);
    setProgress(0);
    setNotes('');
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    if (selected.size > MAX_SOURCE_BYTES) {
      toast.error('That video is over 200 MB, please upload a smaller file.');
      return;
    }
    try {
      const info = await loadVideoMeta(selected);
      setFile(selected);
      setMeta(info);
      setMoments([]);
      setSummary('');
      setResultUrl(null);
      setStage('idle');
    } catch {
      toast.error('That video file could not be read.');
    }
  };

  const analyze = useCallback(async () => {
    if (!file || !meta) return;
    setStage('analyzing');
    setProgress(15);
    setProgressLabel('Sampling frames from your video');

    try {
      const frames = await sampleFrames(file, meta.duration);
      setProgress(45);
      setProgressLabel('Asking the AI which moments need b-roll');

      const { data, error } = await supabase.functions.invoke('broll-plan', {
        body: {
          frames,
          duration: meta.duration,
          orientation: meta.orientation,
          notes,
          maxClips: 4,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const list: Moment[] = (data?.moments || []).map((m: any) => ({
        id: m.id,
        start: Number(m.start) || 0,
        duration: Number(m.duration) || 4,
        reason: m.reason || '',
        brollPrompt: m.brollPrompt || '',
        overlayText: m.overlayText || '',
        accepted: true,
        status: 'idle' as const,
      }));

      if (list.length === 0) {
        toast.info('The AI did not find a moment that needs b-roll.');
        setStage('idle');
        return;
      }

      setSummary(data?.summary || '');
      setMoments(list);
      setStage('review');
      setProgress(100);
      toast.success(`${list.length} b-roll moments suggested`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Could not analyse the video.');
      setStage('idle');
    }
  }, [file, meta, notes]);

  const updateMoment = (id: string, patch: Partial<Moment>) => {
    setMoments((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const generateClip = async (moment: Moment): Promise<string | null> => {
    updateMoment(moment.id, { status: 'generating', error: undefined });

    const { data, error } = await supabase.functions.invoke('broll-generate', {
      body: {
        action: 'create',
        prompt: moment.brollPrompt,
        seconds: moment.duration,
        orientation: meta?.orientation || 'landscape',
      },
    });
    if (error || data?.error || !data?.videoId) {
      const message = data?.error || error?.message || 'The clip could not be started.';
      updateMoment(moment.id, { status: 'failed', error: message });
      return null;
    }

    const videoId = data.videoId as string;
    // Veo jobs take 1 to 3 minutes; poll until it settles.
    for (let attempt = 0; attempt < 45; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      const { data: poll, error: pollErr } = await supabase.functions.invoke('broll-generate', {
        body: { action: 'poll', videoId },
      });
      if (pollErr) continue;
      if (poll?.status === 'completed' && poll?.url) {
        updateMoment(moment.id, { status: 'ready', url: poll.url });
        return poll.url as string;
      }
      if (poll?.status === 'failed' || poll?.error) {
        updateMoment(moment.id, {
          status: 'failed',
          error: poll?.error || 'The provider rejected this clip.',
        });
        return null;
      }
    }
    updateMoment(moment.id, { status: 'failed', error: 'The clip timed out.' });
    return null;
  };

  const runFullEdit = async () => {
    if (!file || !meta || !user) return;
    const accepted = moments.filter((m) => m.accepted);
    if (accepted.length === 0) {
      toast.error('Keep at least one b-roll moment.');
      return;
    }
    if (!creditsLoading && remaining < totalCredits) {
      toast.error(`You need ${totalCredits} credits for this edit, you have ${remaining}.`);
      return;
    }

    setStage('generating');
    setProgress(0);
    setProgressLabel('Generating b-roll clips');

    // One request row so the edit shows up in history and deducts credits on completion.
    const { data: requestRow } = await supabase
      .from('generation_requests')
      .insert({
        user_id: user.id,
        user_email: user.email || '',
        request_type: 'video',
        category: 'video-broll',
        auto_provider: 'veo',
        auto_model: 'google/veo-3.1-lite',
        prompt: `AI b-roll edit: ${accepted.length} cutaways on ${file.name}`,
        aspect_ratio: meta.orientation === 'portrait' ? '9:16' : '16:9',
        status: 'processing',
        credits_used: accepted.length * CREDITS_PER_CLIP,
      })
      .select('id')
      .maybeSingle();

    const ready: { moment: Moment; url: string }[] = [];
    for (let i = 0; i < accepted.length; i++) {
      setProgressLabel(`Generating b-roll clip ${i + 1} of ${accepted.length}`);
      setProgress(Math.round((i / accepted.length) * 60));
      const url = await generateClip(accepted[i]);
      if (url) ready.push({ moment: accepted[i], url });
    }

    if (ready.length === 0) {
      setStage('review');
      if (requestRow?.id) {
        await supabase
          .from('generation_requests')
          .update({ status: 'failed', failure_reason: 'No b-roll clip could be generated.', credits_used: 0 })
          .eq('id', requestRow.id);
      }
      toast.error('No b-roll clip could be generated.');
      return;
    }

    setStage('compositing');
    setProgressLabel('Downloading clips');
    setProgress(65);

    try {
      const clips: CompositeClip[] = [];
      for (const { moment, url } of ready) {
        const res = await fetch(url);
        const buf = new Uint8Array(await res.arrayBuffer());
        clips.push({
          start: moment.start,
          duration: moment.duration,
          data: buf,
          overlayText: moment.overlayText,
        });
      }

      const blob = await compositeBroll({
        source: file,
        width: meta.width,
        height: meta.height,
        clips,
        onProgress: (ratio, message) => {
          setProgress(65 + Math.round(ratio * 30));
          setProgressLabel(message);
        },
      });

      const path = `${user.id}/exports/${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage
        .from('broll-media')
        .upload(path, blob, { contentType: 'video/mp4', upsert: true });
      if (upErr) throw new Error(upErr.message);

      const { data: signed } = await supabase.storage
        .from('broll-media')
        .createSignedUrl(path, 3600);

      await supabase.from('broll_jobs').insert({
        user_id: user.id,
        status: 'completed',
        source_name: file.name,
        source_duration: meta.duration,
        orientation: meta.orientation,
        plan: moments as any,
        clips: ready.map(({ moment, url }) => ({ id: moment.id, url })) as any,
        result_url: `storage:broll-media/${path}`,
        credits_used: ready.length * CREDITS_PER_CLIP,
      });

      if (requestRow?.id) {
        await supabase
          .from('generation_requests')
          .update({
            status: 'completed',
            result_url: `storage:broll-media/${path}`,
            completed_at: new Date().toISOString(),
            credits_used: ready.length * CREDITS_PER_CLIP,
          })
          .eq('id', requestRow.id);
      }

      setResultUrl(signed?.signedUrl || URL.createObjectURL(blob));
      setStage('done');
      setProgress(100);
      toast.success('Your b-roll edit is ready');
    } catch (e) {
      console.error(e);
      if (requestRow?.id) {
        await supabase
          .from('generation_requests')
          .update({ status: 'failed', failure_reason: 'Compositing failed', credits_used: 0 })
          .eq('id', requestRow.id);
      }
      toast.error('The final cut could not be rendered in the browser. Try a shorter video.');
      setStage('review');
    }
  };

  const busy = stage === 'analyzing' || stage === 'generating' || stage === 'compositing';

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Upload + context */}
      <Card className="p-4 md:p-6 bg-slate-900/40 border-slate-700/40">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-[#b616d6]" />
                AI B-roll
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload a talking video. The AI finds the flat moments, generates cutaway
                footage for them and burns everything into one export.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFile}
            />

            {!file ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-slate-600 hover:border-[#b616d6] transition-colors py-10 flex flex-col items-center gap-2 text-slate-400 hover:text-white"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Upload your video</span>
                <span className="text-[11px]">MP4 or MOV, up to 3 minutes and 200 MB</span>
              </button>
            ) : (
              <div className="rounded-xl border border-slate-700/50 p-3 flex items-center gap-3">
                <div className="w-24 rounded-lg overflow-hidden bg-black shrink-0">
                  <video src={meta?.url} className="w-full h-full object-cover" muted />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {fmt(meta?.duration || 0)} · {meta?.orientation}
                  </p>
                  {tooLong && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      Over 3 minutes, browser rendering may fail. Trim it first.
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={reset} disabled={busy}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Direction (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. keep it premium and cinematic, product is a skincare serum"
                className="bg-slate-800/50 border-slate-700/50 text-sm min-h-[72px]"
                disabled={busy}
              />
            </div>

            <Button
              onClick={analyze}
              disabled={!file || busy}
              className="w-full bg-[#b616d6] hover:bg-[#b616d6]/90"
            >
              {stage === 'analyzing' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Find b-roll moments
            </Button>
          </div>

          <div className="lg:w-1/2">
            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              {meta?.url ? (
                <video src={resultUrl || meta.url} controls className="w-full h-full object-contain" />
              ) : (
                <p className="text-xs text-slate-500">Your video preview shows here</p>
              )}
            </div>
            {resultUrl && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = resultUrl;
                    a.download = 'broll-edit.mp4';
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download edit
                </Button>
                <Button variant="ghost" onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New edit
                </Button>
              </div>
            )}
          </div>
        </div>

        {busy && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{progressLabel}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </Card>

      {/* Review */}
      {moments.length > 0 && (
        <Card className="p-4 md:p-6 bg-slate-900/40 border-slate-700/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Suggested b-roll</h3>
              {summary && <p className="text-xs text-slate-400 mt-1">{summary}</p>}
            </div>
            <Badge variant="outline" className="border-[#b616d6] text-[#b616d6]">
              {acceptedCount} clips · {totalCredits} credits
            </Badge>
          </div>

          <div className="space-y-3">
            {moments.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'rounded-xl border p-3 space-y-2 transition-colors',
                  m.accepted
                    ? 'border-[#b616d6]/40 bg-slate-800/40'
                    : 'border-slate-700/40 bg-slate-800/20 opacity-60',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Badge variant="secondary" className="bg-slate-700/60">
                      {fmt(m.start)} → {fmt(m.start + m.duration)}
                    </Badge>
                    <span className="text-slate-400 hidden sm:inline">{m.reason}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {m.status === 'generating' && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#b616d6]" />
                    )}
                    {m.status === 'ready' && (
                      <Badge className="bg-emerald-600/80 text-[10px]">Ready</Badge>
                    )}
                    {m.status === 'failed' && (
                      <Badge className="bg-red-600/80 text-[10px]">Failed</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busy}
                      onClick={() => updateMoment(m.id, { accepted: !m.accepted })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={m.brollPrompt}
                  onChange={(e) => updateMoment(m.id, { brollPrompt: e.target.value })}
                  disabled={busy}
                  className="bg-slate-900/60 border-slate-700/50 text-xs min-h-[56px]"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={m.overlayText}
                    maxLength={24}
                    onChange={(e) => updateMoment(m.id, { overlayText: e.target.value })}
                    placeholder="On-screen callout (optional)"
                    disabled={busy}
                    className="bg-slate-900/60 border-slate-700/50 text-xs"
                  />
                  {m.error && <p className="text-[11px] text-red-400 self-center">{m.error}</p>}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={runFullEdit}
            disabled={busy || acceptedCount === 0}
            className="w-full bg-[#b616d6] hover:bg-[#b616d6]/90"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Generate and composite ({totalCredits} credits)
          </Button>
          <p className="text-[11px] text-slate-500 text-center">
            Clips are generated one at a time and take 1 to 3 minutes each. Keep this tab open.
          </p>
        </Card>
      )}
    </div>
  );
};

export default BrollStudio;
