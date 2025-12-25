import React, { useState, useRef } from 'react';
import { Sparkles, Youtube, Upload, Play, Clock, ChevronRight, Link2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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

const ViralClipsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState([0, 100]);
  const [selectedCaption, setSelectedCaption] = useState('default');
  const [selectedDuration, setSelectedDuration] = useState('auto');
  const [numberOfClips, setNumberOfClips] = useState(3);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionScrollRef = useRef<HTMLDivElement>(null);

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
      setProcessing(false);
    }, 3000);
  };

  const scrollCaptions = (direction: 'left' | 'right') => {
    if (captionScrollRef.current) {
      const scrollAmount = direction === 'right' ? 200 : -200;
      captionScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Generate mock timeline thumbnails
  const timelineThumbnails = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="space-y-8 pb-8">
      {/* Video Source Selection */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="upload" className="data-[state=active]:bg-[#b616d6]">
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-[#b616d6]">
            <Youtube className="w-4 h-4 mr-2" />
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
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 h-12"
              />
            </div>
            <Button 
              className="h-12 px-6 bg-[#b616d6] hover:bg-[#a014c0]"
              disabled={!youtubeUrl}
            >
              Load Video
            </Button>
          </div>
          
          {/* Placeholder for YouTube preview */}
          {youtubeUrl && (
            <div className="rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700/50">
              <div className="aspect-video bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Youtube className="w-16 h-16 text-red-500 mx-auto mb-3" />
                  <p className="text-slate-400">YouTube video will appear here</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Timeline Selection - Only show when video is loaded */}
      {(videoPreviewUrl || youtubeUrl) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Select the part you want to create shorts</h3>
            <span className="text-slate-400 text-sm">
              {Math.round(selectedRange[1] - selectedRange[0])} seconds selected
            </span>
          </div>
          
          {/* Timeline Thumbnails */}
          <div className="relative">
            <div className="flex gap-0.5 rounded-lg overflow-hidden border-2 border-[#b616d6]/50">
              {timelineThumbnails.map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 h-16 bg-slate-800 relative",
                    i >= (selectedRange[0] / 100) * 12 && i < (selectedRange[1] / 100) * 12 
                      ? "opacity-100" 
                      : "opacity-40"
                  )}
                >
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                </div>
              ))}
            </div>
            
            {/* Range Slider Overlay */}
            <div className="mt-3">
              <Slider
                value={selectedRange}
                onValueChange={setSelectedRange}
                min={0}
                max={100}
                step={1}
                className="w-full"
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
                defaultValue="00:00:00"
              />
              <span className="text-slate-500">to</span>
              <Input 
                placeholder="00:16:00" 
                className="w-24 bg-slate-800/50 border-slate-600 text-center text-sm h-9"
                defaultValue="00:16:00"
              />
            </div>
          </div>
        </div>
      )}

      {/* Caption Template Selection */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Select caption template</h3>
        <div className="relative">
          <div 
            ref={captionScrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {captionTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedCaption(template.id)}
                className={cn(
                  "shrink-0 w-28 h-20 rounded-lg bg-slate-900 border-2 transition-all flex items-center justify-center p-2 relative",
                  selectedCaption === template.id 
                    ? "border-[#b616d6] shadow-lg shadow-[#b616d6]/20" 
                    : "border-slate-700 hover:border-slate-600"
                )}
              >
                {selectedCaption === template.id && (
                  <div className="absolute top-1 right-1">
                    <Sparkles className="w-3 h-3 text-[#b616d6]" />
                  </div>
                )}
                <span className={cn("text-center text-xs leading-tight", template.style)}>
                  {template.name}
                </span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => scrollCaptions('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800/90 rounded-full flex items-center justify-center border border-slate-700 hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4 text-white" />
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
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Duration of shorts</h3>
        <div className="flex flex-wrap gap-3">
          {durationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedDuration(option.id)}
              className={cn(
                "px-5 py-3 rounded-lg border-2 transition-all flex items-center gap-2",
                selectedDuration === option.id 
                  ? "bg-slate-800 border-[#b616d6] text-white" 
                  : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
              )}
            >
              {option.icon && <option.icon className="w-4 h-4 text-[#b616d6]" />}
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {selectedDuration === 'auto' && (
          <p className="text-slate-400 text-sm">
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
