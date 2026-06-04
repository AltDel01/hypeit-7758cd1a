import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Film, Wand2, Image as ImageIcon, Layers, X, Plus,
  ChevronDown, Timer, Loader2, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  createGenerationRequest, pollVideoRequest, GenerationRequest,
} from '@/services/generationRequestService';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { joinStoredAttachmentUrls } from '@/utils/requestMedia';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const aspectRatioOptions = [
  { value: '', label: 'Ratio', width: 14, height: 14 },
  { value: '16:9', label: '16:9', width: 20, height: 11 },
  { value: '9:16', label: '9:16', width: 11, height: 20 },
  { value: '4:3', label: '4:3', width: 16, height: 12 },
  { value: '1:1', label: '1:1', width: 14, height: 14 },
  { value: '21:9', label: '21:9', width: 21, height: 9 },
];
const resolutionOptions = [
  { value: '', label: 'Quality' },
  { value: '1080P', label: '1080P' },
  { value: '720P', label: '720P' },
];
const frameOptions = [
  { value: '', label: 'Frame' },
  { value: 'first-last', label: 'First and last frames' },
  { value: 'keyframes', label: 'Keyframes only' },
  { value: 'all', label: 'All frames' },
  { value: 'custom', label: 'Custom selection' },
];
const durationOptions = [
  { value: '', label: 'Duration' },
  { value: '5s', label: '5s' },
  { value: '10s', label: '10s' },
  { value: '15s', label: '15s' },
];
const examplePrompts = [
  'A cinematic shot of a city skyline at sunset',
  'Smooth dolly zoom into a coffee cup on a desk',
  'A neon-lit alley with rain reflections',
  'Slow motion waves crashing on a tropical beach',
  'A futuristic spaceship flying through clouds',
];

type VideoMode = 'video-t2v' | 'video-i2v' | 'video-r2v';
const videoModes: { id: VideoMode; label: string; icon: any }[] = [
  { id: 'video-t2v', label: 'Text to Video', icon: Wand2 },
  { id: 'video-i2v', label: 'Image to Video', icon: ImageIcon },
  { id: 'video-r2v', label: 'Reference to Video', icon: Layers },
];

const HeroWithEditor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [videoMode, setVideoMode] = useState<VideoMode>('video-t2v');
  const [selectedFrames, setSelectedFrames] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [startTimestamp, setStartTimestamp] = useState('00:00');
  const [endTimestamp, setEndTimestamp] = useState('00:00');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<GenerationRequest | null>(null);
  const [resolvedResultUrl, setResolvedResultUrlState] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // Restore prompt + mode after auth round-trip
  useEffect(() => {
    try {
      const raw = localStorage.getItem('homepagePromptDraft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.prompt) setPrompt(draft.prompt);
        if (draft?.videoMode) setVideoMode(draft.videoMode);
        if (draft?.selectedAspectRatio) setSelectedAspectRatio(draft.selectedAspectRatio);
        if (draft?.selectedResolution) setSelectedResolution(draft.selectedResolution);
        if (draft?.selectedDuration) setSelectedDuration(draft.selectedDuration);
        localStorage.removeItem('homepagePromptDraft');
      }
    } catch {}
  }, []);

  // Polling: while a Wan video request is in-flight, kick wan-video-poll every 5s
  useEffect(() => {
    if (!submittedRequest) return;
    const isTerminal = submittedRequest.status === 'completed' || submittedRequest.status === 'failed';
    if (isTerminal) return;

    let active = true;
    const poll = async () => {
      try {
        if (
          submittedRequest.request_type === 'video' &&
          submittedRequest.auto_provider === 'wan' &&
          submittedRequest.provider_task_id
        ) {
          await pollVideoRequest(submittedRequest.id);
        }
        const { data } = await supabase
          .from('generation_requests')
          .select('*')
          .eq('id', submittedRequest.id)
          .maybeSingle();
        if (!active || !data) return;
        const current = data as GenerationRequest;
        setSubmittedRequest(current);
        if (current.status === 'completed' && current.result_url) {
          const url = await resolveResultUrl(current.result_url);
          if (url && active) setResolvedResultUrlState(url);
        }
      } catch (e) {
        console.error('homepage poll error', e);
      }
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => { active = false; clearInterval(id); };
  }, [submittedRequest?.id, submittedRequest?.status]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const list = Array.from(files);
    if (videoMode === 'video-i2v') {
      setUploadedImages(list.slice(0, 1));
    } else {
      setUploadedImages(prev => [...prev, ...list].slice(0, 3));
    }
    toast.success(`${list.length} image${list.length > 1 ? 's' : ''} added`);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleExampleClick = (example: string) => setPrompt(example);

  const isInProgress = !!submittedRequest && submittedRequest.status !== 'completed' && submittedRequest.status !== 'failed';

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your video');
      return;
    }
    if (videoMode === 'video-i2v' && uploadedImages.length === 0) {
      toast.error('Image to Video requires a starting image');
      return;
    }
    if (videoMode === 'video-r2v' && uploadedImages.length === 0) {
      toast.error('Reference to Video requires at least one reference image');
      return;
    }

    if (!user) {
      // Persist draft, send to signup, return to homepage after auth
      localStorage.setItem('homepagePromptDraft', JSON.stringify({
        prompt, videoMode, selectedAspectRatio, selectedResolution, selectedDuration,
      }));
      localStorage.setItem('authRedirectPath', '/');
      navigate('/signup');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload reference images if needed
      const storageRefs: string[] = [];
      for (const file of uploadedImages) {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr, data: upData } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        if (upErr || !upData) {
          throw new Error(`Upload failed for ${file.name}`);
        }
        storageRefs.push(`storage:product-images/${upData.path}`);
      }

      const fullPrompt = (() => {
        let p = prompt.trim();
        if (selectedAspectRatio) p += ` | Aspect: ${selectedAspectRatio}`;
        if (selectedResolution) p += ` | Resolution: ${selectedResolution}`;
        if (selectedDuration) p += ` | Duration: ${selectedDuration}`;
        if (startTimestamp !== '00:00' || endTimestamp !== '00:00') p += ` | Timeline: ${startTimestamp}-${endTimestamp}`;
        return p;
      })();

      const referenceImageUrl = joinStoredAttachmentUrls(storageRefs);

      const parsedDuration = selectedDuration
        ? parseInt(String(selectedDuration).replace(/[^0-9]/g, ''), 10) || undefined
        : undefined;
      const request = await createGenerationRequest({
        requestType: 'video',
        prompt: fullPrompt,
        aspectRatio: selectedAspectRatio || undefined,
        referenceImageUrl,
        category: videoMode,
        firstFrameUrl: videoMode === 'video-i2v' ? storageRefs[0] : undefined,
        referenceImageUrls: videoMode === 'video-r2v' ? storageRefs : undefined,
        duration: parsedDuration,
        resolution: selectedResolution || undefined,
      });

      if (!request) {
        toast.error('Could not create request. Check your credits.');
        return;
      }

      setSubmittedRequest(request);
      setResolvedResultUrlState(null);
      toast.success('Generation started');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to start generation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setSubmittedRequest(null);
    setResolvedResultUrlState(null);
  };

  return (
    <section className="relative min-h-0 md:min-h-[90vh] flex flex-col items-center justify-start md:justify-center px-3 md:px-4 pt-14 pb-4 md:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-600/20 rounded-full blur-[100px] md:blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-600/20 rounded-full blur-[100px] md:blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto w-full">
        <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-1 md:mb-3 leading-tight px-2">
          <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
            Create Stop<br className="md:hidden" />
            <span className="hidden md:inline"> </span>Scrolling Content
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-xl text-gray-400 text-center mb-4 md:mb-6 px-4">
          Generate viral video in seconds with AI. Just describe what you want.
        </p>

        {/* Mode tabs */}
        <div className="w-full mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex md:flex-wrap md:justify-center gap-2 px-2 md:px-0 min-w-max md:min-w-0">
            {videoModes.map(mode => {
              const isActive = videoMode === mode.id;
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => { setVideoMode(mode.id); setUploadedImages([]); }}
                  className={cn(
                    'flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Box */}
        <div className="w-full max-w-4xl px-1 md:px-0">
          <div className="relative bg-gray-900/80 border border-gray-700/50 rounded-xl md:rounded-2xl p-3 md:p-5 backdrop-blur-sm">
            {/* Image previews */}
            {uploadedImages.length > 0 && (
              <div className="mb-3 md:mb-4 flex flex-wrap gap-2">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden bg-black inline-block">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="max-h-32 max-w-full object-contain rounded-lg" />
                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe what you want to create, generate, or edit..."
              className="min-h-[80px] md:min-h-[120px] bg-transparent border-none text-white placeholder:text-gray-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base"
            />

            {/* Example prompts */}
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 mt-2 mb-3 md:mb-4">
              <div className="flex md:flex-wrap gap-2 min-w-max md:min-w-0">
                {examplePrompts.slice(0, 3).map((example, index) => (
                  <button key={index} onClick={() => handleExampleClick(example)} className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 transition-all whitespace-nowrap">
                    {example}
                  </button>
                ))}
                {examplePrompts.slice(3).map((example, index) => (
                  <button key={index + 3} onClick={() => handleExampleClick(example)} className="hidden md:block px-3 py-1.5 rounded-full text-xs bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 transition-all">
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="hidden md:flex items-center gap-4 py-3 border-t border-gray-700/50">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Timeline:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Start</span>
                  <input type="text" value={startTimestamp} onChange={e => setStartTimestamp(e.target.value)} placeholder="00:00" className="w-16 px-2 py-1 text-sm text-center bg-gray-800/80 border border-gray-700/50 rounded-md text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">End</span>
                  <input type="text" value={endTimestamp} onChange={e => setEndTimestamp(e.target.value)} placeholder="00:15" className="w-16 px-2 py-1 text-sm text-center bg-gray-800/80 border border-gray-700/50 rounded-md text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pt-3 md:pt-4 border-t border-gray-700/50 gap-3 md:gap-0">
              <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
                {videoMode !== 'video-t2v' && (
                  <>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple={videoMode === 'video-r2v'}
                      className="hidden"
                    />
                    <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 transition-all group flex-shrink-0">
                      <div className="flex items-center gap-0.5">
                        <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 group-hover:text-white" />
                        <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-white" />
                      </div>
                      <span className="text-[8px] md:text-[10px] text-gray-400 group-hover:text-white">
                        {videoMode === 'video-i2v' ? 'Image' : 'Refs'}
                      </span>
                    </button>
                    <div className="w-px h-8 md:h-10 bg-gray-700/50 mx-0.5 md:mx-1 flex-shrink-0" />
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                      <div className="border border-gray-500 rounded-sm" style={{
                        width: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.width || 14) * 0.7,
                        height: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.height || 14) * 0.7,
                      }} />
                      <span className="hidden sm:inline">{selectedAspectRatio || 'Ratio'}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                    {aspectRatioOptions.filter(o => o.value !== '').map(option => (
                      <DropdownMenuItem key={option.value} onClick={() => setSelectedAspectRatio(option.value)} className={cn('flex items-center gap-3 cursor-pointer', selectedAspectRatio === option.value && 'bg-purple-500/20')}>
                        <div className="border border-gray-400 rounded-sm" style={{ width: option.width, height: option.height }} />
                        <span className="text-gray-200">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                      <span>{selectedResolution || 'Quality'}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                    {resolutionOptions.filter(o => o.value !== '').map(option => (
                      <DropdownMenuItem key={option.value} onClick={() => setSelectedResolution(option.value)} className={cn('cursor-pointer', selectedResolution === option.value && 'bg-purple-500/20')}>
                        <span className="text-gray-200">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                      <Film className="w-3.5 h-3.5 text-gray-400" />
                      <span className="hidden md:inline">{frameOptions.find(f => f.value === selectedFrames)?.label || 'Frame'}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                    {frameOptions.filter(o => o.value !== '').map(option => (
                      <DropdownMenuItem key={option.value} onClick={() => setSelectedFrames(option.value)} className={cn('cursor-pointer', selectedFrames === option.value && 'bg-purple-500/20')}>
                        <span className="text-gray-200">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                      <Timer className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedDuration || 'Duration'}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                    {durationOptions.filter(o => o.value !== '').map(option => (
                      <DropdownMenuItem key={option.value} onClick={() => setSelectedDuration(option.value)} className={cn('cursor-pointer', selectedDuration === option.value && 'bg-purple-500/20')}>
                        <span className="text-gray-200">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isSubmitting || isInProgress}
                className="px-4 md:px-6 py-2 md:py-2.5 text-white font-semibold rounded-lg md:rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-xs md:text-sm flex-shrink-0"
                style={{ backgroundImage: 'linear-gradient(to right, #8c52ff, #b616d6)' }}
              >
                {isSubmitting || isInProgress ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isSubmitting ? 'Submitting...' : 'Generating...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Result panel */}
          {submittedRequest && (
            <div className="mt-4 md:mt-6 bg-gray-900/80 border border-gray-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {submittedRequest.status === 'completed' ? (
                    <Sparkles className="w-4 h-4 text-green-400" />
                  ) : submittedRequest.status === 'failed' ? (
                    <X className="w-4 h-4 text-red-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  )}
                  <span className="text-sm text-white font-medium capitalize">
                    {submittedRequest.status === 'completed' ? 'Completed' :
                     submittedRequest.status === 'failed' ? 'An editor will take over' :
                     'Processing'}
                  </span>
                </div>
                <button onClick={reset} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submittedRequest.status === 'completed' && resolvedResultUrl ? (
                <video src={resolvedResultUrl} controls className="w-full rounded-lg bg-black" />
              ) : submittedRequest.status === 'failed' ? (
                <p className="text-sm text-gray-400">
                  Auto-generation could not finish. Your request was handed to a human editor and will appear in your dashboard history shortly.
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-400" />
                  Generating your video. This usually takes 1 to 3 minutes.
                </div>
              )}

              <div className="mt-4 flex items-center justify-end">
                <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white">
                  View in history <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroWithEditor;
