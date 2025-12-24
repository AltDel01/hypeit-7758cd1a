import React, { useState, useRef } from 'react';
import { Sparkles, Youtube, Upload, TrendingUp, Play, Clock, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ViralRecommendation {
  id: string;
  timestamp: string;
  title: string;
  reason: string;
  viralScore: number;
  metrics: {
    views: string;
    likes: string;
    comments: string;
  };
}

const mockRecommendations: ViralRecommendation[] = [
  {
    id: '1',
    timestamp: '0:00 - 0:15',
    title: 'Opening Hook',
    reason: 'High viewer retention at start, engaging first 15 seconds',
    viralScore: 92,
    metrics: { views: '2.4M', likes: '156K', comments: '8.2K' }
  },
  {
    id: '2',
    timestamp: '1:23 - 1:55',
    title: 'Key Moment',
    reason: 'Peak engagement spike, most replayed section',
    viralScore: 88,
    metrics: { views: '1.8M', likes: '98K', comments: '5.1K' }
  },
  {
    id: '3',
    timestamp: '3:45 - 4:15',
    title: 'Trending Topic',
    reason: 'Content matches current trending topics',
    viralScore: 85,
    metrics: { views: '1.2M', likes: '72K', comments: '3.8K' }
  },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const ViralClipsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [timestampFrom, setTimestampFrom] = useState('00:00');
  const [timestampTo, setTimestampTo] = useState('00:00');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideo(file);
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowRecommendations(true);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6">
      {/* LEFT - Input Section */}
      <div className="w-[450px] shrink-0 space-y-6">
        {/* Tabs for Upload/YouTube */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            {/* Upload Video Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-[#b616d6]/50 transition-colors cursor-pointer bg-slate-900/50"
            >
              {uploadedVideo ? (
                <div>
                  <Play className="w-12 h-12 text-[#b616d6] mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">{uploadedVideo.name}</p>
                  <p className="text-slate-500 text-xs mt-1">Click to change</p>
                </div>
              ) : (
                <>
                  <Play className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Drag & drop your video here</p>
                  <p className="text-slate-500 text-xs mt-1">or click to browse</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>

            {/* Timestamp Range */}
            <div className="space-y-3">
              <label className="text-sm text-slate-400">Clip Timestamp</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="00:00" 
                    value={timestampFrom}
                    onChange={(e) => setTimestampFrom(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-center"
                  />
                </div>
                <span className="text-slate-500">to</span>
                <div className="flex-1">
                  <Input 
                    placeholder="00:00"
                    value={timestampTo}
                    onChange={(e) => setTimestampTo(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={analyzing || !uploadedVideo}
              className="w-full bg-gradient-to-r from-[#8c52ff] to-[#b616d6]"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Viral Recommendations
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="youtube" className="mt-4 space-y-4">
            {/* YouTube URL Input */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">YouTube Video URL</label>
              <Input 
                placeholder="https://youtube.com/watch?v=..." 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="bg-slate-800/50 border-slate-600"
              />
            </div>

            {/* Timestamp Range */}
            <div className="space-y-3">
              <label className="text-sm text-slate-400">Clip Timestamp</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="00:00" 
                    value={timestampFrom}
                    onChange={(e) => setTimestampFrom(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-center"
                  />
                </div>
                <span className="text-slate-500">to</span>
                <div className="flex-1">
                  <Input 
                    placeholder="00:00"
                    value={timestampTo}
                    onChange={(e) => setTimestampTo(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={analyzing || !youtubeUrl}
              className="w-full bg-gradient-to-r from-[#8c52ff] to-[#b616d6]"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing YouTube Video...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze & Get Recommendations
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT - Viral Recommendations */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#b616d6]" />
          <h2 className="text-lg font-semibold text-white">Viral Recommendations</h2>
        </div>

        {showRecommendations ? (
          <div className="space-y-4">
            {mockRecommendations.map((rec) => (
              <div 
                key={rec.id}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:border-[#b616d6]/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{rec.timestamp}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold px-3 py-1 rounded-full border",
                    getScoreColor(rec.viralScore)
                  )}>
                    {rec.viralScore}/100
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-3">{rec.reason}</p>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{rec.metrics.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{rec.metrics.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{rec.metrics.comments}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button size="sm" className="w-full mt-4 bg-gradient-to-r from-[#8c52ff] to-[#b616d6]">
                  <Play className="w-3 h-3 mr-1" />
                  Extract This Clip
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[400px] rounded-xl border border-slate-700/50 bg-slate-900/50 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Upload a video or paste a YouTube link</p>
              <p className="text-slate-500 text-sm mt-1">to get viral clip recommendations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViralClipsDashboard;
