import { useState } from 'react';
import { Loader2, Play, Image as ImageIcon, Video as VideoIcon, Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createGenerationRequest, pollVideoRequest } from '@/services/generationRequestService';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { toast } from 'sonner';

type Mode = 'portrait' | 'video';
type Status = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

const LipSyncStudio = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('portrait');
  const [prompt, setPrompt] = useState('');
  const [portrait, setPortrait] = useState<File | null>(null);
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadOne = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { data, error: e } = await supabase.storage.from('product-images').upload(path, file);
    if (e || !data) return null;
    return `storage:product-images/${data.path}`;
  };

  const run = async () => {
    if (!user) { toast.error('Please sign in.'); return; }
    if (!audio) { toast.error('Please upload an audio track.'); return; }
    if (mode === 'portrait' && !portrait) { toast.error('Upload a portrait image.'); return; }
    if (mode === 'video' && !sourceVideo) { toast.error('Upload a source video.'); return; }

    setStatus('uploading'); setError(null); setResultUrl(null);

    const audioRef = await uploadOne(audio);
    const portraitRef = portrait ? await uploadOne(portrait) : null;
    const videoRef = sourceVideo ? await uploadOne(sourceVideo) : null;
    if (!audioRef || (mode === 'portrait' ? !portraitRef : !videoRef)) {
      setStatus('failed'); setError('Upload failed.'); return;
    }

    const request = await createGenerationRequest({
      requestType: 'video',
      prompt: prompt || `Lip sync (${mode})`,
      category: 'video-lipsync',
      lipsyncMode: mode,
      audioUrl: audioRef,
      firstFrameUrl: portraitRef ?? undefined,
      sourceVideoUrl: videoRef ?? undefined,
    });
    if (!request) { setStatus('failed'); setError('Could not start. Check credits.'); return; }

    setStatus('processing');
    const poll = async () => {
      try {
        await pollVideoRequest(request.id).catch(() => {});
        const { data } = await supabase.from('generation_requests').select('*').eq('id', request.id).maybeSingle();
        if (!data) return setTimeout(poll, 5000);
        if (data.status === 'completed' && data.result_url) {
          const url = await resolveResultUrl(data.result_url);
          setResultUrl(url || data.result_url); setStatus('completed'); return;
        }
        if (data.status === 'failed') { setStatus('failed'); setError('Auto-gen failed. An editor will take over.'); return; }
        setTimeout(poll, 5000);
      } catch { setTimeout(poll, 8000); }
    };
    setTimeout(poll, 3000);
  };

  const busy = status === 'processing' || status === 'uploading';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Lip Sync Studio</h2>
        <p className="text-sm text-muted-foreground">
          DashScope EMO and Videoretalk. Drive a portrait or video with any audio track.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-3">
          <div className="flex bg-slate-950/50 border border-slate-700 rounded overflow-hidden w-fit">
            {(['portrait', 'video'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn('px-3 py-1.5 text-xs flex items-center gap-1',
                  mode === m ? 'bg-[#8C52FF] text-white' : 'text-slate-400')}>
                {m === 'portrait' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
                {m === 'portrait' ? 'Portrait + Audio' : 'Video + Audio'}
              </button>
            ))}
          </div>

          {mode === 'portrait' ? (
            <FileSlot label="Portrait image" accept="image/*" file={portrait} onChange={setPortrait} icon={<ImageIcon className="w-4 h-4" />} />
          ) : (
            <FileSlot label="Source video" accept="video/*" file={sourceVideo} onChange={setSourceVideo} icon={<VideoIcon className="w-4 h-4" />} />
          )}
          <FileSlot label="Audio track" accept="audio/*" file={audio} onChange={setAudio} icon={<Music className="w-4 h-4" />} />

          <Textarea placeholder="Optional notes for the model…" value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-slate-950/50 border-slate-700 text-white min-h-[70px]" />

          <Button onClick={run} disabled={busy} className="w-full bg-[#8C52FF] hover:bg-[#7a45e0] text-white">
            {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {busy ? (status === 'uploading' ? 'Uploading…' : 'Generating…') : 'Generate'}
          </Button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-4">
          <div className="aspect-video bg-slate-950/60 border border-slate-800 rounded flex items-center justify-center overflow-hidden">
            {status === 'completed' && resultUrl ? (
              <video src={resultUrl} controls className="w-full h-full object-contain" />
            ) : busy ? (
              <div className="text-center text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                {status === 'uploading' ? 'Uploading inputs…' : 'Generating lip sync, this can take 1 to 3 minutes…'}
              </div>
            ) : (
              <span className="text-xs text-slate-600">Result preview</span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

function FileSlot({ label, accept, file, onChange, icon }: {
  label: string; accept: string; file: File | null;
  onChange: (f: File | null) => void; icon: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 mb-1 block">{label}</span>
      <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-700 rounded p-2">
        <span className="text-slate-500">{icon}</span>
        <input type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="flex-1 text-xs text-slate-300 file:mr-2 file:bg-slate-800 file:text-slate-200 file:border-0 file:rounded file:px-2 file:py-1" />
        {file && (
          <button onClick={(e) => { e.preventDefault(); onChange(null); }} className="text-slate-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </label>
  );
}

export default LipSyncStudio;
