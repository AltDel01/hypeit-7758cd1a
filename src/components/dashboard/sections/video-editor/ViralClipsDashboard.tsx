import React, { useState } from 'react';
import { Sparkles, Youtube, Scissors, Zap, Play, Clock, TrendingUp, Upload, Link as LinkIcon, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ClipSegment {
  id: string;
  from: string;
  to: string;
  title: string;
  viralScore: number;
  viralSentences: string[];
}

const mockSegments: ClipSegment[] = [
  { 
    id: '1', 
    from: '0:00', 
    to: '0:15', 
    title: 'Opening Hook', 
    viralScore: 92,
    viralSentences: ['This changed everything I knew about...', 'You won\'t believe what happened next']
  },
  { 
    id: '2', 
    from: '1:23', 
    to: '1:55', 
    title: 'Key Statistics', 
    viralScore: 78,
    viralSentences: ['97% of people don\'t know this...']
  },
  { 
    id: '3', 
    from: '3:45', 
    to: '4:30', 
    title: 'Personal Story', 
    viralScore: 85,
    viralSentences: ['When I first started, I had nothing', 'This is the secret they don\'t tell you']
  },
];

const mockYouTubeData = {
  title: 'How I Made $1M in 30 Days',
  views: '2.4M',
  peakMoments: [
    { time: '0:32', retention: 95, label: 'Hook Peak' },
    { time: '2:15', retention: 88, label: 'Story Climax' },
    { time: '5:45', retention: 72, label: 'Tutorial Start' },
  ]
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const ViralClipsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [clipFrom, setClipFrom] = useState('');
  const [clipTo, setClipTo] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* LEFT - Input Section */}
      <div className="w-[400px] shrink-0 flex flex-col gap-4">
        {/* Source Tabs */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#b616d6]" />
            <h2 className="text-lg font-semibold text-white">Viral Clip Finder</h2>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="upload" className="data-[state=active]:bg-[#b616d6]">
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </TabsTrigger>
              <TabsTrigger value="youtube" className="data-[state=active]:bg-[#b616d6]">
                <Youtube className="w-4 h-4 mr-2" />
                YouTube Link
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-4 space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-[#b616d6]/50 transition-colors cursor-pointer">
                <FileVideo className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Drag & drop your video here</p>
                <p className="text-slate-500 text-xs mt-1">or click to browse</p>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm text-slate-400">Manual Clip Range</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">From</label>
                    <Input 
                      placeholder="0:00" 
                      value={clipFrom}
                      onChange={(e) => setClipFrom(e.target.value)}
                      className="bg-slate-800/50 border-slate-600"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">To</label>
                    <Input 
                      placeholder="0:30"
                      value={clipTo}
                      onChange={(e) => setClipTo(e.target.value)}
                      className="bg-slate-800/50 border-slate-600"
                    />
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#b616d6]">
                  <Scissors className="w-4 h-4 mr-2" />
                  Cut Clip
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="youtube" className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">YouTube Video URL</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-[#8c52ff] to-[#b616d6]"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Viewer Graph...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Viewer Graph
                  </>
                )}
              </Button>

              {/* YouTube Analysis Results */}
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Peak Retention Moments</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                
                {mockYouTubeData.peakMoments.map((peak, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-[#b616d6]/20 to-[#8c52ff]/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-[#b616d6]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{peak.label}</p>
                      <p className="text-xs text-slate-500">{peak.time}</p>
                    </div>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full border",
                      peak.retention >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    )}>
                      {peak.retention}% retention
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Detection Settings */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#b616d6]" />
            <h3 className="text-sm font-semibold text-white">AI Detection Settings</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Minimum Viral Score</span>
                <span>70/100</span>
              </div>
              <Slider defaultValue={[70]} max={100} step={5} className="[&>span:first-child]:bg-[#b616d6]" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Clip Length Range</span>
                <span>15s - 60s</span>
              </div>
              <Slider defaultValue={[15, 60]} max={120} step={5} className="[&>span:first-child]:bg-[#b616d6]" />
            </div>
          </div>
          
          <Button variant="outline" className="w-full border-[#b616d6]/50 text-[#b616d6] hover:bg-[#b616d6]/10">
            <Sparkles className="w-4 h-4 mr-2" />
            Auto-Detect Viral Clips
          </Button>
        </div>
      </div>

      {/* CENTER - Detected Clips */}
      <div className="flex-1 min-w-0 rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#b616d6]" />
            <h2 className="text-lg font-semibold text-white">Detected Viral Segments</h2>
          </div>
          <span className="text-xs text-slate-400">{mockSegments.length} clips found</span>
        </div>
        
        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-4 space-y-4">
            {mockSegments.map((segment) => (
              <div 
                key={segment.id}
                onClick={() => setSelectedSegment(segment.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer",
                  selectedSegment === segment.id 
                    ? "border-[#b616d6]/50 bg-[#b616d6]/10" 
                    : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{segment.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{segment.from} - {segment.to}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold px-3 py-1 rounded-full border",
                    getScoreColor(segment.viralScore)
                  )}>
                    {segment.viralScore}/100
                  </span>
                </div>

                {/* Viral Sentences */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Viral Sentences Detected
                  </p>
                  {segment.viralSentences.map((sentence, i) => (
                    <div key={i} className="text-sm text-slate-300 bg-slate-800/50 rounded-lg px-3 py-2 border-l-2 border-amber-500/50">
                      "{sentence}"
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 hover:bg-slate-700">
                    <Play className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-[#8c52ff] to-[#b616d6]">
                    <Scissors className="w-3 h-3 mr-1" />
                    Extract Clip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT - Preview Panel */}
      <div className="w-[300px] shrink-0 flex flex-col gap-4">
        {/* Video Preview */}
        <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-white">Clip Preview</h3>
          </div>
          <div className="p-4">
            <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700/30">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#b616d6]/20 flex items-center justify-center mx-auto mb-3">
                  <Play className="w-8 h-8 text-[#b616d6]" />
                </div>
                <p className="text-slate-400 text-sm">Select a clip to preview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">Quick Export</h3>
          <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#b616d6]">
            Export All Clips
          </Button>
          <Button variant="outline" className="w-full border-slate-600">
            Send to Video Editor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViralClipsDashboard;
