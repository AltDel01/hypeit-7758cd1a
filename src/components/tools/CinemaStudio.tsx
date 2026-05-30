import { useState } from 'react';
import { Loader2, Play, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createGenerationRequest, pollVideoRequest } from '@/services/generationRequestService';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { toast } from 'sonner';

const SHOTS = ['Wide', 'Medium', 'Close-up', 'Extreme close-up', 'Over-the-shoulder', 'Top-down', 'Low angle', 'Dutch angle'];
const LENSES = ['16mm', '24mm', '35mm', '50mm', '85mm', '135mm', 'Anamorphic'];
const APERTURES = ['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8'];
const MOVES = ['Static', 'Dolly in', 'Dolly out', 'Pan left', 'Pan right', 'Tilt up', 'Tilt down', 'Tracking', 'Crane', 'Handheld'];
const LIGHTING = ['Natural daylight', 'Golden hour', 'Blue hour', 'Soft window light', 'Hard sunlight', 'Neon noir', 'Candlelit', 'Studio softbox', 'Volumetric god rays'];
const STOCKS = ['None', 'Kodak Portra 400', 'Kodak Vision3 500T', 'Fuji Pro 400H', 'Ilford HP5', 'CineStill 800T', 'Digital Arri Alexa', 'RED Komodo'];
const RATIOS = ['16:9', '21:9', '9:16', '4:5', '1:1'];
const DURATIONS = [3, 5, 8, 10];

const CinemaStudio = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [shot, setShot] = useState(SHOTS[1]);
  const [lens, setLens] = useState(LENSES[3]);
  const [aperture, setAperture] = useState(APERTURES[2]);
  const [move, setMove] = useState(MOVES[1]);
  const [lighting, setLighting] = useState(LIGHTING[1]);
  const [stock, setStock] = useState(STOCKS[6]);
  const [ratio, setRatio] = useState('21:9');
  const [duration, setDuration] = useState(5);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const buildPrompt = () => {
    const tags = [
      shot, `${lens} lens`, aperture, move,
      lighting, stock !== 'None' ? stock : null,
    ].filter(Boolean).join(', ');
    return `${prompt.trim()}\n[cinema: ${tags}]`;
  };

  const run = async () => {
    if (!user) { toast.error('Please sign in.'); return; }
    if (!prompt.trim()) { toast.error('Describe your shot.'); return; }
    setBusy(true); setResultUrl(null);

    const request = await createGenerationRequest({
      requestType: 'video',
      prompt: buildPrompt(),
      aspectRatio: ratio,
      category: 'video-t2v',
      duration,
      resolution: '1080P',
    });
    if (!request) { setBusy(false); toast.error('Could not start. Check credits.'); return; }

    const poll = async () => {
      try {
        await pollVideoRequest(request.id).catch(() => {});
        const { data } = await supabase.from('generation_requests').select('*').eq('id', request.id).maybeSingle();
        if (!data) return setTimeout(poll, 5000);
        if (data.status === 'completed' && data.result_url) {
          const url = await resolveResultUrl(data.result_url);
          setResultUrl(url || data.result_url); setBusy(false); return;
        }
        if (data.status === 'failed') { setBusy(false); toast.error('Auto-gen failed. An editor will take over.'); return; }
        setTimeout(poll, 5000);
      } catch { setTimeout(poll, 8000); }
    };
    setTimeout(poll, 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Cinema Studio</h2>
        <p className="text-sm text-muted-foreground">
          Pro camera controls layer.  Compose the shot, then describe it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-3">
          <Textarea placeholder="A lone astronaut walks across a glass desert as twin suns set behind her…"
            value={prompt} onChange={(e) => setPrompt(e.target.value)}
            className="bg-slate-950/50 border-slate-700 text-white min-h-[110px]" />

          <div className="grid grid-cols-2 gap-2">
            <Picker label="Shot" value={shot} onChange={setShot} options={SHOTS} />
            <Picker label="Lens" value={lens} onChange={setLens} options={LENSES} />
            <Picker label="Aperture" value={aperture} onChange={setAperture} options={APERTURES} />
            <Picker label="Camera move" value={move} onChange={setMove} options={MOVES} />
            <Picker label="Lighting" value={lighting} onChange={setLighting} options={LIGHTING} />
            <Picker label="Film stock" value={stock} onChange={setStock} options={STOCKS} />
            <Picker label="Ratio" value={ratio} onChange={setRatio} options={RATIOS} />
            <Picker label="Duration" value={String(duration)} onChange={(v) => setDuration(parseInt(v, 10))} options={DURATIONS.map(String)} suffix="s" />
          </div>

          <Button onClick={run} disabled={busy} className="w-full bg-[#8C52FF] hover:bg-[#7a45e0] text-white">
            {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
            {busy ? 'Rolling…' : 'Roll camera'}
          </Button>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-3">
          <div className="aspect-video bg-slate-950/60 border border-slate-800 rounded flex items-center justify-center overflow-hidden">
            {resultUrl ? (
              <video src={resultUrl} controls className="w-full h-full object-contain" />
            ) : busy ? (
              <div className="text-center text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Generating your shot…
              </div>
            ) : (
              <span className="text-xs text-slate-600">Result preview</span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">Final prompt:</span> {prompt && (
              <code className="block mt-1 p-2 bg-slate-950 rounded text-[10px] text-slate-300 break-all">{buildPrompt()}</code>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

function Picker({ label, value, onChange, options, suffix }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; suffix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wide text-slate-500 mb-1 block">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 bg-slate-950/50 border-slate-700 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          {options.map((o) => <SelectItem key={o} value={o}>{o}{suffix || ''}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CinemaStudio;
