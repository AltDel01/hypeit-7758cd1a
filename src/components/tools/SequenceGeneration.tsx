import { useState } from 'react';
import { Loader2, Play, Image as ImageIcon, Video as VideoIcon, Plus, X } from 'lucide-react';
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
  reference?: File;
  status: Status;
  resultUrl?: string;
  requestId?: string;
  error?: string;
}

const RATIOS = ['1:1', '9:16', '16:9', '4:5', '3:4', '21:9'];

function uid() { return Math.random().toString(36).slice(2); }

function makeBox(): Box {
  return { id: uid(), prompt: '', kind: 'image', ratio: '1:1', status: 'idle' };
}

const SequenceGeneration = () => {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>(() => Array.from({ length: 6 }, makeBox));

  const update = (id: string, patch: Partial<Box>) =>
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const addBox = () => setBoxes((p) => [...p, makeBox()]);
  const removeBox = (id: string) => setBoxes((p) => p.filter((b) => b.id !== id));

  const runBox = async (box: Box) => {
    if (!user) { toast.error('Please sign in to generate.'); return; }
    if (!box.prompt.trim()) { toast.error('Prompt is empty.'); return; }

    update(box.id, { status: 'uploading', error: undefined, resultUrl: undefined });

    let storageRefs: string[] = [];
    if (box.reference) {
      try {
        const path = `${user.id}/${Date.now()}-${box.reference.name}`;
        const { data, error } = await supabase.storage
          .from('product-images').upload(path, box.reference);
        if (!error && data) storageRefs.push(`storage:product-images/${data.path}`);
      } catch (e) { console.error(e); }
    }

    const refUrl = joinStoredAttachmentUrls(storageRefs);
    const request = box.kind === 'image'
      ? await createGenerationRequest({
          requestType: 'image',
          prompt: box.prompt,
          aspectRatio: box.ratio,
          referenceImageUrl: refUrl,
          category: storageRefs.length ? 'image-edit-instruction' : 'image-gen',
          referenceImageUrls: storageRefs.length ? storageRefs : undefined,
        })
      : await createGenerationRequest({
          requestType: 'video',
          prompt: box.prompt,
          aspectRatio: box.ratio,
          referenceImageUrl: refUrl,
          category: storageRefs.length ? 'video-i2v' : 'video-t2v',
          firstFrameUrl: storageRefs.length === 1 ? storageRefs[0] : undefined,
        });

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Sequence Generation</h2>
          <p className="text-sm text-muted-foreground">Run 6+ prompts in parallel. Mix images and videos.</p>
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
        {boxes.map((box, i) => (
          <Card key={box.id} className="bg-slate-900/60 border-slate-800 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Prompt {i + 1}</span>
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

            <div className="flex gap-2 flex-wrap">
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
                <SelectTrigger className="h-8 w-[80px] bg-slate-950/50 border-slate-700 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {RATIOS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" hidden
                  onChange={(e) => update(box.id, { reference: e.target.files?.[0] })} />
                <span className="text-xs text-slate-400 hover:text-white px-2 py-1 border border-slate-700 rounded inline-block">
                  {box.reference ? box.reference.name.slice(0, 14) : 'Ref'}
                </span>
              </label>
              <Button size="sm" onClick={() => runBox(box)}
                disabled={box.status === 'processing' || box.status === 'uploading'}
                className="ml-auto bg-white text-black hover:bg-slate-200 h-8 text-xs">
                {box.status === 'processing' || box.status === 'uploading'
                  ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Run'}
              </Button>
            </div>

            <div className="aspect-square bg-slate-950/60 border border-slate-800 rounded flex items-center justify-center overflow-hidden">
              {box.status === 'completed' && box.resultUrl ? (
                box.kind === 'image'
                  ? <img src={box.resultUrl} alt="" className="w-full h-full object-cover" />
                  : <video src={box.resultUrl} controls className="w-full h-full object-cover" />
              ) : box.status === 'processing' || box.status === 'uploading' ? (
                <div className="text-center text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
                  {box.status === 'uploading' ? 'Uploading…' : 'Generating…'}
                </div>
              ) : box.status === 'failed' ? (
                <span className="text-xs text-red-400 px-2 text-center">{box.error}</span>
              ) : (
                <span className="text-xs text-slate-600">Result preview</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SequenceGeneration;
