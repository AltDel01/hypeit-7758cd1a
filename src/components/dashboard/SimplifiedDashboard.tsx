import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Smartphone, Scissors, Captions, Film, Layers, Wand2, Image,
  Video, X, ZoomIn, AudioLines, Plus, ChevronDown, Timer, MessageCircleOff,
  Languages, Loader2, Play, ExternalLink, TrendingUp, CheckCircle
} from 'lucide-react';
import ReviewFeedbackBox from './ReviewFeedbackBox';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { GenerationRequest } from '@/services/generationRequestService';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
// Dummy video placeholders (files removed)
const retentionDemoVideo = '';
const aiCreatorDemoVideo = '';
const aiEditDemoVideo = '';
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
import { FEATURE_MODE_MAP, getConfigByMode, isFeatureMode } from '@/config/featureModes';
import CreditCostPreview from './CreditCostPreview';
import { calculateCreditCost } from '@/config/creditCosts';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

// Dummy clips (video files removed)
const dummyClips = [
  { id: 'clip-1', title: '9-to-9 Startup Life vs. 9-to-5 Jobs', subtitle: 'The REAL Difference', duration: '1:24', views: '24.3K', score: 98, tags: ['viral', 'trending'], aspect: '9:16' },
  { id: 'clip-2', title: 'Startup Frustration', subtitle: 'Turn Anger into Lasting Impulse', duration: '0:58', views: '18.1K', score: 94, tags: ['emotional', 'motivational'], aspect: '9:16' },
  { id: 'clip-3', title: 'Startup Grind', subtitle: 'Mastering Essential Skills Quickly', duration: '1:12', views: '31.7K', score: 96, tags: ['educational', 'trending'], aspect: '9:16' },
  { id: 'clip-4', title: 'Startup Longevity', subtitle: 'Can You Stay Fun Through Hard Times?', duration: '1:05', views: '15.8K', score: 91, tags: ['mindset', 'resilience'], aspect: '9:16' },
];

interface SimplifiedDashboardProps {
  onRequestCreated?: () => void;
  latestRequest?: GenerationRequest | null;
}

const frameOptions = [
  { value: '', label: 'Frame' },
  { value: 'first-last', label: 'First and last frames' },
  { value: 'keyframes', label: 'Keyframes only' },
  { value: 'all', label: 'All frames' },
  { value: 'custom', label: 'Custom selection' },
];

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
  { value: '4K', label: '4K' },
  { value: '1080P', label: '1080P' },
  { value: '720P', label: '720P' },
  { value: '480P', label: '480P' },
];

const durationOptions = [
  { value: '', label: 'Duration' },
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

const SimplifiedDashboard = ({ onRequestCreated, latestRequest }: SimplifiedDashboardProps) => {
  const { user } = useAuth();
  const { data: profileData } = useQuery({
    queryKey: ['profile-credits', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('generations_this_month, monthly_generation_limit')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
  });

  const remainingCredits = (profileData?.monthly_generation_limit || 25) - (profileData?.generations_this_month || 0);
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
  const [showAiEditResult, setShowAiEditResult] = useState(false);
  const [showSubmittedConfirmation, setShowSubmittedConfirmation] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<GenerationRequest | null>(null);
  const [resolvedResultUrl, setResolvedResultUrl] = useState<string | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFrames, setSelectedFrames] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [startTimestamp, setStartTimestamp] = useState('00:00');
  const [endTimestamp, setEndTimestamp] = useState('00:00');

  // Load editor state from homepage on mount and auto-submit if needed
  useEffect(() => {
    const savedState = loadEditorState();
    if (!savedState) return;

    const loadedPrompt = savedState.prompt || '';
    const loadedFeatures = savedState.selectedFeatures || [];
    const loadedFiles = savedState.uploadedFiles || [];

    setPrompt(loadedPrompt);
    setSelectedFeatures(loadedFeatures);
    setSelectedAspectRatio(savedState.selectedAspectRatio || '');
    setSelectedResolution(savedState.selectedResolution || '');
    setSelectedDuration(savedState.selectedDuration || '');
    setSelectedFrames(savedState.selectedFrames || '');
    setStartTimestamp(savedState.startTimestamp || '00:00');
    setEndTimestamp(savedState.endTimestamp || '00:00');
    setUploadedFileUrls(loadedFiles);

    // Restore active mode
    let mode: string | null = null;
    if (savedState.aiClipMode) mode = 'aiclip';
    else if (savedState.retentionMode) mode = 'retention';
    else if (savedState.creatorMode) mode = 'creator';
    else if (savedState.aiEditMode) mode = 'aiedit';
    else if (savedState.featureMode) mode = savedState.featureMode;
    if (mode) setActiveMode(mode);

    clearEditorState();

    if (mode) {
      // Submit to DB and show confirmation
      setIsAutoProcessing(true);
      const mc = getConfigByMode(mode);
      const modeLabel = mode === 'aiclip' ? 'AI Clip' : mode === 'retention' ? 'Retention Editing' : mc ? mc.label : 'AI Creator';
      let fullPrompt = `[${modeLabel}] ${loadedPrompt.trim() || 'Generate viral content'}`;
      if (savedState.selectedAspectRatio) fullPrompt += ` | Aspect: ${savedState.selectedAspectRatio}`;
      if (savedState.selectedResolution) fullPrompt += ` | Resolution: ${savedState.selectedResolution}`;
      if (savedState.selectedDuration) fullPrompt += ` | Duration: ${savedState.selectedDuration}`;
      const videoFiles = loadedFiles.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      const cost = calculateCreditCost({ activeMode: mode, selectedFeatures: loadedFeatures, resolution: savedState.selectedResolution || '', duration: savedState.selectedDuration || '' });
      createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl, creditsUsed: cost.totalCost })
        .then((result) => {
          onRequestCreated?.();
          setIsAutoProcessing(false);
          setShowSubmittedConfirmation(true);
          if (result) {
            hasSubmittedInSession.current = true;
            setSubmittedRequestId(result.id);
            setSubmittedRequest(result);
          }
        })
        .catch((err) => {
          console.error(err);
          setIsAutoProcessing(false);
          toast.error('Failed to submit request.');
        });
    } else if (savedState.autoSubmit && (loadedPrompt.trim() || loadedFiles.length > 0)) {
      setIsAutoProcessing(true);
      setTimeout(() => {
        handleAutoSubmit(loadedPrompt, loadedFeatures, savedState, loadedFiles);
      }, 100);
    }
  }, []);

  // Track whether user actively submitted in this session
  const hasSubmittedInSession = useRef(false);
  // Track whether user dismissed the result via X button
  const hasDismissedResult = useRef(false);

  // Sync latestRequest from parent — only for tracking the SAME request user submitted
  // OR showing the latest result when user opens dashboard without submitting
  useEffect(() => {
    if (!latestRequest) return;

    // Don't show old results while auto-submit is still in progress
    if (isAutoProcessing) return;

    if (hasSubmittedInSession.current) {
      // User submitted in this session — ONLY track updates to their specific request
      if (submittedRequestId && submittedRequestId === latestRequest.id) {
        setSubmittedRequest(latestRequest);
        if (latestRequest.status === 'completed' && latestRequest.result_url) {
          resolveResultUrl(latestRequest.result_url).then(url => {
            if (url) setResolvedResultUrl(url);
          });
        } else if (latestRequest.status !== 'completed') {
          setResolvedResultUrl(null);
        }
      }
      // Ignore other requests — don't let old completed ones bleed in
      return;
    }

    // User opened dashboard without submitting — show latest completed result passively
    // But NOT if the user already dismissed it
    if (hasDismissedResult.current) return;
    if (latestRequest.status === 'completed' && latestRequest.result_url) {
      setSubmittedRequest(latestRequest);
      setSubmittedRequestId(latestRequest.id);
      setShowSubmittedConfirmation(true);
      resolveResultUrl(latestRequest.result_url).then(url => {
        if (url) setResolvedResultUrl(url);
      });
    }
    // Don't show in-progress requests from previous sessions
  }, [latestRequest?.id, latestRequest?.status, latestRequest?.result_url, submittedRequestId, isAutoProcessing]);

  // Simple polling fallback — polls the DB every 3s until request is completed with resolved URL
  // This is the ONLY fallback mechanism; the parent's realtime subscription is the primary
  useEffect(() => {
    if (!submittedRequestId) return;

    // Don't poll if already resolved
    const isTerminal = submittedRequest?.status === 'completed' || submittedRequest?.status === 'failed';
    if (isTerminal && resolvedResultUrl) return;

    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      try {
        const { data, error } = await supabaseClient
          .from('generation_requests')
          .select('*')
          .eq('id', submittedRequestId)
          .maybeSingle();

        if (error) {
          console.error('Poll error:', error);
          return;
        }

        if (!data || !isActive) return;

        const current = data as GenerationRequest;
        
        // Update state if anything changed
        setSubmittedRequest(prev => {
          if (prev?.status === current.status && prev?.result_url === current.result_url) return prev;
          console.log('Poll detected change:', { oldStatus: prev?.status, newStatus: current.status, resultUrl: current.result_url });
          return current;
        });

        // Resolve URL if completed
        if (current.status === 'completed' && current.result_url) {
          const url = await resolveResultUrl(current.result_url);
          if (url && isActive) {
            console.log('Poll resolved result URL successfully');
            setResolvedResultUrl(url);
          }
        }
      } catch (err) {
        console.error('Poll exception:', err);
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    const intervalId = setInterval(poll, 3000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [submittedRequestId, submittedRequest?.status, resolvedResultUrl]);

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
      const aspectRatio = savedState?.selectedAspectRatio || 'Default';
      const resolution = savedState?.selectedResolution || 'Default';
      const duration = savedState?.selectedDuration || 'Default';
      const start = savedState?.startTimestamp || '00:00';
      const end = savedState?.endTimestamp || '00:00';
      fullPrompt += ` | Aspect: ${aspectRatio} | Resolution: ${resolution} | Duration: ${duration} | Timeline: ${start}-${end}`;
      const videoFiles = loadedFiles.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      const autoSubmitCost = calculateCreditCost({ activeMode: null, selectedFeatures: loadedFeatures, resolution: savedState?.selectedResolution || '', duration: savedState?.selectedDuration || '' });
      const result = await createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl, creditsUsed: autoSubmitCost.totalCost });
      if (result) {
        hasSubmittedInSession.current = true;
        setSubmittedRequestId(result.id);
        setSubmittedRequest(result);
        setShowSubmittedConfirmation(true);
        setIsSubmitting(false);
        setIsAutoProcessing(false);
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
    const config = FEATURE_MODE_MAP[featureId];
    if (config) {
      setActiveMode(prev => {
        if (prev !== config.mode) {
          setShowAiClipResult(false);
          setShowRetentionResult(false);
          setShowAiCreatorResult(false);
          setShowAiEditResult(false);
        }
        return prev === config.mode ? null : config.mode;
      });
      return;
    }
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

  // Special mode submit: logs to DB, shows confirmation
  const handleSpecialModeSubmit = async () => {
    setIsSubmitting(false);
    setIsAutoProcessing(true);
    setShowSubmittedConfirmation(false);

    const currentMode = activeMode;

    try {
      const mc = getConfigByMode(currentMode || '');
      const modeLabel = currentMode === 'aiclip' ? 'AI Clip' : currentMode === 'retention' ? 'Retention Editing' : mc ? mc.label : 'AI Creator';
      let fullPrompt = prompt.trim() || `[${modeLabel}] Generate viral content`;
      if (selectedAspectRatio) fullPrompt += ` | Aspect: ${selectedAspectRatio}`;
      if (selectedResolution) fullPrompt += ` | Resolution: ${selectedResolution}`;
      if (selectedDuration) fullPrompt += ` | Duration: ${selectedDuration}`;
      const videoFiles = uploadedFileUrls.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      const result = await createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl });
      onRequestCreated?.();
      setIsAutoProcessing(false);
      setShowSubmittedConfirmation(true);
      if (result) {
        hasSubmittedInSession.current = true;
        setSubmittedRequestId(result.id);
        setSubmittedRequest(result);
      }
    } catch (error) {
      console.error('Special mode submit error:', error);
      setIsAutoProcessing(false);
      toast.error('Failed to submit request.');
    }
  };

  const handleSubmitInternal = async () => {
    if (!prompt.trim() && uploadedVideos.length === 0 && uploadedFileUrls.length === 0) {
      toast.error('Please enter a prompt or upload media');
      return;
    }

    setIsSubmitting(true);
    setShowSubmittedConfirmation(false);
    try {
      let fullPrompt = prompt.trim();
      if (selectedFeatures.length > 0) {
        const featureLabels = selectedFeatures.map(id => editingFeatures.find(f => f.id === id)?.label).filter(Boolean).join(', ');
        fullPrompt = `[${featureLabels}] ${fullPrompt}`;
      }
      if (selectedAspectRatio) fullPrompt += ` | Aspect: ${selectedAspectRatio}`;
      if (selectedResolution) fullPrompt += ` | Resolution: ${selectedResolution}`;
      if (selectedDuration) fullPrompt += ` | Duration: ${selectedDuration}`;
      if (startTimestamp !== '00:00' || endTimestamp !== '00:00') fullPrompt += ` | Timeline: ${startTimestamp}-${endTimestamp}`;
      const videoFiles = uploadedFileUrls.filter(f => f.type === 'video');
      const referenceUrl = videoFiles.length > 0 ? videoFiles[0].url : undefined;
      const result = await createGenerationRequest({ requestType: 'video', prompt: fullPrompt, referenceImageUrl: referenceUrl });
      if (result) {
        onRequestCreated?.();
        setIsSubmitting(false);
        setShowSubmittedConfirmation(true);
        hasSubmittedInSession.current = true;
        setSubmittedRequestId(result.id);
        setSubmittedRequest(result);
      } else {
        toast.error('Failed to submit request. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isSpecialMode = activeMode === 'aiclip' || activeMode === 'retention' || activeMode === 'creator' || isFeatureMode(activeMode);

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
            {editingFeatures.slice(0, 6).map((feature) => {
              const config = FEATURE_MODE_MAP[feature.id];
              const isActive = config ? activeMode === config.mode : selectedFeatures.includes(feature.id);
              return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id)}
                className={cn(
                  "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive && config ? "bg-gradient-to-r text-white shadow-lg" : isActive ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-purple-500/30" : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50"
                )}
                style={isActive && config ? { backgroundImage: `linear-gradient(to right, ${config.colorFrom}, ${config.colorTo})` } : undefined}
              >
                <feature.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {feature.label}
              </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex flex-wrap justify-center gap-2 w-full">
          {editingFeatures.slice(6).map((feature) => {
            const config = FEATURE_MODE_MAP[feature.id];
            const isActive = config ? activeMode === config.mode : selectedFeatures.includes(feature.id);
            return (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive && config ? "bg-gradient-to-r text-white shadow-lg" : isActive ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-purple-500/30" : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50"
              )}
              style={isActive && config ? { backgroundImage: `linear-gradient(to right, ${config.colorFrom}, ${config.colorTo})` } : undefined}
            >
              <feature.icon className="w-4 h-4" />
              {feature.label}
            </button>
            );
          })}
        </div>

        {/* AI Clip Button */}
        <AiClipButton
          className="mb-0"
          onAiClip={() => setActiveMode(prev => {
            if (prev !== 'aiclip') {
              setShowAiClipResult(false);
              setShowRetentionResult(false);
              setShowAiCreatorResult(false);
              setShowAiEditResult(false);
            }
            return prev === 'aiclip' ? null : 'aiclip';
          })}
          onRetentionEditing={() => setActiveMode(prev => {
            if (prev !== 'retention') {
              setShowAiClipResult(false);
              setShowRetentionResult(false);
              setShowAiCreatorResult(false);
              setShowAiEditResult(false);
            }
            return prev === 'retention' ? null : 'retention';
          })}
          onAiCreator={() => setActiveMode(prev => {
            if (prev !== 'creator') {
              setShowAiClipResult(false);
              setShowRetentionResult(false);
              setShowAiCreatorResult(false);
              setShowAiEditResult(false);
            }
            return prev === 'creator' ? null : 'creator';
          })}
        />

        {/* Prompt Box */}
        <div className={`relative bg-gray-900/80 border rounded-xl md:rounded-2xl p-3 md:p-5 backdrop-blur-sm transition-all duration-300 ${
          (() => {
            if (activeMode === 'aiclip') return 'border-[#a259ff]/60 shadow-lg shadow-[#a259ff]/10';
            if (activeMode === 'retention') return 'border-[#ff6b6b]/60 shadow-lg shadow-[#ff6b6b]/10';
            if (activeMode === 'creator') return 'border-[#38d9f5]/60 shadow-lg shadow-[#38d9f5]/10';
            return 'border-gray-700/50';
          })()
        }`} style={(() => {
          if (['aiclip', 'retention', 'creator'].includes(activeMode || '')) return undefined;
          const mc = getConfigByMode(activeMode || '');
          if (mc) return { borderColor: `${mc.color}66`, boxShadow: `0 10px 15px -3px ${mc.color}1a` };
          return undefined;
        })()}>
          {/* Active Mode Banner — AI Clip / Retention / Creator */}
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
          {/* Dynamic Feature Mode Banner */}
          {activeMode && !['aiclip', 'retention', 'creator'].includes(activeMode) && (() => {
            const mc = getConfigByMode(activeMode);
            if (!mc) return null;
            const IconComp = mc.icon;
            return (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border" style={{ backgroundColor: `${mc.color}1a`, borderColor: `${mc.color}4d` }}>
                <IconComp className="w-3.5 h-3.5" style={{ color: mc.color }} />
                <span className="text-xs font-medium" style={{ color: mc.color }}>{mc.label} mode active — {mc.description}</span>
                <button onClick={() => setActiveMode(null)} className="ml-auto text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
              </div>
            );
          })()}

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

          {/* Media Preview from local files — images, videos, docs */}
          {uploadedVideos.length > 0 && (
            <div className="mb-3 md:mb-4 flex flex-wrap gap-2">
              {uploadedVideos.map((file, index) => {
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                return (
                  <div key={index} className={`relative rounded-lg overflow-hidden bg-black mb-2 ${isImage ? 'inline-block' : `w-full ${getAspectClass(selectedAspectRatio)}`}`}>
                    {isImage ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="max-h-48 max-w-full object-contain rounded-lg" />
                    ) : isVideo ? (
                      <video src={URL.createObjectURL(file)} controls className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-300">
                        <Film className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[180px]">{file.name}</span>
                      </div>
                    )}
                    <button onClick={() => removeVideo(index)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
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
          {(isAutoProcessing || isSubmitting) && !resolvedResultUrl && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
              <span className="text-sm text-yellow-500 font-medium">Processing your request...</span>
              <span className="text-xs text-muted-foreground ml-1">The result will appear here automatically.</span>
            </div>
          )}

          {/* Inline: Processing status for submitted request (includes completed-but-URL-not-ready) */}
          {showSubmittedConfirmation && submittedRequest && !isSubmitting && !isAutoProcessing && (submittedRequest.status !== 'completed' || (submittedRequest.status === 'completed' && !resolvedResultUrl)) && submittedRequest.status !== 'failed' && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
              <span className="text-sm text-yellow-500 font-medium">
                {submittedRequest.status === 'completed' ? 'Loading your result...' : 'Processing your request...'}
              </span>
              <span className="text-xs text-muted-foreground ml-1">The result will appear here automatically.</span>
            </div>
          )}

          {/* Inline: Completed result */}
          {showSubmittedConfirmation && submittedRequest && submittedRequest.status === 'completed' && resolvedResultUrl && (
            <div className="relative mb-3 rounded-lg overflow-hidden border border-green-500/30 bg-card/50">
              <button
                onClick={() => {
                  hasDismissedResult.current = true;
                  setShowSubmittedConfirmation(false);
                  setResolvedResultUrl(null);
                  setSubmittedRequest(null);
                  setSubmittedRequestId(null);
                }}
                className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors backdrop-blur-sm"
                aria-label="Close result"
              >
                <X className="w-4 h-4" />
              </button>
              {submittedRequest.prompt && (
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Prompt</p>
                  <p className="text-sm text-foreground line-clamp-3">{submittedRequest.prompt}</p>
                </div>
              )}
              <div className="bg-black">
                {submittedRequest.request_type === 'video' ? (
                  <video src={resolvedResultUrl} controls className="w-full max-h-[400px]" />
                ) : (
                  <img src={resolvedResultUrl} alt="Result" className="w-full max-h-[400px] object-contain" />
                )}
              </div>
            </div>
          )}

          {/* Review & Feedback — appears with completed result */}
          {showSubmittedConfirmation && submittedRequest && submittedRequest.status === 'completed' && resolvedResultUrl && (
            <div className="mb-3">
              <ReviewFeedbackBox requestId={submittedRequest.id} />
            </div>
          )}


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
              {/* Media Upload */}
              <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" multiple className="hidden" />
              <button onClick={() => videoInputRef.current?.click()} disabled={isSubmitting} className="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-200 group flex-shrink-0">
                <div className="flex items-center gap-0.5">
                  <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 group-hover:text-white" />
                  <Image className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-[8px] md:text-[10px] text-gray-400 group-hover:text-white">Media</span>
              </button>

              {/* Voice / Reference Upload (audio + video for AI avatar reference) */}
              <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*,video/*" multiple className="hidden" />
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
                    <div className="border border-gray-500 rounded-sm" style={{ width: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.width || 14) * 0.7, height: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.height || 14) * 0.7 }} />
                    <span className="hidden sm:inline">{selectedAspectRatio || 'Ratio'}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {aspectRatioOptions.filter(o => o.value !== '').map((option) => (
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
                    <span>{selectedResolution || 'Quality'}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {resolutionOptions.filter(o => o.value !== '').map((option) => (
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
                    <span className="hidden md:inline">{frameOptions.find(f => f.value === selectedFrames)?.label || 'Frame'}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {frameOptions.filter(o => o.value !== '').map((option) => (
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
                    <span>{selectedDuration || 'Duration'}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  {durationOptions.filter(o => o.value !== '').map((option) => (
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
              className="px-4 md:px-6 py-2 md:py-2.5 text-white font-semibold rounded-lg md:rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-xs md:text-sm flex-shrink-0"
              style={(() => {
                if (activeMode === 'aiclip') return { backgroundImage: 'linear-gradient(to right, #a259ff, #d966ff)' };
                if (activeMode === 'retention') return { backgroundImage: 'linear-gradient(to right, #ff6b6b, #ff9a3c)' };
                if (activeMode === 'creator') return { backgroundImage: 'linear-gradient(to right, #38d9f5, #4f8eff)' };
                const mc = getConfigByMode(activeMode || '');
                if (mc) return { backgroundImage: `linear-gradient(to right, ${mc.colorFrom}, ${mc.colorTo})` };
                return { backgroundImage: 'linear-gradient(to right, #8c52ff, #b616d6)' };
              })()}
            >
              {(isSubmitting || isAutoProcessing) && !resolvedResultUrl ? (
                <div className="flex items-center justify-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline">Processing...</span></div>
              ) : (() => {
                if (activeMode === 'aiclip') return <div className="flex items-center justify-center gap-1.5"><Scissors className="w-3.5 h-3.5" /><span>AI Clip</span></div>;
                if (activeMode === 'retention') return <div className="flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /><span>Retention Edit</span></div>;
                if (activeMode === 'creator') return <div className="flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /><span>AI Creator</span></div>;
                const mc = getConfigByMode(activeMode || '');
                if (mc) { const IconComp = mc.icon; return <div className="flex items-center justify-center gap-1.5"><IconComp className="w-3.5 h-3.5" /><span>{mc.label}</span></div>; }
                return <div className="flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /><span>Generate</span></div>;
              })()}
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SimplifiedDashboard;
