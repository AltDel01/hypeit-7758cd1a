import React from 'react';
import { Upload, Film, Music, Image, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface Asset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration?: string;
}

const mockAssets: Asset[] = [
  { id: 'a1', name: 'raw_footage.mp4', type: 'video', duration: '5:32' },
  { id: 'a2', name: 'podcast_audio.mp3', type: 'audio', duration: '12:45' },
  { id: 'a3', name: 'thumbnail.png', type: 'image' },
  { id: 'a4', name: 'b-roll_city.mp4', type: 'video', duration: '0:45' },
];

const getAssetIcon = (type: Asset['type']) => {
  switch (type) {
    case 'video': return Film;
    case 'audio': return Music;
    case 'image': return Image;
  }
};

const AssetsGrid: React.FC = () => {
  return (
    <div className="h-[200px] rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#b616d6]" />
          <h3 className="text-sm font-semibold text-white">Assets</h3>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 w-7 p-0 hover:bg-[#b616d6]/20"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Assets Grid */}
      <ScrollArea className="h-[calc(100%-48px)]">
        <div className="p-2 grid grid-cols-2 gap-2">
          {mockAssets.map((asset) => {
            const Icon = getAssetIcon(asset.type);
            return (
              <div
                key={asset.id}
                className="group p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 cursor-pointer hover:bg-slate-800 hover:border-[#b616d6]/30 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#b616d6] transition-colors" />
                  <span className="text-xs text-slate-500">{asset.type}</span>
                </div>
                <p className="text-xs text-slate-300 truncate">{asset.name}</p>
                {asset.duration && (
                  <p className="text-[10px] text-slate-500 mt-1">{asset.duration}</p>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AssetsGrid;
