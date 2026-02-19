import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Smartphone, Scissors, Captions, Film, Layers, Wand2, Image,
  Video, X, ZoomIn, AudioLines, Plus, ChevronDown, Timer, MessageCircleOff,
  Languages, Loader2, Play, ExternalLink, TrendingUp, Download
} from 'lucide-react';
import retentionDemoVideo from '@/assets/retention-demo.mp4';
import aiCreatorDemoVideo from '@/assets/ai-creator-demo.mp4';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createGenerationRequest } from '@/services/generationRequestService';
import { supabase } from '@/integrations/supabase/client';
import { loadEditorState, clearEditorState, UploadedFile } from '@/hooks/useEditorState';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AiClipButton from '@/components/shared/AiClipButton';

// All clips are portrait 9:16 — these are viral short clips (TikTok/Reels/Shorts format)
const dummyClips = [
  { id: '1PmzQse11xv4HV1O4iEUh02OMvoOJ7IPh', title: '9-to-9 Startup Life vs. 9-to-5 Jobs', subtitle: 'The REAL Difference', duration: '1:24', views: '24.3K', score: 98, tags: ['viral', 'trending'], aspect: '9:16' },
  { id: '1B4mBNaUUtC1-LaAU4ERGXKF3SW2hUQle', title: 'Startup Frustration', subtitle: 'Turn Anger into Lasting Impulse', duration: '0:58', views: '18.1K', score: 94, tags: ['emotional', 'motivational'], aspect: '9:16' },
  { id: '12Tz8beJ6mM3ubO3DasR2RLqKX7m4qFLG', title: 'Startup Grind', subtitle: 'Mastering Essential Skills Quickly', duration: '1:12', views: '31.7K', score: 96, tags: ['educational', 'trending'], aspect: '9:16' },
  { id: '1nCKqOnNr9jqYf1FdQFiljSquHF-es-zP', title: 'Startup Longevity', subtitle: 'Can You Stay Fun Through Hard Times?', duration: '1:05', views: '15.8K', score: 91, tags: ['mindset', 'resilience'], aspect: '9:16' },
];

interface SimplifiedDashboardProps {
  onRequestCreated?: () => void;
}

const frameOptions = [
  { value: 'first-last', label: 'First and last frames' },
  { value: 'keyframes', label: 'Keyframes only' },
  { value: 'all', label: 'All frames' },
  { value: 'custom', label: 'Custom selection' },
];

const aspectRatioOptions = [
  { value: '16:9', label: '16:9', width: 20, height: 11 },
  { value: '9:16', label: '9:16', width: 11, height: 20 },
  { value: '4:3', label: '4:3', width: 16, height: 12 },
  { value: '1:1', label: '1:1', width: 14, height: 14 },
  { value: '21:9', label: '21:9', width: 21, height: 9 },
];

const resolutionOptions = [
  { value: '4K', label: '4K' },
  { value: '1080P', label: '1080P' },
  { value: '720P', label: '720P' },
  { value: '480P', label: '480P' },
];

const durationOptions = [
  { value: '5s', label: '5s' },
  { value: '10s', label: '10s' },
  { value: '15s', label: '15s' },
  { value: '30s', label: '30s' },
  { value: '60s', label: '60s' },
];

const editingFeatures = [
  { id: 'ai-edit', label: 'AI Edit', icon: Sparkles, description: 'Smart auto-edit with effects & transitions' },
  { id: 'iphone-quality', label: 'iPhone Quality', icon: Smartphone, description: 'Upscale to HD quality' },
  { id: 'trim', label: 'Trim', icon: Scissors, description: 'Cut and trim clips' },
  { id: 'caption', label: 'Caption', icon: Captions, description: 'Add AI captions' },
  { id: 'b-roll', label: 'B-roll', icon: Film, description: 'Add stock footage' },
  { id: 'transitions', label: 'Transitions', icon: Layers, description: 'Add smooth transitions' },
  { id: 'effects', label: 'Effects', icon: Wand2, description: 'Apply visual effects' },
  { id: 'zoom', label: 'Zoom', icon: ZoomIn, description: 'Add dynamic zoom effects' },
  { id: 'thumbnail', label: 'Thumbnail Generator', icon: Image, description: 'Create eye-catching thumbnails' },
  { id: 'censor-word', label: 'Censor Word', icon: MessageCircleOff, description: 'Automatically censor profanity' },
  { id: 'change-language', label: 'Language Dubbing', icon: Languages, description: 'Translate audio to any language' },
];

const examplePrompts = [
  'Add captions with trending font style',
  'Create smooth transitions between scenes',
  'Enhance colors and add cinematic look',
  'Add upbeat background music',
  'Generate viral short from this video',
];

const getAspectClass = (ratio: string) => {
  if (ratio === '9:16') return 'aspect-[9/16]';
  if (ratio === '1:1') return 'aspect-square';
  if (ratio === '4:3') return 'aspect-[4/3]';
  if (ratio === '21:9') return 'aspect-[21/9]';
  return 'aspect-video';
};

const SimplifiedDashboard = ({ onRequestCreated }: SimplifiedDashboardProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<File[]>([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [showAiClipResult, setShowAiClipResult] = useState(false);
  const [showRetentionResult, setShowRetentionResult] = useState(false);
  const [showAiCreatorResult, setShowAiCreatorResult] = useState(false);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFrames, setSelectedFrames] = useState('first-last');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [selectedResolution, setSelectedResolution] = useState('1080P');
  const [selectedDuration, setSelectedDuration] = useState('15s');
  const [startTimestamp, setStartTimestamp] = useState('00:00');
  const [endTimestamp, setEndTimestamp] = useState('00:15');

  // Load editor state from homepage on mount and auto-submit if needed
  useEffect(() => {
    const savedState = loadEditorState();
    if (!savedState) return;

    const loadedPrompt = savedState.prompt || '';
    const loadedFeatures = savedState.selectedFeatures || [];
    const loadedFiles = savedState.uploadedFiles || [];

    setPrompt(loadedPrompt);
    setSelectedFeatures(loadedFeatures);
    setSelectedAspectRatio(savedState.selectedAspectRatio || '16:9');
    setSelectedResolution(savedState.selectedResolution || '1080P');
    setSelectedDuration(savedState.selectedDuration || '15s');
    setSelectedFrames(savedState.selectedFrames || 'first-last');
    setStartTimestamp(savedState.startTimestamp || '00:00');
    setEndTimestamp(savedState.endTimestamp || '00:15');
    setUploadedFileUrls(loadedFiles);

    // Restore active mode
    let mode: string | null = null;
    if (savedState.aiClipMode) mode = 'aiclip';
    else if (savedState.retentionMode) mode = 'retention';
    else if (savedState.creatorMode) mode = 'creator';
    if (mode) setActiveMode(mode);

    clearEditorState();

    if (mode) {
      // Special mode: show loading then inline results, AND log to DB + send email
      setIsAutoProcessing(true);
      const modeLabel = mode === 'aiclip' ? 'AI Clip' : mode === 'retention' ? 'Retention Editing' : 'AI Creator';
      const fullPrompt = `[${modeLabel}] ${loadedPrompt.trim() || 'Generate viral content'} | Aspect: ${savedState.selectedAspectRatio || '9:16'} | Resolution: ${savedState.selectedResolution || '1080P'} | Duration: ${savedState.selectedDuration || '15s'}`;
      const videoFiles = loadedFiles.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl })
        .then(() => onRequestCreated?.())
        .catch(console.error);
      setTimeout(() => {
        setIsAutoProcessing(false);
        if (mode === 'retention') {
          setShowRetentionResult(true);
        } else if (mode === 'creator') {
          setShowAiCreatorResult(true);
        } else {
          setShowAiClipResult(true);
        }
      }, 15000);
    } else if (savedState.autoSubmit && (loadedPrompt.trim() || loadedFiles.length > 0)) {
      setIsAutoProcessing(true);
      setTimeout(() => {
        handleAutoSubmit(loadedPrompt, loadedFeatures, savedState, loadedFiles);
      }, 100);
    }
  }, []);

  const handleAutoSubmit = async (
    loadedPrompt: string,
    loadedFeatures: string[],
    savedState: ReturnType<typeof loadEditorState>,
    loadedFiles: UploadedFile[]
  ) => {
    if (!loadedPrompt.trim() && loadedFiles.length === 0) {
      setIsAutoProcessing(false);
      return;
    }
    setIsSubmitting(true);
    try {
      let fullPrompt = loadedPrompt.trim();
      if (loadedFeatures.length > 0) {
        const featureLabels = loadedFeatures.map(id => editingFeatures.find(f => f.id === id)?.label).filter(Boolean).join(', ');
        fullPrompt = `[${featureLabels}] ${fullPrompt}`;
      }
      const aspectRatio = savedState?.selectedAspectRatio || '16:9';
      const resolution = savedState?.selectedResolution || '1080P';
      const duration = savedState?.selectedDuration || '15s';
      const start = savedState?.startTimestamp || '00:00';
      const end = savedState?.endTimestamp || '00:15';
      fullPrompt += ` | Aspect: ${aspectRatio} | Resolution: ${resolution} | Duration: ${duration} | Timeline: ${start}-${end}`;
      const videoFiles = loadedFiles.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      const result = await createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl });
      if (result) {
        onRequestCreated?.();
      } else {
        toast.error('Failed to submit request. Please try again.');
        setIsSubmitting(false);
        setIsAutoProcessing(false);
      }
    } catch (error) {
      console.error('Auto-submit error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
      setIsAutoProcessing(false);
    }
  };

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeatures(prev => prev.includes(featureId) ? prev.filter(id => id !== featureId) : [...prev, featureId]);
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please sign in to upload videos'); return; }
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        await supabase.storage.from('product-images').upload(fileName, file);
      }
      setUploadedVideos(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} video(s) added`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setUploadedAudio(prev => [...prev, ...Array.from(files)]);
    toast.success(`${files.length} audio file(s) added`);
  };

  const removeVideo = (index: number) => setUploadedVideos(prev => prev.filter((_, i) => i !== index));
  const removeAudio = (index: number) => setUploadedAudio(prev => prev.filter((_, i) => i !== index));
  const removeUploadedFileUrl = (index: number) => setUploadedFileUrls(prev => prev.filter((_, i) => i !== index));
  const handleExampleClick = (example: string) => setPrompt(example);

  // Special mode submit: logs to DB for history, then shows inline results
  const handleSpecialModeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const modeLabel = activeMode === 'aiclip' ? 'AI Clip' : activeMode === 'retention' ? 'Retention Editing' : 'AI Creator';
      let fullPrompt = prompt.trim() || `[${modeLabel}] Generate viral content`;
      fullPrompt = `[${modeLabel}] ${fullPrompt} | Aspect: ${selectedAspectRatio} | Resolution: ${selectedResolution} | Duration: ${selectedDuration}`;
      const videoFiles = uploadedFileUrls.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      await createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl });
      onRequestCreated?.();
    } catch (error) {
      console.error('Special mode submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
    setIsAutoProcessing(true);
    setTimeout(() => {
      setIsAutoProcessing(false);
      if (activeMode === 'retention') {
        setShowRetentionResult(true);
      } else if (activeMode === 'creator') {
        setShowAiCreatorResult(true);
      } else {
        setShowAiClipResult(true);
      }
    }, 15000);
  };

  const handleSubmitInternal = async () => {
    if (!prompt.trim() && uploadedVideos.length === 0 && uploadedFileUrls.length === 0) {
      toast.error('Please enter a prompt or upload media');
      return;
    }
    setIsSubmitting(true);
    try {
      let fullPrompt = prompt.trim();
      if (selectedFeatures.length > 0) {
        const featureLabels = selectedFeatures.map(id => editingFeatures.find(f => f.id === id)?.label).filter(Boolean).join(', ');
        fullPrompt = `[${featureLabels}] ${fullPrompt}`;
      }
      fullPrompt += ` | Aspect: ${selectedAspectRatio} | Resolution: ${selectedResolution} | Duration: ${selectedDuration} | Timeline: ${startTimestamp}-${endTimestamp}`;
      const videoFiles = uploadedFileUrls.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      const result = await createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl });
      if (result) {
        onRequestCreated?.();
      } else {
        toast.error('Failed to submit request. Please try again.');
        setIsSubmitting(false);
        setIsAutoProcessing(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
      setIsAutoProcessing(false);
    }
  };

  const isSpecialMode = ['aiclip', 'retention', 'creator'].includes(activeMode || '');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <div className="w-full max-w-4xl space-y-6 flex-shrink-0">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            What do you want to create?
          </h1>
          <p className="text-muted-foreground">Describe your vision and we'll bring it to life</p>
        </div>

        {/* Editing Feature Buttons */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex md:flex-wrap md:justify-center gap-2 px-2 md:px-0 min-w-max md:min-w-0">
            {editingFeatures.slice(0, 6).map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id)}
                className={cn(
                  "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  selectedFeatures.includes(feature.id)
                    ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-purple-500/30"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50"
                )}
              >
                <feature.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-wrap justify-center gap-2 w-full">
          {editingFeatures.slice(6).map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                selectedFeatures.includes(feature.id)
                  ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50"
              )}
            >
              <feature.icon className="w-4 h-4" />
              {feature.label}
            </button>
          ))}
        </div>

        {/* AI Clip Button */}
        <AiClipButton
          className="mb-0"
          onAiClip={() => setActiveMode(prev => prev === 'aiclip' ? null : 'aiclip')}
          onRetentionEditing={() => setActiveMode(prev => prev === 'retention' ? null : 'retention')}
          onAiCreator={() => setActiveMode(prev => prev === 'creator' ? null : 'creator')}
        />

        {/* Prompt Box */}
        <div className={`relative bg-gray-900/80 border rounded-xl md:rounded-2xl p-3 md:p-5 backdrop-blur-sm transition-all duration-300 ${
          activeMode === 'aiclip' ? 'border-[#a259ff]/60 shadow-lg shadow-[#a259ff]/10'
          : activeMode === 'retention' ? 'border-[#ff6b6b]/60 shadow-lg shadow-[#ff6b6b]/10'
          : activeMode === 'creator' ? 'border-[#38d9f5]/60 shadow-lg shadow-[#38d9f5]/10'
          : 'border-gray-700/50'
        }`}>
          {/* Active Mode Banner */}
          {activeMode === 'aiclip' && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-[#a259ff]/10 border border-[#a259ff]/30">
              <Scissors className="w-3.5 h-3.5 text-[#d966ff]" />
              <span className="text-xs text-[#d966ff] font-medium">AI Clip mode active — generate viral clips from your video</span>
              <button onClick={() => setActiveMode(null)} className="ml-auto text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {activeMode === 'retention' && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-[#ff6b6b]/10 border border-[#ff6b6b]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#ff9a3c]" />
              <span className="text-xs text-[#ff9a3c] font-medium">Retention Editing mode active — boost watch time with smart cuts</span>
              <button onClick={() => setActiveMode(null)} className="ml-auto text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {activeMode === 'creator' && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-[#38d9f5]/10 border border-[#38d9f5]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#38d9f5]" />
              <span className="text-xs text-[#38d9f5] font-medium">AI Creator mode active — promote everything with AI-generated content</span>
              <button onClick={() => setActiveMode(null)} className="ml-auto text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* Video Preview from URLs (from homepage) */}
          {uploadedFileUrls.filter(f => f.type === 'video').length > 0 && (
            <div className="mb-3 md:mb-4">
              {uploadedFileUrls.filter(f => f.type === 'video').map((file, index) => (
                <div key={`url-video-${index}`} className={`relative rounded-lg overflow-hidden bg-black ${getAspectClass(selectedAspectRatio)} mb-2`}>
                  <video src={file.url} controls className="w-full h-full object-contain" />
                  <button onClick={() => removeUploadedFileUrl(uploadedFileUrls.findIndex(f2 => f2.url === file.url))} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Video Preview from local files */}
          {uploadedVideos.length > 0 && (
            <div className="mb-3 md:mb-4">
              {uploadedVideos.map((file, index) => (
                <div key={index} className={`relative rounded-lg overflow-hidden bg-black ${getAspectClass(selectedAspectRatio)} mb-2`}>
                  <video src={URL.createObjectURL(file)} controls className="w-full h-full object-contain" />
                  <button onClick={() => removeVideo(index)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Audio Files */}
          {(uploadedFileUrls.filter(f => f.type === 'audio').length > 0 || uploadedAudio.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
              {uploadedFileUrls.filter(f => f.type === 'audio').map((file, index) => (
                <div key={`url-audio-${index}`} className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-gray-800 rounded-lg text-xs md:text-sm">
                  <AudioLines className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-gray-300 max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => removeUploadedFileUrl(uploadedFileUrls.findIndex(f2 => f2.url === file.url))} className="text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {uploadedAudio.map((file, index) => (
                <div key={index} className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-gray-800 rounded-lg text-xs md:text-sm">
                  <AudioLines className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-gray-300 max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => removeAudio(index)} className="text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create, generate, or edit..."
            className="min-h-[80px] md:min-h-[120px] bg-transparent border-none text-white placeholder:text-gray-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base"
            disabled={isSubmitting || isAutoProcessing}
          />

          {/* Inline Processing Indicator */}
          {(isAutoProcessing || isSubmitting) && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-primary/10 border border-primary/30 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-primary">Processing your request...</span>
            </div>
          )}

          {/* Example Prompts */}
          <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 mt-2 mb-3 md:mb-4">
            <div className="flex md:flex-wrap gap-2 min-w-max md:min-w-0">
              {examplePrompts.slice(0, 3).map((example, index) => (
                <button key={index} onClick={() => handleExampleClick(example)} className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 transition-all duration-200 whitespace-nowrap" disabled={isSubmitting}>
                  {example}
                </button>
              ))}
              {examplePrompts.slice(3).map((example, index) => (
                <button key={index + 3} onClick={() => handleExampleClick(example)} className="hidden md:block px-3 py-1.5 rounded-full text-xs bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 transition-all duration-200" disabled={isSubmitting}>
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Timestamp Selection */}
          <div className="hidden md:flex items-center gap-4 py-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Timeline:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Start</span>
                <input type="text" value={startTimestamp} onChange={(e) => setStartTimestamp(e.target.value)} placeholder="00:00" className="w-16 px-2 py-1 text-sm text-center bg-gray-800/80 border border-gray-700/50 rounded-md text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>
              <span className="text-gray-500">—</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">End</span>
                <input type="text" value={endTimestamp} onChange={(e) => setEndTimestamp(e.target.value)} placeholder="00:15" className="w-16 px-2 py-1 text-sm text-center bg-gray-800/80 border border-gray-700/50 rounded-md text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pt-3 md:pt-4 border-t border-gray-700/50 gap-3 md:gap-0">
            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
              {/* Video Upload */}
              <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" multiple className="hidden" />
              <button onClick={() => videoInputRef.current?.click()} disabled={isSubmitting} className="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-200 group flex-shrink-0">
                <div className="flex items-center gap-0.5">
                  <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 group-hover:text-white" />
                  <Video className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-[8px] md:text-[10px] text-gray-400 group-hover:text-white">Video</span>
              </button>

              {/* Audio Upload */}
              <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" multiple className="hidden" />
              <button onClick={() => audioInputRef.current?.click()} disabled={isSubmitting} className="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-200 group flex-shrink-0">
                <div className="flex items-center gap-0.5">
                  <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 group-hover:text-white" />
                  <AudioLines className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-[8px] md:text-[10px] text-gray-400 group-hover:text-white">Voice</span>
              </button>

              <div className="w-px h-8 md:h-10 bg-gray-700/50 mx-0.5 md:mx-1 flex-shrink-0" />

              {/* Aspect Ratio */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                    <div className="border border-gray-500 rounded-sm" style={{ width: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.width || 16) * 0.7, height: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.height || 9) * 0.7 }} />
                    <span className="hidden sm:inline">{selectedAspectRatio}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {aspectRatioOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedAspectRatio(option.value)} className={cn("flex items-center gap-3 cursor-pointer", selectedAspectRatio === option.value && "bg-purple-500/20")}>
                      <div className="border border-gray-400 rounded-sm" style={{ width: option.width, height: option.height }} />
                      <span className="text-gray-200">{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Resolution */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                    <span>{selectedResolution}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {resolutionOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedResolution(option.value)} className={cn("cursor-pointer", selectedResolution === option.value && "bg-purple-500/20")}>
                      <span className="text-gray-200">{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Frame Selection */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                    <Film className="w-3.5 h-3.5 text-gray-400" />
                    <span className="hidden md:inline">{frameOptions.find(f => f.value === selectedFrames)?.label || 'Frames'}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {frameOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedFrames(option.value)} className={cn("cursor-pointer", selectedFrames === option.value && "bg-purple-500/20")}>
                      <span className="text-gray-200">{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Duration */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                    <Timer className="w-3.5 h-3.5 text-gray-400" />
                    <span>{selectedDuration}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {durationOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedDuration(option.value)} className={cn("cursor-pointer", selectedDuration === option.value && "bg-purple-500/20")}>
                      <span className="text-gray-200">{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Generate Button */}
            <Button
              onClick={isSpecialMode ? handleSpecialModeSubmit : handleSubmitInternal}
              disabled={isSubmitting || isAutoProcessing}
              className={`px-4 md:px-6 py-2 md:py-2.5 text-white font-semibold rounded-lg md:rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-xs md:text-sm flex-shrink-0 ${
                activeMode === 'aiclip' ? 'bg-gradient-to-r from-[#a259ff] to-[#d966ff] shadow-lg shadow-purple-500/40'
                : activeMode === 'retention' ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ff9a3c] shadow-lg shadow-red-500/30'
                : activeMode === 'creator' ? 'bg-gradient-to-r from-[#38d9f5] to-[#4f8eff] shadow-lg shadow-cyan-500/30'
                : 'bg-gradient-to-r from-[#8c52ff] to-[#b616d6] shadow-lg shadow-purple-500/30'
              }`}
            >
              {(isSubmitting || isAutoProcessing) ? (
                <div className="flex items-center justify-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline">Processing...</span></div>
              ) : activeMode === 'aiclip' ? (
                <div className="flex items-center justify-center gap-1.5"><Scissors className="w-3.5 h-3.5" /><span>AI Clip</span></div>
              ) : activeMode === 'retention' ? (
                <div className="flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /><span>Retention Edit</span></div>
              ) : activeMode === 'creator' ? (
                <div className="flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /><span>AI Creator</span></div>
              ) : (
                <div className="flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /><span>Generate</span></div>
              )}
            </Button>
          </div>

        </div>

      </div>

      {/* AI Clip Results — full-width section outside max-w-4xl, 4 columns */}
      {showAiClipResult && (
        <div className="w-full max-w-7xl mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Results header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[#a259ff] to-[#d966ff]">
                <Scissors className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">AI Clip Results</span>
              <span className="text-sm text-gray-400">— 4 viral clips extracted</span>
            </div>
            <button onClick={() => setShowAiClipResult(false)} className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4-column grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dummyClips.map((clip) => {
              const isPortrait = clip.aspect === '9:16';
              const thumbnailUrl = `https://drive.google.com/thumbnail?id=${clip.id}&sz=w400`;
              return (
                <div key={clip.id} className="rounded-xl overflow-hidden border border-gray-700/50 hover:border-[#a259ff]/40 transition-all duration-200 bg-gray-900 flex flex-col">
                  {/* Video frame */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      paddingBottom: isPortrait ? '177.78%' : '56.25%',
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    }}
                  >
                  {activeClipId === clip.id ? (
                      <div className="absolute overflow-hidden" style={{ inset: 0 }}>
                        <iframe
                          src={`https://drive.google.com/file/d/${clip.id}/preview?rm=minimal`}
                          allow="autoplay"
                          allowFullScreen
                          style={{
                            border: 'none',
                            position: 'absolute',
                            top: '-8px',
                            left: '-40px',
                            width: 'calc(100% + 80px)',
                            height: 'calc(100% + 16px)',
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <img
                          src={thumbnailUrl}
                          alt={clip.title}
                          className="absolute inset-0 w-full h-full"
                          style={{ objectFit: 'cover', objectPosition: 'center top', transform: isPortrait ? 'scale(1.2)' : 'scale(1)' }}
                        />
                        <div className="absolute inset-0 bg-black/25" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button onClick={() => setActiveClipId(clip.id)} className="group/play">
                            <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover/play:bg-white/30 group-hover/play:scale-110 transition-all duration-200 backdrop-blur-sm">
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                          </button>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white font-mono">{clip.duration}</div>
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#a259ff]/80 rounded-full text-xs text-white font-semibold">
                          <Sparkles className="w-3 h-3" />{clip.score}% viral
                        </div>
                      </>
                    )}
                  </div>
                  {/* Clip info */}
                  <div className="px-3 py-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-base font-bold leading-tight">{clip.title}</p>
                       <p className="text-gray-300 text-sm mt-0.5 truncate">{clip.subtitle}</p>
                       <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                         {clip.tags.slice(0, 2).map(tag => (
                           <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-xs border border-gray-700/50">#{tag}</span>
                         ))}
                         <span className="text-gray-400 text-xs">{clip.views} views avg</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(`https://drive.google.com/file/d/${clip.id}/view?usp=sharing`, '_blank')}
                      className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      title="Open in Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Retention Editing Result — single video, wider layout */}
      {showRetentionResult && (
        <div className="w-full max-w-7xl mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff6b6b] to-[#ff9a3c]">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">Retention Edit Result</span>
              <span className="text-sm text-gray-400">— optimized for maximum watch time</span>
            </div>
            <button onClick={() => setShowRetentionResult(false)} className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video + Info side by side */}
          <div className="flex flex-col lg:flex-row gap-6 bg-gray-900 border border-[#ff6b6b]/30 rounded-2xl overflow-hidden">
            {/* Video player */}
            <div className="lg:w-2/3 relative bg-black">
              <video
                src={retentionDemoVideo}
                controls
                className="w-full h-full object-contain"
                style={{ maxHeight: '520px' }}
              />
            </div>

            {/* Stats panel */}
            <div className="lg:w-1/3 p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-white leading-snug">Startup Founder: Why The CEO Journey Is So Steep</h2>
                <p className="text-gray-400 text-sm mt-1">Retention-optimized edit — smart cuts, dynamic pacing & hook reinforcement</p>
              </div>

              {/* Retention score */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#ff6b6b]/10 to-[#ff9a3c]/10 border border-[#ff6b6b]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300 font-medium">Retention Score</span>
                  <span className="text-2xl font-black text-[#ff9a3c]">94%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-700">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ff9a3c]" style={{ width: '94%' }} />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Watch Time', value: '+38%', icon: '⏱' },
                  { label: 'Avg Duration', value: '4:12', icon: '🎬' },
                  { label: 'Hook Strength', value: 'High', icon: '🎯' },
                  { label: 'Pacing Score', value: '96/100', icon: '⚡' },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/50">
                    <div className="text-lg mb-0.5">{stat.icon}</div>
                    <div className="text-white font-bold text-sm">{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Edits applied */}
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Edits Applied</p>
                <div className="flex flex-wrap gap-2">
                  {['Smart cuts', 'Hook boost', 'Pacing fix', 'B-roll insert', 'Audio sync'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff9a3c] text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Download */}
              <a
                href={retentionDemoVideo}
                download="retention-edit.mp4"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#ff6b6b] to-[#ff9a3c] text-white font-semibold text-sm hover:opacity-90 transition-opacity mt-auto"
              >
                <Download className="w-4 h-4" />
                Download Edited Video
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AI Creator Result — single video, wider layout */}
      {showAiCreatorResult && (
        <div className="w-full max-w-7xl mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[#38d9f5] to-[#4f8eff]">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">AI Creator Result</span>
              <span className="text-sm text-gray-400">— AI-generated promotional content</span>
            </div>
            <button onClick={() => setShowAiCreatorResult(false)} className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video + Info side by side */}
          <div className="flex flex-col lg:flex-row gap-6 bg-gray-900 border border-[#38d9f5]/30 rounded-2xl overflow-hidden">
            {/* Video player */}
            <div className="lg:w-2/3 relative bg-black flex items-center justify-center">
              <video
                src={aiCreatorDemoVideo}
                controls
                className="w-full h-full object-contain"
                style={{ maxHeight: '520px' }}
              />
            </div>

            {/* Stats panel */}
            <div className="lg:w-1/3 p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-white leading-snug">AI Creator: Talking Character Ad</h2>
                <p className="text-gray-400 text-sm mt-1">AI-generated promotional video with lip-synced avatar & branded overlay</p>
              </div>

              {/* Creator score */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#38d9f5]/10 to-[#4f8eff]/10 border border-[#38d9f5]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300 font-medium">Engagement Score</span>
                  <span className="text-2xl font-black text-[#38d9f5]">97%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-700">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#38d9f5] to-[#4f8eff]" style={{ width: '97%' }} />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Click Rate', value: '+52%', icon: '🎯' },
                  { label: 'Avg Watch', value: '95%', icon: '👁' },
                  { label: 'AI Voice', value: 'Cloned', icon: '🎙' },
                  { label: 'Lip Sync', value: '98/100', icon: '🤖' },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/50">
                    <div className="text-lg mb-0.5">{stat.icon}</div>
                    <div className="text-white font-bold text-sm">{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Features applied */}
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">AI Features Used</p>
                <div className="flex flex-wrap gap-2">
                  {['Talking avatar', 'Voice clone', 'Auto-caption', 'Brand overlay', 'Lip sync'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-[#38d9f5]/10 border border-[#38d9f5]/30 text-[#38d9f5] text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Download */}
              <a
                href={aiCreatorDemoVideo}
                download="ai-creator-result.mp4"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#38d9f5] to-[#4f8eff] text-white font-semibold text-sm hover:opacity-90 transition-opacity mt-auto"
              >
                <Download className="w-4 h-4" />
                Download Creator Video
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedDashboard;

