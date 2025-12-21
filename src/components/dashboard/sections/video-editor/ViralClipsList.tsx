import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ViralClip {
  id: string;
  title: string;
  thumbnail: string;
  viralScore: number;
  duration: string;
}

interface ViralClipsListProps {
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
}

const mockClips: ViralClip[] = [
  { id: 'clip-1', title: 'Opening Hook - The Secret', thumbnail: '', viralScore: 92, duration: '0:15' },
  { id: 'clip-2', title: 'Key Point #1 - Statistics', thumbnail: '', viralScore: 78, duration: '0:32' },
  { id: 'clip-3', title: 'Story Segment - Personal', thumbnail: '', viralScore: 85, duration: '0:45' },
  { id: 'clip-4', title: 'Tutorial Step 2', thumbnail: '', viralScore: 45, duration: '1:02' },
  { id: 'clip-5', title: 'CTA - Subscribe Now', thumbnail: '', viralScore: 67, duration: '0:12' },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const ViralClipsList: React.FC<ViralClipsListProps> = ({ selectedClipId, onSelectClip }) => {
  return (
    <div className="flex-1 min-h-0 rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#b616d6]" />
        <h3 className="text-sm font-semibold text-white">Viral Clips</h3>
        <span className="ml-auto text-xs text-slate-400">{mockClips.length} clips</span>
      </div>

      {/* Clips List */}
      <ScrollArea className="h-[calc(100%-56px)]">
        <div className="p-2 space-y-2">
          {mockClips.map((clip) => (
            <div
              key={clip.id}
              onClick={() => onSelectClip(clip.id)}
              className={cn(
                "group flex gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-slate-800/60 border border-transparent",
                selectedClipId === clip.id && "bg-[#b616d6]/10 border-[#b616d6]/30"
              )}
            >
              {/* Thumbnail */}
              <div className="w-14 h-24 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-600/30">
                <div className="text-slate-500 text-xs">9:16</div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-slate-200 truncate">{clip.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{clip.duration}</p>
                </div>

                {/* Viral Score Badge */}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full border",
                    getScoreColor(clip.viralScore)
                  )}>
                    {clip.viralScore}/100
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ViralClipsList;
