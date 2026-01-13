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
  Video,
  X,
  ZoomIn,
  AudioLines,
  Plus,
  ChevronDown,
  Timer,
  MessageCircleOff,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const HeroWithEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFrames, setSelectedFrames] = useState('first-last');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [selectedResolution, setSelectedResolution] = useState('1080P');
  const [selectedDuration, setSelectedDuration] = useState('15s');
  const [startTimestamp, setStartTimestamp] = useState('00:00');
  const [endTimestamp, setEndTimestamp] = useState('00:15');

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedVideos(prev => [...prev, ...newFiles]);
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
    
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Video created successfully!', { id: 'processing' });
    }, 2000);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <section className="relative min-h-0 md:min-h-[90vh] flex flex-col items-center justify-start md:justify-center px-3 md:px-4 pt-20 pb-4 md:py-16 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-600/20 rounded-full blur-[100px] md:blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-600/20 rounded-full blur-[100px] md:blur-[120px]" />
      
      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto w-full">
        {/* Hero Title */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-2 md:mb-3 leading-tight px-2">
          <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
            Create Stop Scrolling Content
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-xl text-gray-400 text-center mb-4 md:mb-6 px-4">
          Transform your raw footage into viral-worthy content with AI-powered editing
        </p>

        {/* Editing Feature Buttons - Scrollable on mobile */}
        <div className="w-full mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
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
        {/* Second row - Hidden on mobile for cleaner look */}
        <div className="hidden md:flex flex-wrap justify-center gap-2 mb-6 w-full max-w-4xl">
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

        {/* Prompt Box */}
        <div className="w-full max-w-4xl px-1 md:px-0">
          <div className="relative bg-gray-900/80 border border-gray-700/50 rounded-xl md:rounded-2xl p-3 md:p-5 backdrop-blur-sm">
            {/* Video Preview */}
            {uploadedVideos.length > 0 && (
              <div className="mb-3 md:mb-4">
                {uploadedVideos.map((file, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden bg-black aspect-video mb-2">
                    <video 
                      src={URL.createObjectURL(file)}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <button 
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Audio Files Tags */}
            {uploadedAudio.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
                {uploadedAudio.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-gray-800 rounded-lg text-xs md:text-sm"
                  >
                    <AudioLines className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
                    <span className="text-gray-300 max-w-[100px] md:max-w-[150px] truncate">{file.name}</span>
                    <button 
                      onClick={() => removeAudio(index)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
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
            />

            {/* Example Prompts - Scrollable on mobile */}
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 mt-2 mb-3 md:mb-4">
              <div className="flex md:flex-wrap gap-2 min-w-max md:min-w-0">
                {examplePrompts.slice(0, 3).map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 transition-all duration-200 whitespace-nowrap"
                  >
                    {example}
                  </button>
                ))}
                {/* Show remaining prompts on desktop only */}
                {examplePrompts.slice(3).map((example, index) => (
                  <button
                    key={index + 3}
                    onClick={() => handleExampleClick(example)}
                    className="hidden md:block px-3 py-1.5 rounded-full text-xs bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 transition-all duration-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Timestamp Selection - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-4 py-3 border-t border-gray-700/50">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Timeline:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Start</span>
                  <input
                    type="text"
                    value={startTimestamp}
                    onChange={(e) => setStartTimestamp(e.target.value)}
                    placeholder="00:00"
                    className="w-16 px-2 py-1 text-sm text-center bg-gray-800/80 border border-gray-700/50 rounded-md text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <span className="text-gray-500">—</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">End</span>
                  <input
                    type="text"
                    value={endTimestamp}
                    onChange={(e) => setEndTimestamp(e.target.value)}
                    placeholder="00:15"
                    className="w-16 px-2 py-1 text-sm text-center bg-gray-800/80 border border-gray-700/50 rounded-md text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pt-3 md:pt-4 border-t border-gray-700/50 gap-3 md:gap-0">
              <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
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
                  className="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-200 group flex-shrink-0"
                >
                  <div className="flex items-center gap-0.5">
                    <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 group-hover:text-white" />
                    <Video className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-white" />
                  </div>
                  <span className="text-[8px] md:text-[10px] text-gray-400 group-hover:text-white">Video</span>
                </button>

                {/* Audio Upload */}
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
                  className="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-200 group flex-shrink-0"
                >
                  <div className="flex items-center gap-0.5">
                    <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 group-hover:text-white" />
                    <AudioLines className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-white" />
                  </div>
                  <span className="text-[8px] md:text-[10px] text-gray-400 group-hover:text-white">Voice</span>
                </button>

                <div className="w-px h-8 md:h-10 bg-gray-700/50 mx-0.5 md:mx-1 flex-shrink-0" />

                {/* Aspect Ratio - Simplified for mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                      <div 
                        className="border border-gray-500 rounded-sm"
                        style={{ 
                          width: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.width || 16) * 0.7,
                          height: (aspectRatioOptions.find(a => a.value === selectedAspectRatio)?.height || 9) * 0.7
                        }}
                      />
                      <span className="hidden sm:inline">{selectedAspectRatio}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                    {aspectRatioOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSelectedAspectRatio(option.value)}
                        className={cn(
                          "flex items-center gap-3 cursor-pointer",
                          selectedAspectRatio === option.value && "bg-purple-500/20"
                        )}
                      >
                        <div 
                          className="border border-gray-400 rounded-sm"
                          style={{ width: option.width, height: option.height }}
                        />
                        <span className="text-gray-200">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Resolution - Hidden on small mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 transition-all text-xs md:text-sm text-gray-300 flex-shrink-0">
                      <span>{selectedResolution}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                    {resolutionOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSelectedResolution(option.value)}
                        className={cn(
                          "cursor-pointer",
                          selectedResolution === option.value && "bg-purple-500/20"
                        )}
                      >
                        <span className="text-gray-200">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Create Button - Full width on mobile */}
              <Button
                onClick={handleCreate}
                disabled={isProcessing}
                className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30 text-sm md:text-base"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Content
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroWithEditor;
