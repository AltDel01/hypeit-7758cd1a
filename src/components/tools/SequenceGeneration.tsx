import { useState } from 'react';
import {
  Loader2, Play, Image as ImageIcon, Video as VideoIcon,
  Plus, X, ImagePlus, Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createGenerationRequest } from '@/services/generationRequestService';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { joinStoredAttachmentUrls } from '@/utils/requestMedia';
import { toast } from 'sonner';

type Kind = 'image' | 'video';
type Status = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

interface Box {
  id: string;
  prompt: string;
  kind: Kind;
  ratio: string;
  duration: number;        // seconds, video only (2-15)
  resolution: string;      // 480P / 720P / 1080P
  references: File[];      // 0 = T2I/T2V, 1 = I2I/I2V, 2+ = R2V
  audio?: File;            // optional audio for I2V/R2V
  status: Status;
  resultUrl?: string;
  requestId?: string;
  error?: string;
}

const RATIOS = ['1:1', '9:16', '16:9', '4:5', '3:4', '21:9'];
const RESOLUTIONS = ['480P', '720P', '1080P'];
const DURATIONS = [2, 3, 4, 5, 6, 8, 10, 12, 15];

function uid() { return Math.random().toString(36).slice(2); }

function makeBox(): Box {
  return {
    id: uid(), prompt: '', kind: 'image', ratio: '1:1',
    duration: 5, resolution: '1080P', references: [], status: 'idle',
  };
}

const SequenceGeneration = () => {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>(() => Array.from({ length: 6 }, makeBox));

  const update = (id: string, patch: Partial<Box>) =>
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const addBox = () => setBoxes((p) => [...p, makeBox()]);
  const removeBox = (id: string) => setBoxes((p) => p.filter((b) => b.id !== id));

  const uploadOne = async (file: File, bucket: string): Promise<string | null> => {
    if (!user) return null;
    const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error || !data) { console.error('upload failed', error); return null; }
    return `storage:${bucket}/${data.path}`;
  };

  const runBox = async (box: Box) => {
    if (!user) { toast.error('Please sign in to generate.'); return; }
    if (!box.prompt.trim()) { toast.error('Prompt is empty.'); return; }

    update(box.id, { status: 'uploading', error: undefined, resultUrl: undefined });

    // Upload references
    const storageRefs: string[] = [];
    for (const f of box.references) {
      const ref = await uploadOne(f, 'product-images');
      if (ref) storageRefs.push(ref);
    }
    let audioRef: string | null = null;
    if (box.audio && box.kind === 'video' && box.references.length >= 1) {
      audioRef = await uploadOne(box.audio, 'product-images');
    }

    const refUrl = joinStoredAttachmentUrls(storageRefs);

    // Route to correct category
    let request;
    if (box.kind === 'image') {
      request = await createGenerationRequest({
        requestType: 'image',
        prompt: box.prompt,
        aspectRatio: box.ratio,
        referenceImageUrl: refUrl,
        category: storageRefs.length ? 'image-edit-instruction' : 'image-gen',
        referenceImageUrls: storageRefs.length ? storageRefs : undefined,
      });
    } else {
      const promptWithAudio = audioRef ? `${box.prompt}\n[audio: ${audioRef}]` : box.prompt;
      if (storageRefs.length >= 2) {
        request = await createGenerationRequest({
          requestType: 'video',
          prompt: promptWithAudio,
          aspectRatio: box.ratio,
          referenceImageUrl: refUrl,
          category: 'video-r2v',
          referenceImageUrls: storageRefs,
          duration: box.duration,
          resolution: box.resolution,
        });
      } else if (storageRefs.length === 1) {
        request = await createGenerationRequest({
          requestType: 'video',
          prompt: promptWithAudio,
          aspectRatio: box.ratio,
          referenceImageUrl: refUrl,
          category: 'video-i2v',
          firstFrameUrl: storageRefs[0],
          duration: box.duration,
          resolution: box.resolution,
        });
      } else {
        request = await createGenerationRequest({
          requestType: 'video',
          prompt: promptWithAudio,
          aspectRatio: box.ratio,
          category: 'video-t2v',
          duration: box.duration,
          resolution: box.resolution,
        });
      }
    }

    if (!request) {
      update(box.id, { status: 'failed', error: 'Could not start. Check your credits.' });
      return;
    }

    update(box.id, { status: 'processing', requestId: request.id });

    const poll = async () => {
      try {
        const { data } = await supabase
          .from('generation_requests').select('*').eq('id', request.id).maybeSingle();
        if (!data) { setTimeout(poll, 5000); return; }
        if (data.status === 'completed' && data.result_url) {
          const url = await resolveResultUrl(data.result_url);
          update(box.id, { status: 'completed', resultUrl: url || data.result_url });
          return;
        }
        if (data.status === 'failed') {
          update(box.id, { status: 'failed', error: 'Auto-gen failed. An editor will take over.' });
          return;
        }
        setTimeout(poll, 5000);
      } catch (e) { console.error(e); setTimeout(poll, 8000); }
    };
    setTimeout(poll, 3000);
  };

  const runAll = async () => {
    const queue = boxes.filter((b) => b.prompt.trim() && b.status !== 'processing' && b.status !== 'uploading');
    if (!queue.length) { toast.error('No prompts to run.'); return; }
    toast.success(`Queuing ${queue.length} generations.`);
    for (const b of queue) {
      runBox(b);
      await new Promise((r) => setTimeout(r, 600));
    }
  };

  const onAddReferences = (id: string, files: FileList | null) => {
    if (!files?.length) return;
    setBoxes((prev) => prev.map((b) => b.id === id
      ? { ...b, references: [...b.references, ...Array.from(files)].slice(0, 4) } : b));
  };
  const removeRef = (id: string, idx: number) =>
    setBoxes((prev) => prev.map((b) => b.id === id
      ? { ...b, references: b.references.filter((_, i) => i !== idx) } : b));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Sequence Generation</h2>
          <p className="text-sm text-muted-foreground">
            Run 6+ prompts in parallel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addBox} className="border-slate-700">
            <Plus className="w-4 h-4 mr-1" /> Add box
          </Button>
          <Button onClick={runAll} className="bg-[#8C52FF] hover:bg-[#7a45e0] text-white">
            <Play className="w-4 h-4 mr-1" /> Generate all
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {boxes.map((box, i) => {
          const mode = box.kind === 'image'
            ? (box.references.length ? 'I2I' : 'T2I')
            : (box.references.length >= 2 ? 'R2V' : box.references.length === 1 ? 'I2V' : 'T2V');
          const busy = box.status === 'processing' || box.status === 'uploading';

          return (
            <Card key={box.id} className="bg-slate-900/60 border-slate-800 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Prompt {i + 1} <span className="ml-1 text-[10px] text-[#8C52FF]">· {mode}</span>
                </span>
                {boxes.length > 1 && (
                  <button onClick={() => removeBox(box.id)} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Textarea
                placeholder="Describe what to generate…"
                value={box.prompt}
                onChange={(e) => update(box.id, { prompt: e.target.value })}
                className="bg-slate-950/50 border-slate-700 text-white min-h-[80px] resize-none"
              />

              {/* Type + ratio + duration + resolution */}
              <div className="flex gap-2 flex-wrap items-center">
                <div className="flex bg-slate-950/50 border border-slate-700 rounded overflow-hidden">
                  <button
                    onClick={() => update(box.id, { kind: 'image' })}
                    className={cn('px-2 py-1 text-xs flex items-center gap-1',
                      box.kind === 'image' ? 'bg-[#8C52FF] text-white' : 'text-slate-400')}>
                    <ImageIcon className="w-3 h-3" /> Image
                  </button>
                  <button
                    onClick={() => update(box.id, { kind: 'video' })}
                    className={cn('px-2 py-1 text-xs flex items-center gap-1',
                      box.kind === 'video' ? 'bg-[#8C52FF] text-white' : 'text-slate-400')}>
                    <VideoIcon className="w-3 h-3" /> Video
                  </button>
                </div>

                <Select value={box.ratio} onValueChange={(v) => update(box.id, { ratio: v })}>
                  <SelectTrigger className="h-8 w-[72px] bg-slate-950/50 border-slate-700 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {RATIOS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>

                {box.kind === 'video' && (
                  <>
                    <Select
                      value={String(box.duration)}
                      onValueChange={(v) => update(box.id, { duration: parseInt(v, 10) })}>
                      <SelectTrigger className="h-8 w-[68px] bg-slate-950/50 border-slate-700 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{d}s</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={box.resolution} onValueChange={(v) => update(box.id, { resolution: v })}>
                      <SelectTrigger className="h-8 w-[78px] bg-slate-950/50 border-slate-700 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {RESOLUTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              {/* Upload icons + run */}
              <div className="flex gap-2 items-center">
                <label
                  title="Upload reference image(s). 1 = I2I/I2V, 2+ = R2V"
                  className="cursor-pointer text-slate-400 hover:text-white border border-slate-700 rounded p-1.5">
                  <input type="file" accept="image/*" hidden multiple
                    onChange={(e) => onAddReferences(box.id, e.target.files)} />
                  <ImagePlus className="w-4 h-4" />
                </label>

                {box.kind === 'video' && (
                  <label
                    title="Upload audio/voice (I2V/R2V only)"
                    className={cn(
                      'cursor-pointer border rounded p-1.5',
                      box.references.length >= 1
                        ? 'text-slate-400 hover:text-white border-slate-700'
                        : 'text-slate-700 border-slate-800 cursor-not-allowed',
                    )}>
                    <input type="file" accept="audio/*" hidden
                      disabled={box.references.length < 1}
                      onChange={(e) => update(box.id, { audio: e.target.files?.[0] })} />
                    <Music className="w-4 h-4" />
                  </label>
                )}

                {/* Ref chips */}
                <div className="flex gap-1 flex-wrap flex-1 min-w-0">
                  {box.references.map((f, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1 max-w-[90px]">
                      <span className="truncate">{f.name}</span>
                      <button onClick={() => removeRef(box.id, idx)} className="hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {box.audio && (
                    <span className="text-[10px] bg-slate-800 text-[#8C52FF] px-1.5 py-0.5 rounded flex items-center gap-1 max-w-[90px]">
                      <Music className="w-2.5 h-2.5" />
                      <span className="truncate">{box.audio.name}</span>
                      <button onClick={() => update(box.id, { audio: undefined })} className="hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                </div>

                <Button size="sm" onClick={() => runBox(box)} disabled={busy}
                  className="ml-auto bg-white text-black hover:bg-slate-200 h-8 text-xs">
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Run'}
                </Button>
              </div>

              <div className="aspect-square bg-slate-950/60 border border-slate-800 rounded flex items-center justify-center overflow-hidden">
                {box.status === 'completed' && box.resultUrl ? (
                  box.kind === 'image'
                    ? <img src={box.resultUrl} alt="" className="w-full h-full object-cover" />
                    : <video src={box.resultUrl} controls className="w-full h-full object-cover" />
                ) : busy ? (
                  <div className="text-center text-xs text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
                    {box.status === 'uploading' ? 'Uploading…' : `Generating ${mode}…`}
                  </div>
                ) : box.status === 'failed' ? (
                  <span className="text-xs text-red-400 px-2 text-center">{box.error}</span>
                ) : (
                  <span className="text-xs text-slate-600">Result preview</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SequenceGeneration;
