import React from 'react';
import { Type, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockTimelineProps {
  isTextEditMode: boolean;
  onToggleTextEdit: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
}

interface TimelineBlock {
  id: string;
  type: 'hook' | 'body' | 'cta';
  label: string;
  start: number;
  width: number;
}

interface SilenceMarker {
  position: number;
}

const blocks: TimelineBlock[] = [
  { id: 'b1', type: 'hook', label: 'Hook', start: 0, width: 15 },
  { id: 'b2', type: 'body', label: 'Body', start: 15, width: 25 },
  { id: 'b3', type: 'body', label: 'Body', start: 42, width: 30 },
  { id: 'b4', type: 'cta', label: 'CTA', start: 85, width: 15 },
];

const silenceMarkers: SilenceMarker[] = [
  { position: 40 },
  { position: 72 },
];

const getBlockStyle = (type: TimelineBlock['type']) => {
  switch (type) {
    case 'hook':
      return 'bg-amber-500/80 border-amber-400 shadow-amber-500/20';
    case 'body':
      return 'bg-blue-500/80 border-blue-400 shadow-blue-500/20';
    case 'cta':
      return 'bg-emerald-500/80 border-emerald-400 shadow-emerald-500/20';
  }
};

const BlockTimeline: React.FC<BlockTimelineProps> = ({
  isTextEditMode,
  onToggleTextEdit,
  currentTime,
  onSeek,
}) => {
  return (
    <div className="h-[140px] rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Magic Timeline</h3>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-800">
              <ZoomOut className="w-3 h-3 text-slate-400" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-800">
              <ZoomIn className="w-3 h-3 text-slate-400" />
            </Button>
          </div>
        </div>
        
        <Button
          size="sm"
          variant={isTextEditMode ? 'default' : 'outline'}
          onClick={onToggleTextEdit}
          className={cn(
            "h-7 text-xs gap-1.5",
            isTextEditMode 
              ? "bg-[#b616d6] hover:bg-[#a012c0] text-white" 
              : "border-slate-600 hover:bg-slate-800 hover:border-[#b616d6]"
          )}
        >
          <Type className="w-3 h-3" />
          Edit Text
        </Button>
      </div>

      {/* Timeline Track */}
      <div className="p-4 h-[calc(100%-44px)]">
        {/* Time Ruler */}
        <div className="flex justify-between text-[10px] text-slate-500 mb-2 px-1">
          <span>0:00</span>
          <span>0:30</span>
          <span>1:00</span>
          <span>1:30</span>
        </div>

        {/* Blocks Track */}
        <div className="relative h-12 bg-slate-800/50 rounded-lg border border-slate-700/30 overflow-hidden">
          {/* Blocks */}
          {blocks.map((block) => (
            <div
              key={block.id}
              className={cn(
                "absolute top-1 bottom-1 rounded-md border cursor-pointer transition-all duration-200 hover:scale-y-105 shadow-lg",
                getBlockStyle(block.type)
              )}
              style={{
                left: `${block.start}%`,
                width: `${block.width}%`,
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow">
                {block.label}
              </span>
            </div>
          ))}

          {/* Silence Markers */}
          {silenceMarkers.map((marker, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${marker.position}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-20 transition-all duration-100"
            style={{ left: `${currentTime}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-sm rotate-45 shadow-lg" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-amber-500" />
            <span className="text-[10px] text-slate-400">Hook</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-blue-500" />
            <span className="text-[10px] text-slate-400">Body</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-emerald-500" />
            <span className="text-[10px] text-slate-400">CTA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-red-500" />
            <span className="text-[10px] text-slate-400">Silence Removed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockTimeline;
