import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Scissors, 
  Captions, 
  Film, 
  Layers, 
  Wand2, 
  Image,
  Upload,
  Video,
  X,
  ZoomIn,
  ArrowLeft,
  Download,
  Share2,
  AudioLines,
  Plus,
  ChevronDown,
  Square,
  Clock,
  Timer,
  Ban,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import demoVideo from '@/assets/jake-paul-demo.mp4';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Selection options
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
  { id: 'censor-word', label: 'Censor Word', icon: Ban, description: 'Automatically bleep or mute profanity' },
  { id: 'language-dubbing', label: 'Language Dubbing', icon: Languages, description: 'Translate and dub audio in other languages' },
];

const examplePrompts = [
  'Add captions with trending font style',
  'Create smooth transitions between scenes',
  'Enhance colors and add cinematic look',
  'Add upbeat background music',
  'Generate viral short from this video',
  'Add zoom effects on key moments',
];

const AIEditorPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string | null>(null);
  const [videoOrientation, setVideoOrientation] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [videosReady, setVideosReady] = useState({ original: false, result: false });
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const resultVideoRef = useRef<HTMLVideoElement>(null);
  
  // Selection states
  const [selectedFrames, setSelectedFrames] = useState('first-last');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('4:3');
  const [selectedResolution, setSelectedResolution] = useState('720P');
  const [selectedDuration, setSelectedDuration] = useState('5s');
  const [startTimestamp, setStartTimestamp] = useState('00:00');
  const [endTimestamp, setEndTimestamp] = useState('00:05');

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
    const feature = editingFeatures.find(f => f.id === featureId);
    if (feature) {
      const isSelected = !selectedFeatures.includes(featureId);
      toast.info(`${feature.label} ${isSelected ? 'added' : 'removed'}`, {
        description: feature.description
      });
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedVideos(prev => [...prev, ...newFiles]);
      
      // Store the first video URL for before/after comparison
      if (newFiles.length > 0) {
        const url = URL.createObjectURL(newFiles[0]);
        setOriginalVideoUrl(url);
        
        // Detect video orientation
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
          const { videoWidth, videoHeight } = video;
          if (videoWidth > videoHeight) {
            setVideoOrientation('landscape');
          } else if (videoHeight > videoWidth) {
            setVideoOrientation('portrait');
          } else {
            setVideoOrientation('square');
          }
        };
      }
      
      toast.success(`${newFiles.length} video(s) added`);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedAudio(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} audio file(s) added`);
    }
  };

  const removeVideo = (index: number) => {
    setUploadedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = (index: number) => {
    setUploadedAudio(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!prompt.trim() && uploadedVideos.length === 0) {
      toast.error('Please enter a prompt or upload media');
      return;
    }
    
    setIsProcessing(true);
    toast.loading('Processing your video...', { id: 'processing' });
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsGenerated(true);
      toast.success('Video created successfully!', { id: 'processing' });
    }, 2000);
  };

  const handleBackToEditor = () => {
    setIsGenerated(false);
    setVideosReady({ original: false, result: false });
  };

  // Handle video ready state and sync playback - use onLoadedData instead to fire only once
  const handleVideoLoaded = (video: 'original' | 'result') => {
    setVideosReady(prev => {
      // Only process if this video wasn't already ready
      if (prev[video]) return prev;
      
      const newState = { ...prev, [video]: true };
      
      // If both videos are ready, play them together
      if (newState.original && newState.result) {
        setTimeout(() => {
          if (originalVideoRef.current && resultVideoRef.current) {
            originalVideoRef.current.currentTime = 0;
            resultVideoRef.current.currentTime = 0;
            originalVideoRef.current.play();
            resultVideoRef.current.play();
          }
        }, 100);
      }
      
      return newState;
    });
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  // Get aspect ratio class based on video orientation
  const getAspectRatioClass = () => {
    switch (videoOrientation) {
      case 'portrait':
        return 'aspect-[9/16]';
      case 'square':
        return 'aspect-square';
      case 'landscape':
      default:
        return 'aspect-video';
    }
  };

  // Get container layout based on orientation
  const getContainerClass = () => {
    if (videoOrientation === 'portrait') {
      return 'flex flex-row gap-4 justify-center';
    }
    return 'grid grid-cols-1 md:grid-cols-2 gap-4';
  };

  // Get video container width based on orientation
  const getVideoContainerClass = () => {
    if (videoOrientation === 'portrait') {
      return 'w-full max-w-[280px]';
    }
    return 'w-full';
  };

  // Generated video result view
  if (isGenerated) {
    return (
      <div className="animate-fade-in space-y-6 px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToEditor}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Button>
          <h2 className="text-xl font-semibold text-foreground">Generated AI Video</h2>
        </div>
        
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-muted-foreground/20">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Video Comparison - Before & After */}
            <div className="flex-1">
              <div className={getContainerClass()}>
                {/* Original Video (Before) */}
                <div className={getVideoContainerClass()}>
                  <p className="text-sm text-muted-foreground mb-2 text-center font-medium">Original</p>
                  <div className={cn("relative rounded-lg overflow-hidden bg-black", getAspectRatioClass())}>
                    <video 
                      ref={originalVideoRef}
                      src={originalVideoUrl || demoVideo}
                      controls
                      muted
                      onLoadedData={() => handleVideoLoaded('original')}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* Result Video (After) */}
                <div className={getVideoContainerClass()}>
                  <p className="text-sm text-muted-foreground mb-2 text-center font-medium">AI Enhanced</p>
                  <div className={cn("relative rounded-lg overflow-hidden bg-black", getAspectRatioClass())}>
                    <video 
                      ref={resultVideoRef}
                      src={demoVideo}
                      controls
                      onLoadedData={() => handleVideoLoaded('result')}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions Sidebar */}
            <div className="lg:w-64 space-y-4">
              <h3 className="text-foreground font-medium">Export Options</h3>
              <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4" />
                Download Video
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <div className="pt-4 border-t border-muted-foreground/20">
                <p className="text-sm text-muted-foreground mb-2">Video Details</p>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">Format: MP4</p>
                  <p className="text-foreground">Orientation: {videoOrientation.charAt(0).toUpperCase() + videoOrientation.slice(1)}</p>
                  <p className="text-foreground">Features: {selectedFeatures.length > 0 ? selectedFeatures.map(id => editingFeatures.find(f => f.id === id)?.label).join(', ') : 'AI Edit'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Title */}
      <h1 className="relative z-10 inline-block text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 leading-tight py-1 px-4 bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent shadow-glow">
        Create Stop Scrolling Video
      </h1>

      {/* Editing Feature Buttons */}
      <div className="flex flex-col items-center gap-2 mb-6 max-w-4xl">
        {/* First row - 5 buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {editingFeatures.slice(0, 5).map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                selectedFeatures.includes(feature.id)
                  ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-[#b616d6]/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50"
              )}
            >
              <feature.icon className="w-4 h-4" />
              {feature.label}
            </button>
          ))}
        </div>
        {/* Second row - 4 buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {editingFeatures.slice(5).map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                selectedFeatures.includes(feature.id)
                  ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-[#b616d6]/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50"
              )}
            >
              <feature.icon className="w-4 h-4" />
              {feature.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Box */}
      <div className="w-full max-w-4xl">
        <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
          {/* Video Preview - Small thumbnails like multimodal LLMs */}
          {uploadedVideos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedVideos.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/50">
                    <video 
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="w-6 h-6 text-white/80" />
                    </div>
                  </div>
                  <button 
                    onClick={() => removeVideo(index)}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-slate-700 rounded-full text-white hover:bg-slate-600 transition-colors shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-20 truncate text-center">{file.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Audio Files Tags */}
          {uploadedAudio.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedAudio.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm"
                >
                  <AudioLines className="w-4 h-4 text-[#b616d6]" />
                  <span className="text-slate-300 max-w-[150px] truncate">{file.name}</span>
                  <button 
                    onClick={() => removeAudio(index)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want to edit your video, or what video you want to create..."
            className="min-h-[160px] bg-transparent border-none text-white placeholder:text-slate-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />

          {/* Example Prompts inside box */}
          <div className="flex flex-wrap gap-2 mb-4 mt-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 rounded-full text-sm bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50 transition-all duration-200"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Timestamp Selection */}
          <div className="flex items-center gap-4 py-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Timeline:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Start</span>
                <input
                  type="text"
                  value={startTimestamp}
                  onChange={(e) => setStartTimestamp(e.target.value)}
                  placeholder="00:00"
                  className="w-16 px-2 py-1 text-sm text-center bg-slate-800/80 border border-slate-700/50 rounded-md text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <span className="text-slate-500">to</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">End</span>
                <input
                  type="text"
                  value={endTimestamp}
                  onChange={(e) => setEndTimestamp(e.target.value)}
                  placeholder="00:05"
                  className="w-16 px-2 py-1 text-sm text-center bg-slate-800/80 border border-slate-700/50 rounded-md text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            {/* Upload Buttons and Selection Options */}
            <div className="flex items-center gap-3">
              {/* Video Upload */}
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600 transition-all duration-200 group"
              >
                <div className="flex items-center gap-0.5">
                  <Plus className="w-3 h-3 text-slate-400 group-hover:text-white" />
                  <Video className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-white">Video</span>
              </button>

              {/* Audio/Voice Upload */}
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioUpload}
                accept="audio/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => audioInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600 transition-all duration-200 group"
              >
                <div className="flex items-center gap-0.5">
                  <Plus className="w-3 h-3 text-slate-400 group-hover:text-white" />
                  <AudioLines className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-white">Voice</span>
              </button>

              {/* Divider */}
              <div className="w-px h-10 bg-slate-700/50 mx-1" />

              {/* Frames Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600 transition-all text-sm text-slate-300">
                    <Film className="w-4 h-4 text-slate-400" />
                    <span className="max-w-[120px] truncate">{frameOptions.find(f => f.value === selectedFrames)?.label}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-slate-800 border-slate-700">
                  {frameOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedFrames(option.value)}
                      className={cn(
                        "text-slate-300 hover:text-white focus:text-white",
                        selectedFrames === option.value && "bg-slate-700"
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Aspect Ratio Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600 transition-all text-sm text-slate-300">
                    <Square className="w-4 h-4 text-slate-400" />
                    <span>{selectedAspectRatio}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-slate-800 border-slate-700">
                  {aspectRatioOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedAspectRatio(option.value)}
                      className={cn(
                        "flex items-center gap-2 text-slate-300 hover:text-white focus:text-white",
                        selectedAspectRatio === option.value && "bg-slate-700"
                      )}
                    >
                      <div 
                        className={cn(
                          "border rounded-sm",
                          selectedAspectRatio === option.value 
                            ? "border-purple-400 bg-purple-900/30" 
                            : "border-slate-500"
                        )}
                        style={{ width: option.width, height: option.height }}
                      />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Resolution Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600 transition-all text-sm text-slate-300">
                    <span>{selectedResolution}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-slate-800 border-slate-700">
                  {resolutionOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedResolution(option.value)}
                      className={cn(
                        "text-slate-300 hover:text-white focus:text-white",
                        selectedResolution === option.value && "bg-slate-700"
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Duration Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600 transition-all text-sm text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{selectedDuration}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-slate-800 border-slate-700">
                  {durationOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedDuration(option.value)}
                      className={cn(
                        "text-slate-300 hover:text-white focus:text-white",
                        selectedDuration === option.value && "bg-slate-700"
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              disabled={isProcessing}
              className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow-lg shadow-[#b616d6]/30 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isProcessing ? 'Creating...' : 'Create Video'}
            </Button>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-slate-500 text-sm mt-4 text-center">
        Upload your media and describe your vision. Our AI handles the rest
      </p>
    </div>
  );
};

export default AIEditorPrompt;
