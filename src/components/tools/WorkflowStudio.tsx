import { useState } from 'react';
import { Loader2, Play, Plus, X, ArrowDown, Workflow as WorkflowIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createGenerationRequest, pollVideoRequest } from '@/services/generationRequestService';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { toast } from 'sonner';
import type { GenerationCategory } from '@/config/generationCategories';

type StepKind = 'image' | 'video-t2v' | 'video-i2v' | 'lipsync-portrait';

interface Step {
  id: string;
  kind: StepKind;
  prompt: string;
  /** For lipsync-portrait, audio file uploaded by user. */
  audio?: File | null;
  status: 'idle' | 'running' | 'done' | 'failed';
  requestId?: string;
  resultUrl?: string;
}

const KIND_LABEL: Record<StepKind, string> = {
  'image': 'Text → Image',
  'video-t2v': 'Text → Video',
  'video-i2v': 'Previous image → Video',
  'lipsync-portrait': 'Previous image + audio → Talking video',
};

const uid = () => Math.random().toString(36).slice(2);

const WorkflowStudio = () => {
  const { user } = useAuth();
  const [name, setName] = useState('Untitled workflow');
  const [steps, setSteps] = useState<Step[]>([
    { id: uid(), kind: 'image', prompt: '', status: 'idle' },
    { id: uid(), kind: 'video-i2v', prompt: '', status: 'idle' },
  ]);
  const [running, setRunning] = useState(false);

  const update = (id: string, patch: Partial<Step>) =>
    setSteps((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addStep = () => setSteps((p) => [...p, { id: uid(), kind: 'image', prompt: '', status: 'idle' }]);
  const removeStep = (id: string) => setSteps((p) => p.filter((s) => s.id !== id));

  const uploadAudio = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage.from('product-images').upload(path, file);
    if (error || !data) return null;
    return `storage:product-images/${data.path}`;
  };

  const waitForCompletion = async (requestId: string, isVideo: boolean): Promise<string | null> => {
    for (let i = 0; i < 60; i++) {
      if (isVideo) await pollVideoRequest(requestId).catch(() => {});
      const { data } = await supabase.from('generation_requests').select('*').eq('id', requestId).maybeSingle();
      if (data?.status === 'completed' && data.result_url) {
        return (await resolveResultUrl(data.result_url)) || data.result_url;
      }
      if (data?.status === 'failed') return null;
      await new Promise((r) => setTimeout(r, 5000));
    }
    return null;
  };

  const runWorkflow = async () => {
    if (!user) { toast.error('Please sign in.'); return; }
    if (!steps.length) return;
    setRunning(true);

    // Create the run row up front
    const { data: run } = await supabase
      .from('tool_workflow_runs')
      .insert({ user_id: user.id, status: 'running', current_step: 0, step_request_ids: [] })
      .select().single();

    const requestIds: string[] = [];
    let previousResultUrl: string | null = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      update(step.id, { status: 'running', resultUrl: undefined });

      let category: GenerationCategory;
      const params: any = { prompt: step.prompt || '(continue workflow)' };

      switch (step.kind) {
        case 'image':
          category = 'image-gen';
          params.requestType = 'image';
          break;
        case 'video-t2v':
          category = 'video-t2v';
          params.requestType = 'video';
          params.duration = 5;
          params.resolution = '1080P';
          break;
        case 'video-i2v':
          category = 'video-i2v';
          params.requestType = 'video';
          if (!previousResultUrl) { update(step.id, { status: 'failed' }); break; }
          params.firstFrameUrl = previousResultUrl;
          params.duration = 5;
          params.resolution = '1080P';
          break;
        case 'lipsync-portrait': {
          category = 'video-lipsync';
          params.requestType = 'video';
          if (!previousResultUrl) { update(step.id, { status: 'failed' }); break; }
          if (!step.audio) { update(step.id, { status: 'failed' }); break; }
          const audioRef = await uploadAudio(step.audio);
          if (!audioRef) { update(step.id, { status: 'failed' }); break; }
          params.firstFrameUrl = previousResultUrl;
          params.audioUrl = audioRef;
          params.lipsyncMode = 'portrait';
          break;
        }
      }

      if (steps[i].status === 'failed') break;
      const req = await createGenerationRequest({ ...params, category: category! });
      if (!req) { update(step.id, { status: 'failed' }); break; }
      requestIds.push(req.id);
      update(step.id, { requestId: req.id });

      const isVideo = step.kind !== 'image';
      const url = await waitForCompletion(req.id, isVideo);
      if (!url) { update(step.id, { status: 'failed' }); break; }
      update(step.id, { status: 'done', resultUrl: url });
      previousResultUrl = url;

      if (run) {
        await supabase.from('tool_workflow_runs')
          .update({ current_step: i + 1, step_request_ids: requestIds })
          .eq('id', run.id);
      }
    }

    if (run) {
      const finalStatus = steps.some((s) => s.status === 'failed') ? 'failed' : 'completed';
      await supabase.from('tool_workflow_runs')
        .update({ status: finalStatus, step_request_ids: requestIds })
        .eq('id', run.id);
    }
    setRunning(false);
  };

  const saveWorkflow = async () => {
    if (!user) return;
    const persistedSteps = steps.map(({ id, kind, prompt }) => ({ id, kind, prompt }));
    const { error } = await supabase.from('tool_workflows').insert({
      user_id: user.id, name, steps: persistedSteps,
    });
    if (error) toast.error('Save failed.'); else toast.success('Workflow saved.');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <WorkflowIcon className="w-5 h-5 text-[#8C52FF]" /> Workflow Studio
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate with chain steps. Each step feeds the next.
          </p>
        </div>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)}
            className="w-48 bg-slate-950/50 border-slate-700 text-white text-sm" />
          <Button variant="outline" onClick={saveWorkflow} className="border-slate-700">Save</Button>
          <Button onClick={runWorkflow} disabled={running} className="bg-[#8C52FF] hover:bg-[#7a45e0] text-white">
            {running ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Run workflow
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.id}>
            <Card className="bg-slate-900/60 border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wide text-slate-500">Step {i + 1}</span>
                <div className="flex items-center gap-2">
                  <Select value={step.kind} onValueChange={(v) => update(step.id, { kind: v as StepKind })}>
                    <SelectTrigger className="h-8 bg-slate-950/50 border-slate-700 text-xs w-[280px]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {(Object.entries(KIND_LABEL) as [StepKind, string][]).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <StatusDot status={step.status} />
                  {steps.length > 1 && (
                    <button onClick={() => removeStep(step.id)} className="text-slate-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <Textarea placeholder="Describe this step…" value={step.prompt}
                onChange={(e) => update(step.id, { prompt: e.target.value })}
                className="bg-slate-950/50 border-slate-700 text-white min-h-[60px]" />

              {step.kind === 'lipsync-portrait' && (
                <input type="file" accept="audio/*"
                  onChange={(e) => update(step.id, { audio: e.target.files?.[0] ?? null })}
                  className="text-xs text-slate-300 file:mr-2 file:bg-slate-800 file:text-slate-200 file:border-0 file:rounded file:px-2 file:py-1" />
              )}

              {step.resultUrl && (
                <div className="aspect-video bg-slate-950/60 rounded border border-slate-800 overflow-hidden">
                  {step.kind === 'image'
                    ? <img src={step.resultUrl} alt="" className="w-full h-full object-cover" />
                    : <video src={step.resultUrl} controls className="w-full h-full object-cover" />}
                </div>
              )}
            </Card>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1 text-slate-600"><ArrowDown className="w-4 h-4" /></div>
            )}
          </div>
        ))}

        <Button variant="outline" onClick={addStep} className="w-full border-slate-700 border-dashed">
          <Plus className="w-4 h-4 mr-2" /> Add step
        </Button>
      </div>
    </div>
  );
};

function StatusDot({ status }: { status: Step['status'] }) {
  const map = { idle: 'bg-slate-600', running: 'bg-yellow-500 animate-pulse', done: 'bg-emerald-500', failed: 'bg-red-500' };
  return <span className={`w-2 h-2 rounded-full ${map[status]}`} />;
}

export default WorkflowStudio;
