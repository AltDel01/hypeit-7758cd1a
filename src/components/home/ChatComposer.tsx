import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, X, Sparkles, Loader2, ExternalLink, Image as ImageIcon,
  Film, MessageSquare, Wand2, Trash2, Mic, Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useMultimodalChat, ChatMode } from '@/hooks/useMultimodalChat';
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

const ChatComposer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages, send, isBusy, clear } = useMultimodalChat();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<ChatMode>('auto');
  const [ratio, setRatio] = useState<string>('16:9');
  const [duration, setDuration] = useState<number>(5);
  const [resolution, setResolution] = useState<string>('720p');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showVideoOpts, setShowVideoOpts] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Restore draft after auth
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

  const handleSend = async () => {
    if (!text.trim() && files.length === 0) return;
    // Require auth for image/video; allow chat without auth? Require auth always for simplicity.
    if (!user) {
      localStorage.setItem('homepageChatDraft', JSON.stringify({ text, mode }));
      localStorage.setItem('authRedirectPath', '/');
      navigate('/signup');
      return;
    }
    const t = text;
    const f = files;
    setText('');
    setFiles([]);
    await send(t, f, mode);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
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
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 text-gray-300"
                  title="Attach image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 bg-gray-800/60 border border-gray-700/50 rounded-lg p-0.5">
                  {modeOptions.map(opt => {
                    const Icon = opt.icon;
                    const active = mode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setMode(opt.id)}
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
            <img src={m.resultUrl} alt="generated" className="rounded-lg max-w-full" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Image ready</span>
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
