import React, { useState, useRef } from 'react';
import { Sparkles, Youtube, Upload, Play, Clock, ChevronRight, Link2, Wand2, ArrowLeft, Download, ChevronDown, ThumbsUp, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Import demo clips
import demoClip1 from '@/assets/viral-clips/clip-1.mp4';
import demoClip2 from '@/assets/viral-clips/clip-2.mp4';
import demoClip3 from '@/assets/viral-clips/clip-3.mp4';
import demoClip4 from '@/assets/viral-clips/clip-4.mp4';

const captionTemplates = [
  { id: 'default', name: 'Default', style: 'text-white font-medium' },
  { id: 'quick', name: 'THE QUICK', style: 'text-white font-bold uppercase tracking-wider' },
  { id: 'brown-fox', name: 'THE QUICK BROWN FOX', style: 'text-xs text-white/80 uppercase' },
  { id: 'gradient', name: 'The quick brown fox', style: 'text-white font-light italic' },
  { id: 'outline', name: 'THE QUICK BROWN FOX', style: 'text-xs text-white font-bold [text-shadow:2px_2px_0_#000]' },
  { id: 'brown', name: 'brown fox', style: 'text-orange-400 font-bold' },
  { id: 'brown-fox-2', name: 'BROWN FOX', style: 'text-white font-black uppercase' },
  { id: 'minimal', name: 'brown', style: 'text-white/70 font-light lowercase' },
  { id: 'fox', name: 'FOX', style: 'text-purple-400 font-black uppercase tracking-widest' },
];

const durationOptions = [
  { id: 'auto', label: 'AI Smart Clip', icon: Wand2, description: 'AI recommends viral clips' },
  { id: '60s', label: '<60s', icon: null, description: 'Short clips under 1 minute' },
  { id: '60-90s', label: '60s-90s', icon: null, description: 'Medium length clips' },
  { id: '90-3m', label: '90s-3m', icon: null, description: 'Longer form content' },
  { id: 'custom', label: 'Custom', icon: null, description: 'Set your own length' },
];

const badgeTypes = [
  { label: 'Well-structured', icon: Zap, color: 'bg-cyan-500' },
  { label: 'On topic', icon: ThumbsUp, color: 'bg-green-500' },
  { label: 'Engaging', icon: Users, color: 'bg-orange-500' },
];

// Demo video clips array
const demoClips = [demoClip1, demoClip2, demoClip3, demoClip4];

interface GeneratedClip {
  id: string;
  title: string;
  duration: string;
  startTime: string;
  endTime: string;
  badge: typeof badgeTypes[number];
  thumbnailColor: string;
  videoUrl: string;
}

// Helper to extract YouTube video ID from various URL formats
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Helper to format seconds to HH:MM:SS
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Helper to parse HH:MM:SS to seconds
const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

const ViralClipsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState([0, 100]);
  const [selectedCaption, setSelectedCaption] = useState('default');
  const [selectedDuration, setSelectedDuration] = useState('auto');
  const [numberOfClips, setNumberOfClips] = useState(4);
  const [processing, setProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [videoDuration, setVideoDuration] = useState(600); // Default 10 minutes in seconds
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:10:00');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionScrollRef = useRef<HTMLDivElement>(null);

  // Handle YouTube URL change and extract video ID
  const handleYoutubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    const videoId = extractYouTubeVideoId(url);
    setYoutubeVideoId(videoId);
    if (videoId) {
      // Reset to full duration when new video is loaded
      setSelectedRange([0, 100]);
      setStartTime('00:00:00');
      setEndTime(formatTime(videoDuration));
    }
  };

  // Update timestamps when range slider changes
  const handleRangeChange = (newRange: number[]) => {
    setSelectedRange(newRange);
    const newStartTime = (newRange[0] / 100) * videoDuration;
    const newEndTime = (newRange[1] / 100) * videoDuration;
    setStartTime(formatTime(newStartTime));
    setEndTime(formatTime(newEndTime));
  };

  // Update range slider when timestamps change
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    const seconds = parseTime(value);
    const percentage = (seconds / videoDuration) * 100;
    if (percentage >= 0 && percentage < selectedRange[1]) {
      setSelectedRange([percentage, selectedRange[1]]);
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    const seconds = parseTime(value);
    const percentage = (seconds / videoDuration) * 100;
    if (percentage > selectedRange[0] && percentage <= 100) {
      setSelectedRange([selectedRange[0], percentage]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const handleGetShorts = () => {
    setProcessing(true);
    setTimeout(() => {
      // Generate clips using demo videos
      const clips: GeneratedClip[] = Array.from({ length: numberOfClips }, (_, i) => ({
        id: `clip-${i + 1}`,
        title: [
          "Breaking the Box: Jake Paul Defies Labels and Dominates Multiple Worlds!",
          "Jake Paul's Confidence vs Boxing Community Doubts: The Ultimate Underdog Story!",
          "Jake Paul's Pressure-Free Mindset: Why He's Fighting with No Fear!",
          "Jake Paul's Response to Critics: It's His Life, His Fight, His Legacy!",
        ][i % 4],
        duration: ['00:32', '00:28', '00:35', '00:30'][i % 4],
        startTime: `${String(Math.floor(i * 3)).padStart(2, '0')}:${String((i * 24) % 60).padStart(2, '0')}`,
        endTime: `${String(Math.floor(i * 3) + 3).padStart(2, '0')}:${String((i * 24 + 30) % 60).padStart(2, '0')}`,
        badge: badgeTypes[i % badgeTypes.length],
        thumbnailColor: ['from-slate-700 to-slate-800', 'from-slate-600 to-slate-700', 'from-slate-700 to-slate-900'][i % 3],
        videoUrl: demoClips[i % demoClips.length],
      }));
      setGeneratedClips(clips);
      setProcessing(false);
      setShowResults(true);
    }, 2000);
  };

  const handleBackToEditor = () => {
    setShowResults(false);
    setGeneratedClips([]);
  };

  const scrollCaptions = (direction: 'left' | 'right') => {
    if (captionScrollRef.current) {
      const scrollAmount = direction === 'right' ? 200 : -200;
      captionScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Generate mock timeline thumbnails
  const timelineThumbnails = Array.from({ length: 12 }, (_, i) => i);

  // Results View
  if (showResults) {
    return (
      <div className="space-y-4 md:space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={handleBackToEditor}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
            <h2 className="text-base md:text-lg text-white">
              <span className="text-cyan-400 font-semibold">{generatedClips.length} clips</span>
              {' '}created from your video
            </h2>
          </div>
          <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-sm">
            <span className="text-white font-medium">Recommended</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Clips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {generatedClips.map((clip) => (
            <div key={clip.id} className="group">
              {/* Video Player */}
              <div className="relative aspect-[9/16] rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 mb-2 md:mb-3">
                {/* Badge */}
                <div className={cn(
                  "absolute top-2 md:top-3 left-2 md:left-3 flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium text-white z-10",
                  clip.badge.color
                )}>
                  <clip.badge.icon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="hidden sm:inline">{clip.badge.label}</span>
                </div>

                {/* Download Button */}
                <button className="absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10">
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                </button>

                {/* Actual video player */}
                <video 
                  src={clip.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />

                {/* Duration badge */}
                <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-1.5 md:px-2 py-0.5 md:py-1 bg-black/70 rounded text-[10px] md:text-xs text-white font-medium z-10">
                  {clip.duration}
                </div>
              </div>

              {/* Clip Info */}
              <h3 className="text-white text-xs md:text-sm font-medium line-clamp-2 mb-1 md:mb-1.5">
                {clip.title}
              </h3>
              <div className="flex items-center gap-1 md:gap-1.5 text-slate-400 text-[10px] md:text-xs">
                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>{clip.startTime} - {clip.endTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Video Source Selection */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="upload" className="data-[state=active]:bg-[#b616d6] text-xs md:text-sm">
            <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            Upload Video
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-[#b616d6] text-xs md:text-sm">
            <Youtube className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            YouTube Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          {!videoPreviewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-[#b616d6]/50 transition-colors cursor-pointer bg-slate-900/30"
            >
              <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 font-medium">Drag & drop your video here</p>
              <p className="text-slate-500 text-sm mt-1">or click to browse files</p>
              <p className="text-slate-600 text-xs mt-3">Supports MP4, MOV, AVI, MKV</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700/50">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video 
                  src={videoPreviewUrl} 
                  className="max-h-full max-w-full"
                  controls={false}
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </button>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
        </TabsContent>

        <TabsContent value="youtube" className="mt-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Paste YouTube URL here..." 
                value={youtubeUrl}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 h-12"
              />
            </div>
          </div>
          
          {/* YouTube Video Embed */}
          {youtubeVideoId && (
            <div className="rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700/50">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
          
          {/* Invalid URL message */}
          {youtubeUrl && !youtubeVideoId && (
            <div className="rounded-xl overflow-hidden bg-slate-900/50 border border-red-500/30 p-6">
              <div className="text-center">
                <Youtube className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm">Please enter a valid YouTube URL</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Timeline Selection - Only show when video is loaded */}
      {(videoPreviewUrl || youtubeVideoId) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Select the part you want to create shorts</h3>
            <span className="text-slate-400 text-sm">
              {formatTime(((selectedRange[1] - selectedRange[0]) / 100) * videoDuration)} selected
            </span>
          </div>
          
          {/* Timeline Thumbnails */}
          <div className="relative">
            {/* Selection overlay */}
            <div 
              className="absolute top-0 bottom-0 border-2 border-[#b616d6] rounded-lg z-10 pointer-events-none"
              style={{
                left: `${selectedRange[0]}%`,
                width: `${selectedRange[1] - selectedRange[0]}%`,
              }}
            />
            
            <div className="flex gap-0.5 rounded-lg overflow-hidden bg-slate-900/50 border border-white/20">
              {timelineThumbnails.map((i) => {
                const thumbnailStart = (i / 12) * 100;
                const thumbnailEnd = ((i + 1) / 12) * 100;
                const isInRange = thumbnailEnd > selectedRange[0] && thumbnailStart < selectedRange[1];
                
                // YouTube provides thumbnails at different points: 0.jpg, 1.jpg, 2.jpg, 3.jpg
                const thumbnailIndex = i % 4;
                const thumbnailUrl = youtubeVideoId 
                  ? `https://img.youtube.com/vi/${youtubeVideoId}/${thumbnailIndex}.jpg`
                  : null;
                
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      const clickPosition = (i / 12) * 100;
                      if (clickPosition < selectedRange[1]) {
                        handleRangeChange([clickPosition, selectedRange[1]]);
                      }
                    }}
                    className={cn(
                      "flex-1 h-16 bg-slate-800 relative cursor-pointer transition-opacity overflow-hidden",
                      isInRange ? "opacity-100" : "opacity-40"
                    )}
                  >
                    {thumbnailUrl ? (
                      <img 
                        src={thumbnailUrl} 
                        alt={`Frame ${i}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Range Slider */}
            <div className="mt-3">
              <Slider
                value={selectedRange}
                onValueChange={handleRangeChange}
                min={0}
                max={100}
                step={0.5}
                className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-400 [&_.bg-primary]:bg-cyan-500"
              />
            </div>
          </div>

          {/* Clip Timestamp Input */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Clip Timestamp:</span>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="00:00:00" 
                className="w-24 bg-slate-800/50 border-slate-600 text-center text-sm h-9"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
              />
              <span className="text-slate-500">to</span>
              <Input 
                placeholder="00:10:00" 
                className="w-24 bg-slate-800/50 border-slate-600 text-center text-sm h-9"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Caption Template Selection */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-white font-semibold text-sm md:text-base">Select caption template</h3>
        <div className="relative">
          <div 
            ref={captionScrollRef}
            className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {captionTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedCaption(template.id)}
                className={cn(
                  "shrink-0 w-20 h-14 md:w-28 md:h-20 rounded-lg bg-slate-900 border-2 transition-all flex items-center justify-center p-1.5 md:p-2 relative",
                  selectedCaption === template.id 
                    ? "border-[#b616d6] shadow-lg shadow-[#b616d6]/20" 
                    : "border-slate-700 hover:border-slate-600"
                )}
              >
                {selectedCaption === template.id && (
                  <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1">
                    <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#b616d6]" />
                  </div>
                )}
                <span className={cn("text-center text-[10px] md:text-xs leading-tight line-clamp-2", template.style)}>
                  {template.name}
                </span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => scrollCaptions('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-slate-800/90 rounded-full flex items-center justify-center border border-slate-700 hover:bg-slate-700"
          >
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Number of Clips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">How many videos</h3>
          <span className="text-[#b616d6] font-semibold">{numberOfClips} clips</span>
        </div>
        <Slider
          value={[numberOfClips]}
          onValueChange={(val) => setNumberOfClips(val[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>1 clip</span>
          <span>10 clips</span>
        </div>
      </div>

      {/* Duration of Shorts */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-white font-semibold text-sm md:text-base">Duration of shorts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3">
          {durationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedDuration(option.id)}
              className={cn(
                "px-3 md:px-5 py-2 md:py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 md:gap-2",
                selectedDuration === option.id 
                  ? "bg-slate-800 border-[#b616d6] text-white" 
                  : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
              )}
            >
              {option.icon && <option.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#b616d6]" />}
              <span className="font-medium text-xs md:text-sm">{option.label}</span>
            </button>
          ))}
        </div>
        {selectedDuration === 'auto' && (
          <p className="text-slate-400 text-xs md:text-sm">
            Our AI model will determine the optimal number and duration of the shorts for maximum viral potential.
          </p>
        )}
      </div>

      {/* Get Clip Button */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={handleGetShorts}
          disabled={processing || (!videoPreviewUrl && !youtubeUrl)}
          className="h-14 px-20 bg-gradient-to-r from-cyan-500 to-[#b616d6] hover:opacity-90 text-white font-semibold text-lg"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Get Clip
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ViralClipsDashboard;
