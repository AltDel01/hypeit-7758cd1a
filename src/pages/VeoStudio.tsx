import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Film, Image as ImageIcon, Wand2, Loader2, Download, Trash2, Plus,
  ArrowRight, Upload, Scissors, Layers, Clapperboard,
} from 'lucide-react';
import { extractVideoFrame, fileToDataUrl, normalizeImageDataUrl } from '@/utils/videoFrames';

type Quality = 'lite' | 'fast' | 'high';
type Orientation = 'landscape' | 'portrait';
type Resolution = '720p' | '1080p';

interface Scene {
  id: string;
  prompt: string;
  dialogue: string;
  avoid: string;
  seconds: number;
  reference?: string; // data URL used as first frame
  referenceLabel?: string;
  status: 'idle' | 'running' | 'done' | 'failed';
  progress: number;
  error?: string;
  url?: string;
  videoId?: string;
}

const newScene = (): Scene => ({
  id: crypto.randomUUID(),
  prompt: '',
  dialogue: '',
  avoid: '',
  seconds: 5,
  status: 'idle',
  progress: 0,
});

const CAMERA = ['static shot', 'slow push in', 'dolly out', 'orbit around subject', 'handheld follow', 'crane up', 'whip pan', 'drone fly-over'];
const SHOT = ['extreme close-up', 'close-up', 'medium shot', 'wide establishing shot', 'over-the-shoulder', 'top-down'];
const LIGHT = ['golden hour', 'soft studio light', 'neon night', 'high-key commercial', 'moody low-key', 'overcast daylight'];
const STYLE = ['cinematic film look', 'documentary realism', 'anime', '3D animation', 'analog 16mm', 'hyperreal product ad'];

const QUALITY_LABEL: Record<Quality, string> = {
  lite: 'Wan 2.7, fast draft (720p)',
  fast: 'Wan 2.7, balanced',
  high: 'Wan 2.7, top quality',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const VeoStudio: React.FC = () => {
  const [quality, setQuality] = useState<Quality>('lite');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [motion, setMotion] = useState<number>(5);
  const [camera, setCamera] = useState<string[]>([]);
  const [shot, setShot] = useState<string[]>([]);
  const [light, setLight] = useState<string[]>([]);
  const [style, setStyle] = useState<string[]>([]);
  const [ambient, setAmbient] = useState('');
  const [chain, setChain] = useState(true);

  const [scenes, setScenes] = useState<Scene[]>([newScene()]);
  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);

  // Video-edit workbench (uploaded source clip)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('');
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => () => { cancelRef.current = true; }, []);


  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const updateScene = (id: string, patch: Partial<Scene>) =>
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const buildPrompt = (scene: Scene) => {
    const motionWord =
      motion <= 2 ? 'almost still, minimal movement'
      : motion <= 5 ? 'natural, moderate movement'
      : motion <= 8 ? 'energetic movement'
      : 'fast, dynamic, high-energy movement';
    const parts = [
      scene.prompt.trim(),
      shot.length ? `Framing: ${shot.join(', ')}.` : '',
      camera.length ? `Camera: ${camera.join(', ')}.` : '',
      light.length ? `Lighting: ${light.join(', ')}.` : '',
      style.length ? `Style: ${style.join(', ')}.` : '',
      `Motion: ${motionWord}.`,
      scene.dialogue.trim() ? `Spoken dialogue: "${scene.dialogue.trim()}".` : '',
      ambient.trim() ? `Ambient sound: ${ambient.trim()}.` : '',
      scene.avoid.trim() ? `Avoid: ${scene.avoid.trim()}.` : '',
    ];
    return parts.filter(Boolean).join(' ');
  };

  const runScene = async (scene: Scene, reference?: string): Promise<string | null> => {
    updateScene(scene.id, { status: 'running', progress: 5, error: undefined, url: undefined });

    const { data, error } = await supabase.functions.invoke('veo-studio', {
      body: {
        action: 'create',
        prompt: buildPrompt(scene),
        seconds: scene.seconds,
        orientation,
        resolution,
        quality,
        inputReference: reference || scene.reference,
      },
    });

    const createErr = (data as any)?.error || (error ? 'The clip could not be started.' : null);
    if (createErr || !(data as any)?.videoId) {
      updateScene(scene.id, { status: 'failed', error: createErr || 'The clip could not be started.' });
      return null;
    }

    const videoId = (data as any).videoId as string;
    updateScene(scene.id, { videoId, progress: 10 });

    for (let i = 0; i < 90; i++) {
      if (cancelRef.current) return null;
      await sleep(7000);
      const { data: poll } = await supabase.functions.invoke('veo-studio', {
        body: { action: 'poll', videoId },
      });
      const p = poll as any;
      if (!p) continue;
      if (p.status === 'failed' || (p.error && p.status !== 'in_progress')) {
        updateScene(scene.id, { status: 'failed', error: p.error || 'Generation failed.' });
        return null;
      }
      if (p.status === 'completed' && p.url) {
        updateScene(scene.id, { status: 'done', progress: 100, url: p.url });
        return p.url as string;
      }
      updateScene(scene.id, { progress: Math.min(95, 10 + (p.progress ?? i * 3)) });
    }
    updateScene(scene.id, { status: 'failed', error: 'Timed out while generating.' });
    return null;
  };

  const generateAll = async () => {
    const pending = scenes.filter((s) => s.prompt.trim());
    if (!pending.length) {
      toast.error('Write at least one scene prompt.');
      return;
    }
    setRunning(true);
    cancelRef.current = false;
    let carryFrame: string | undefined;

    for (const scene of pending) {
      if (cancelRef.current) break;
      const reference = scene.reference || (chain ? carryFrame : undefined);
      const url = await runScene(scene, reference);
      if (!url) {
        toast.error('A scene failed, the sequence stopped.');
        break;
      }
      if (chain) {
        try {
          carryFrame = await normalizeImageDataUrl(await extractVideoFrame(url, 'last'));
        } catch {
          carryFrame = undefined;
        }
      }
    }
    setRunning(false);
  };

  const attachReference = async (id: string, file: File) => {
    try {
      const dataUrl = await normalizeImageDataUrl(await fileToDataUrl(file));
      updateScene(id, { reference: dataUrl, referenceLabel: file.name });
    } catch {
      toast.error('That image could not be read.');
    }
  };

  const useFrameFromClip = async (url: string, targetId: string, position: 'first' | 'last' | number) => {
    try {
      const frame = await normalizeImageDataUrl(await extractVideoFrame(url, position));
      updateScene(targetId, { reference: frame, referenceLabel: 'Frame from clip' });
      toast.success('Frame attached as the first frame.');
    } catch {
      toast.error('Could not read a frame from that clip.');
    }
  };

  const onSourceUpload = async (file: File) => {
    setSourceUrl(URL.createObjectURL(file));
    setSourceName(file.name);
  };

  const continueSource = async (position: 'last' | number) => {
    if (!sourceUrl) return;
    try {
      const frame = await normalizeImageDataUrl(await extractVideoFrame(sourceUrl, position));
      const scene = { ...newScene(), reference: frame, referenceLabel: `From ${sourceName}` };
      setScenes((prev) => [...prev, scene]);
      toast.success('Added a new scene that continues from that frame.');
    } catch {
      toast.error('Could not read a frame from that video.');
    }
  };

  const doneClips = useMemo(() => scenes.filter((s) => s.status === 'done' && s.url), [scenes]);

  const chipRow = (label: string, options: string[], selected: string[], set: (v: string[]) => void) => (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(selected, set, o)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              selected.includes(o)
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Wan Studio, internal video lab</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Internal Wan generation and video edit workbench." />
      </Helmet>

      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <Clapperboard className="h-6 w-6 text-primary" />
              Wan Studio
            </h1>
            <p className="text-sm text-muted-foreground">
              Unlisted workbench for Alibaba Wan 2.7 generation and video continuation. Not linked anywhere in the app.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary">Internal, unlisted</Badge>
        </header>

        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate"><Film className="mr-1.5 h-4 w-4" />Generate</TabsTrigger>
            <TabsTrigger value="edit"><Scissors className="mr-1.5 h-4 w-4" />Edit and extend</TabsTrigger>
            <TabsTrigger value="library"><Layers className="mr-1.5 h-4 w-4" />Timeline</TabsTrigger>
          </TabsList>

          {/* ------------------------------ GENERATE ------------------------------ */}
          <TabsContent value="generate" className="mt-4 space-y-4">
            <Card className="space-y-5 p-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Model</Label>
                  <div className="flex flex-col gap-1.5">
                    {(['lite', 'fast', 'high'] as Quality[]).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        className={`rounded-md border px-3 py-2 text-left text-xs transition ${
                          quality === q ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {QUALITY_LABEL[q]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Aspect</Label>
                  <div className="flex gap-2">
                    {(['landscape', 'portrait'] as Orientation[]).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setOrientation(o)}
                        className={`flex-1 rounded-md border px-2 py-2 text-xs transition ${
                          orientation === o ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {o === 'landscape' ? '16:9' : '9:16'}
                      </button>
                    ))}
                  </div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Resolution</Label>
                  <div className="flex gap-2">
                    {(['720p', '1080p'] as Resolution[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResolution(r)}
                        className={`flex-1 rounded-md border px-2 py-2 text-xs transition disabled:opacity-40 ${
                          resolution === r ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Wan renders 2 to 15 second clips, no soundtrack.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Motion intensity, {motion}/10
                  </Label>
                  <Slider value={[motion]} min={1} max={10} step={1} onValueChange={(v) => setMotion(v[0])} />
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ambient sound</Label>
                  <Input
                    value={ambient}
                    onChange={(e) => setAmbient(e.target.value)}
                    placeholder="street noise, soft synth pad"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <p className="text-xs font-medium">Continuous sequence</p>
                      <p className="text-[11px] text-muted-foreground">
                        Chain the last frame of each clip into the next scene.
                      </p>
                    </div>
                    <Switch checked={chain} onCheckedChange={setChain} />
                  </div>
                  <Button className="w-full" onClick={generateAll} disabled={running}>
                    {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {running ? 'Generating...' : 'Generate sequence'}
                  </Button>
                  {running && (
                    <Button variant="outline" className="w-full" onClick={() => { cancelRef.current = true; setRunning(false); }}>
                      Stop after this clip
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {chipRow('Shot type', SHOT, shot, setShot)}
                {chipRow('Camera move', CAMERA, camera, setCamera)}
                {chipRow('Lighting', LIGHT, light, setLight)}
                {chipRow('Style', STYLE, style, setStyle)}
              </div>
            </Card>

            {scenes.map((scene, index) => (
              <Card key={scene.id} className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Scene {index + 1}</Badge>
                    {scene.status === 'running' && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> {scene.progress}%
                      </span>
                    )}
                    {scene.status === 'done' && <span className="text-xs text-primary">Ready</span>}
                    {scene.status === 'failed' && <span className="text-xs text-destructive">{scene.error}</span>}
                  </div>
                  {scenes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setScenes((prev) => prev.filter((s) => s.id !== scene.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Textarea
                  value={scene.prompt}
                  onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
                  placeholder="Describe the scene, subject, action and setting."
                  rows={3}
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    value={scene.dialogue}
                    onChange={(e) => updateScene(scene.id, { dialogue: e.target.value })}
                    placeholder="Spoken line, optional"
                  />
                  <Input
                    value={scene.avoid}
                    onChange={(e) => updateScene(scene.id, { avoid: e.target.value })}
                    placeholder="Avoid, e.g. text overlays"
                  />
                  <div className="flex flex-wrap gap-2">
                    {([4, 6, 8, 10, 15, 20, 30] as const).map((s) => (

                      <button
                        key={s}
                        type="button"
                        onClick={() => updateScene(scene.id, { seconds: s })}
                        className={`flex-1 rounded-md border px-2 py-2 text-xs transition disabled:opacity-40 ${
                          scene.seconds === s
                            ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/50">
                    <ImageIcon className="h-4 w-4" />
                    {scene.reference ? 'Replace first frame' : 'First frame image'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) attachReference(scene.id, f);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                  {scene.reference && (
                    <div className="flex items-center gap-2">
                      <img src={scene.reference} alt="First frame reference" className="h-10 w-16 rounded object-cover" />
                      <span className="text-xs text-muted-foreground">{scene.referenceLabel}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateScene(scene.id, { reference: undefined, referenceLabel: undefined })}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {index > 0 && scenes[index - 1].url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => useFrameFromClip(scenes[index - 1].url!, scene.id, 'last')}
                    >
                      <ArrowRight className="mr-1 h-3.5 w-3.5" />
                      Continue previous clip
                    </Button>
                  )}
                </div>

                {scene.url && (
                  <div className="space-y-2">
                    <video src={scene.url} controls className="w-full rounded-md border border-border" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={scene.url} download={`veo-scene-${index + 1}.mp4`}>
                          <Download className="mr-1 h-3.5 w-3.5" /> Download
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => runScene(scene)} disabled={running}>
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            <Button variant="outline" onClick={() => setScenes((prev) => [...prev, newScene()])}>
              <Plus className="mr-2 h-4 w-4" /> Add scene
            </Button>
          </TabsContent>

          {/* ------------------------------ EDIT ------------------------------ */}
          <TabsContent value="edit" className="mt-4 space-y-4">
            <Card className="space-y-4 p-4">
              <div>
                <h2 className="text-sm font-semibold">Extend or restyle an existing clip</h2>
                <p className="text-xs text-muted-foreground">
                  Upload a video, scrub to any frame, then let Wan continue the action from that frame as a new scene.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground hover:border-primary/50">
                <Upload className="h-4 w-4" />
                {sourceName || 'Upload a source video (mp4, mov)'}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onSourceUpload(f);
                    e.currentTarget.value = '';
                  }}
                />
              </label>

              {sourceUrl && (
                <div className="space-y-3">
                  <video ref={sourceVideoRef} src={sourceUrl} controls className="w-full rounded-md border border-border" />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => continueSource('last')}>
                      Continue from the end
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => continueSource(sourceVideoRef.current?.currentTime ?? 0)}
                    >
                      Continue from the current frame
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    A new scene is added on the Generate tab with that frame set as its first frame. Write the
                    continuation prompt there, e.g. insert b-roll, change the setting, or push the camera in.
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ------------------------------ LIBRARY ------------------------------ */}
          <TabsContent value="library" className="mt-4 space-y-4">
            {doneClips.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Generated clips appear here in sequence order.
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {doneClips.map((clip, i) => (
                  <Card key={clip.id} className="space-y-2 p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Clip {i + 1}</Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={clip.url} download={`veo-clip-${i + 1}.mp4`}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <video src={clip.url} controls className="w-full rounded-md border border-border" />
                    <p className="line-clamp-2 text-xs text-muted-foreground">{clip.prompt}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VeoStudio;
