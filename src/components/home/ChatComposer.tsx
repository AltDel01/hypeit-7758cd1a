import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, X, Sparkles, Loader2, ExternalLink, Image as ImageIcon,
  Film, MessageSquare, Wand2, Trash2, Mic, Eraser,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useMultimodalChat, ChatMode } from '@/hooks/useMultimodalChat';
import InpaintDialog from './InpaintDialog';
import ReactMarkdown from 'react-markdown';

const modeOptions: { id: ChatMode; label: string; icon: any }[] = [
  { id: 'auto', label: 'Auto', icon: Wand2 },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'video', label: 'Video', icon: Film },
];

const examples = [
  'Brainstorm 5 viral hooks for a coffee brand',
  'Generate a cinematic latte at sunset',
  'Make a 9:16 video of waves at golden hour',
];

const ASPECT_OPTIONS: { value: string; w: number; h: number }[] = [
  { value: '16:9', w: 28, h: 16 },
  { value: '9:16', w: 16, h: 28 },
  { value: '1:1',  w: 22, h: 22 },
  { value: '4:3',  w: 26, h: 20 },
  { value: '3:4',  w: 20, h: 26 },
];
const DURATION_OPTIONS = [2, 4, 5, 8, 10, 12, 15];
const RESOLUTION_OPTIONS = ['480P', '720P', '1080P'];
const IMAGE_ASPECT_OPTIONS: { value: string; w: number; h: number }[] = [
  { value: '1:1',  w: 22, h: 22 },
  { value: '16:9', w: 28, h: 16 },
  { value: '9:16', w: 16, h: 28 },
  { value: '4:3',  w: 26, h: 20 },
  { value: '3:4',  w: 20, h: 26 },
];
const IMAGE_RESOLUTION_OPTIONS = ['1K', '2K'];
const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4];
const STYLE_OPTIONS = ['Cinematic', 'Vintage', 'Anime', 'Documentary', 'Commercial', 'Music Video', 'Horror', 'Sci-Fi'];
const MOTION_OPTIONS = ['Static', 'Pan', 'Zoom In', 'Zoom Out', 'Tracking', 'Crane', 'Handheld', 'Dolly'];
const INTENSITY_OPTIONS = [
  { value: 'Subtle',   desc: 'Minimal movement' },
  { value: 'Moderate', desc: 'Balanced motion' },
  { value: 'Dynamic',  desc: 'Strong movement' },
];

type VideoPanel = 'basics' | 'style' | 'motion';

const ChatComposer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages, send, isBusy, clear } = useMultimodalChat();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<ChatMode>('auto');
  const [ratio, setRatio] = useState<string>('16:9');
  const [duration, setDuration] = useState<number>(5);
  const [resolution, setResolution] = useState<string>('720P');
  const [style, setStyle] = useState<string>('Cinematic');
  const [motion, setMotion] = useState<string>('Static');
  const [intensity, setIntensity] = useState<string>('Moderate');
  const [firstFrameFile, setFirstFrameFile] = useState<File | null>(null);
  const [lastFrameFile, setLastFrameFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [inpaintOpen, setInpaintOpen] = useState(false);
  const [videoPanel, setVideoPanel] = useState<VideoPanel>('basics');
  const [imgRatio, setImgRatio] = useState<string>('1:1');
  const [imgResolution, setImgResolution] = useState<string>('1K');
  const [imgCount, setImgCount] = useState<number>(1);
  const [imgPromptExtend, setImgPromptExtend] = useState<boolean>(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('homepageChatDraft');
      if (raw) {
        const d = JSON.parse(raw);
        if (d?.text) setText(d.text);
        if (d?.mode) setMode(d.mode);
        localStorage.removeItem('homepageChatDraft');
      }
    } catch {}
  }, []);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...list].slice(0, 3));
  };

  const buildVideoPrompt = (base: string) => {
    const tags: string[] = [];
    if (style) tags.push(`Style: ${style}`);
    if (motion && motion !== 'Static') tags.push(`Camera: ${motion}`);
    if (intensity) tags.push(`Motion intensity: ${intensity}`);
    return tags.length ? `${base}\n\n[${tags.join(' | ')}]` : base;
  };

  const handleSend = async () => {
    const hasInput = text.trim() || files.length > 0 || firstFrameFile || lastFrameFile;
    if (!hasInput) return;
    if (!user) {
      localStorage.setItem('homepageChatDraft', JSON.stringify({ text, mode }));
      localStorage.setItem('authRedirectPath', '/');
      navigate('/signup');
      return;
    }
    const t = mode === 'video' ? buildVideoPrompt(text) : text;
    const f = files;
    const a = audioFile;
    const ff = firstFrameFile;
    const lf = lastFrameFile;
    const mf = maskFile;
    setText('');
    setFiles([]);
    setAudioFile(null);
    setFirstFrameFile(null);
    setLastFrameFile(null);
    setMaskFile(null);
    await send(
      t,
      f,
      mode,
      mode === 'video'
        ? { ratio, duration, resolution, audioFile: a, firstFrameFile: ff, lastFrameFile: lf }
        : undefined,
      mode === 'image'
        ? { maskFile: mf, ratio: imgRatio, resolution: imgResolution, count: imgCount, promptExtend: imgPromptExtend }
        : undefined,
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
    <section className="relative min-h-[90vh] flex flex-col items-center justify-start px-3 md:px-4 pt-14 pb-4 md:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-600/20 rounded-full blur-[100px] md:blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-600/20 rounded-full blur-[100px] md:blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full">
        <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-1 md:mb-3 leading-tight px-2">
          <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
            Create Stop<br className="md:hidden" />
            <span className="hidden md:inline"> </span>Scrolling Content
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-xl text-gray-400 text-center mb-4 md:mb-6 px-4">
          Generate viral video in seconds with AI. Just describe what you want.
        </p>

        {/* Thread */}
        <div className="w-full max-w-3xl">
          {messages.length > 0 && (
            <div
              ref={scrollRef}
              className="bg-gray-900/60 border border-gray-700/50 rounded-xl md:rounded-2xl p-3 md:p-4 mb-3 md:mb-4 backdrop-blur-sm max-h-[55vh] overflow-y-auto"
            >
              {messages.map(m => (
                <MessageBubble key={m.id} m={m} />
              ))}
              <div className="flex justify-end mt-2">
                <button
                  onClick={clear}
                  className="text-xs text-gray-500 hover:text-gray-300 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear thread
                </button>
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl md:rounded-2xl p-3 md:p-4 backdrop-blur-sm">
            {files.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden bg-black inline-block">
                    <img src={URL.createObjectURL(f)} alt={f.name} className="max-h-24 object-contain rounded-lg" />
                    <button
                      onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {mode === 'image' && files.length === 1 && (
                      <button
                        onClick={() => setInpaintOpen(true)}
                        className={cn(
                          'absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] inline-flex items-center gap-1 border backdrop-blur-sm',
                          maskFile
                            ? 'bg-[#8c52ff] text-white border-[#8c52ff]'
                            : 'bg-black/70 text-white border-white/20 hover:bg-black/90',
                        )}
                        title="Erase / inpaint a region"
                      >
                        <Eraser className="w-3 h-3" />
                        {maskFile ? 'Mask set' : 'Erase area'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything, or describe what to create..."
              className="min-h-[80px] bg-transparent border-none text-white placeholder:text-gray-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base"
            />

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setText(ex)}
                    className="px-2.5 py-1 rounded-full text-[11px] md:text-xs bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}

            {mode === 'image' && (
              <div className="mb-3 rounded-lg bg-gray-800/40 border border-gray-700/50 p-3 space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Aspect ratio</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {IMAGE_ASPECT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setImgRatio(opt.value)}
                        className={cn(
                          'flex items-center gap-1.5 px-2 py-1 rounded text-xs border',
                          imgRatio === opt.value
                            ? 'bg-[#8c52ff] text-white border-[#8c52ff]'
                            : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                        )}
                      >
                        <span
                          className={cn('block border rounded-sm', imgRatio === opt.value ? 'border-white' : 'border-gray-500')}
                          style={{ width: opt.w, height: opt.h }}
                        />
                        {opt.value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Resolution</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {IMAGE_RESOLUTION_OPTIONS.map(res => (
                      <button
                        key={res}
                        onClick={() => setImgResolution(res)}
                        className={cn(
                          'px-2.5 py-1 rounded text-xs border',
                          imgResolution === res ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                        )}
                      >{res}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Number of images</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {IMAGE_COUNT_OPTIONS.map(c => (
                      <button
                        key={c}
                        onClick={() => setImgCount(c)}
                        className={cn(
                          'px-2.5 py-1 rounded text-xs border',
                          imgCount === c ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                        )}
                      >{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Prompt enhancement</label>
                  <button
                    onClick={() => setImgPromptExtend(v => !v)}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs border inline-flex items-center gap-1.5',
                      imgPromptExtend ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    {imgPromptExtend ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            )}



            {mode === 'video' && (
              <div className="mb-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
                <div className="flex border-b border-gray-700/50">
                  {(['basics', 'style', 'motion'] as VideoPanel[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setVideoPanel(p)}
                      className={cn(
                        'flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors',
                        videoPanel === p
                          ? 'text-white bg-gray-900/60 border-b-2 border-[#8c52ff]'
                          : 'text-gray-400 hover:text-gray-200',
                      )}
                    >
                      {p === 'basics' ? 'Basics' : p === 'style' ? 'Style & Frame' : 'Motion'}
                    </button>
                  ))}
                </div>

                <div className="p-3 space-y-3">
                  {videoPanel === 'basics' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Aspect ratio</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {ASPECT_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setRatio(opt.value)}
                              className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded text-xs border',
                                ratio === opt.value
                                  ? 'bg-[#8c52ff] text-white border-[#8c52ff]'
                                  : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                              )}
                            >
                              <span
                                className={cn(
                                  'block border rounded-sm',
                                  ratio === opt.value ? 'border-white' : 'border-gray-500',
                                )}
                                style={{ width: opt.w, height: opt.h }}
                              />
                              {opt.value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Duration</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {DURATION_OPTIONS.map(d => (
                            <button
                              key={d}
                              onClick={() => setDuration(d)}
                              className={cn(
                                'px-2.5 py-1 rounded text-xs border',
                                duration === d ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                              )}
                            >{d}s</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Resolution</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {RESOLUTION_OPTIONS.map(res => (
                            <button
                              key={res}
                              onClick={() => setResolution(res)}
                              className={cn(
                                'px-2.5 py-1 rounded text-xs border',
                                resolution === res ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                              )}
                            >{res}</button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {videoPanel === 'style' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Style</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {STYLE_OPTIONS.map(s => (
                            <button
                              key={s}
                              onClick={() => setStyle(s)}
                              className={cn(
                                'px-2.5 py-1 rounded text-xs border',
                                style === s ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                              )}
                            >{s}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">
                          Keyframes <span className="normal-case text-gray-600">(upload 1 image = animate from it · upload both = interpolate between them)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <FrameSlot
                            label="First frame"
                            file={firstFrameFile}
                            onPick={setFirstFrameFile}
                            onClear={() => setFirstFrameFile(null)}
                          />
                          <FrameSlot
                            label="Last frame"
                            file={lastFrameFile}
                            onPick={setLastFrameFile}
                            onClear={() => setLastFrameFile(null)}
                          />
                        </div>
                        {firstFrameFile && lastFrameFile && (
                          <p className="mt-1.5 text-[10px] text-[#b616d6]">Keyframe-to-video mode (wan2.2-kf2v-plus)</p>
                        )}
                      </div>
                    </>
                  )}

                  {videoPanel === 'motion' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Motion</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {MOTION_OPTIONS.map(m => (
                            <button
                              key={m}
                              onClick={() => setMotion(m)}
                              className={cn(
                                'px-2.5 py-1 rounded text-xs border',
                                motion === m ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                              )}
                            >{m}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Motion intensity</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {INTENSITY_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setIntensity(opt.value)}
                              className={cn(
                                'px-2 py-1.5 rounded text-xs border text-left',
                                intensity === opt.value ? 'bg-[#8c52ff] text-white border-[#8c52ff]' : 'bg-gray-900/60 text-gray-300 border-gray-700/50 hover:border-gray-500',
                              )}
                            >
                              <div className="font-medium">{opt.value}</div>
                              <div className={cn('text-[10px]', intensity === opt.value ? 'text-white/80' : 'text-gray-500')}>{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {mode === 'video' && audioFile && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/50">
                <Mic className="w-4 h-4 text-[#8c52ff]" />
                <span className="text-xs text-gray-300 truncate flex-1">{audioFile.name}</span>
                <button
                  onClick={() => setAudioFile(null)}
                  className="p-1 rounded hover:bg-gray-700/50 text-gray-400"
                  title="Remove audio"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-700/50 gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  ref={fileRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={onPickFiles}
                />
                <input
                  type="file"
                  ref={audioRef}
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 text-gray-300"
                  title="Attach image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={() => audioRef.current?.click()}
                  className={cn(
                    'p-2 rounded-lg border text-gray-300',
                    audioFile ? 'bg-[#8c52ff]/20 border-[#8c52ff]/50' : 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80',
                  )}
                  title="Upload voice / audio"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 bg-gray-800/60 border border-gray-700/50 rounded-lg p-0.5">
                  {modeOptions.map(opt => {
                    const Icon = opt.icon;
                    const active = mode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setMode(opt.id);
                        }}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all',
                          active ? 'bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white' : 'text-gray-400 hover:text-white',
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    );
                  })}
                  </div>
                </div>

                <div className="hidden sm:block" />


              <Button
                onClick={handleSend}
                disabled={isBusy || (!text.trim() && files.length === 0)}
                className="px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all text-sm"
                style={{ backgroundImage: 'linear-gradient(to right, #8c52ff, #b616d6)' }}
              >
                {isBusy ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Working…</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Send</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </section>
      <InpaintDialog
        open={inpaintOpen}
        onOpenChange={setInpaintOpen}
        image={files[0] || null}
        onApply={(mask) => setMaskFile(mask)}
      />
    </>
  );
};

const FrameSlot: React.FC<{
  label: string;
  file: File | null;
  onPick: (f: File) => void;
  onClear: () => void;
}> = ({ label, file, onPick, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
      {file ? (
        <div className="relative h-24 rounded-lg overflow-hidden border border-[#8c52ff]/50 bg-black">
          <img src={URL.createObjectURL(file)} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 px-1.5 py-0.5 text-[10px] text-white bg-black/60 backdrop-blur-sm">
            {label}
          </div>
          <button
            onClick={onClear}
            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black/90"
            title="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="h-24 w-full rounded-lg border border-dashed border-gray-700/60 hover:border-[#8c52ff] bg-gray-900/40 text-gray-400 hover:text-white text-xs flex flex-col items-center justify-center gap-1 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
          <span>{label}</span>
          <span className="text-[9px] text-gray-600">Click to upload</span>
        </button>
      )}
    </div>
  );
};

const MessageBubble: React.FC<{ m: ReturnType<typeof useMultimodalChat>['messages'][number] }> = ({ m }) => {
  const isUser = m.role === 'user';
  return (
    <div className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
          isUser
            ? 'bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white'
            : 'bg-gray-800/80 border border-gray-700/50 text-gray-100',
        )}
      >
        {m.attachments && m.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {m.attachments.map((a, i) => (
              a.previewUrl ? (
                <img key={i} src={a.previewUrl} alt={a.name} className="max-h-32 rounded-lg" />
              ) : (
                <div key={i} className="text-xs opacity-80">📎 {a.name}</div>
              )
            ))}
          </div>
        )}

        {m.kind === 'pending' && (
          <div className="flex items-center gap-2 text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>{m.content || 'Working…'}</span>
          </div>
        )}

        {m.kind === 'text' && (
          isUser ? (
            <div className="whitespace-pre-wrap">{m.content}</div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{m.content || '…'}</ReactMarkdown>
            </div>
          )
        )}

        {m.kind === 'image' && m.resultUrl && (
          <div>
            {m.resultUrls && m.resultUrls.length > 1 ? (
              <div className="grid grid-cols-2 gap-2">
                {m.resultUrls.map((u, i) => (
                  <img key={i} src={u} alt={`generated ${i + 1}`} className="rounded-lg w-full" />
                ))}
              </div>
            ) : (
              <img src={m.resultUrl} alt="generated" className="rounded-lg max-w-full" />
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> {m.resultUrls && m.resultUrls.length > 1 ? `${m.resultUrls.length} images ready` : 'Image ready'}</span>
              <Link to="/dashboard" className="text-xs text-purple-300 hover:text-white inline-flex items-center gap-1">
                View in history <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {m.kind === 'video' && m.resultUrl && (
          <div>
            <video src={m.resultUrl} controls className="w-full rounded-lg bg-black" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Video ready</span>
              <Link to="/dashboard" className="text-xs text-purple-300 hover:text-white inline-flex items-center gap-1">
                View in history <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {m.kind === 'error' && (
          <div className="text-red-300 text-xs">{m.content}</div>
        )}
      </div>
    </div>
  );
};

export default ChatComposer;
