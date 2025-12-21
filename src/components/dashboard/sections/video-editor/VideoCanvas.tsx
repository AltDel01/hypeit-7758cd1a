import React from 'react';
import { Play, Pause, RotateCcw, Volume2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoCanvasProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({ isPlaying, onPlayPause, currentTime }) => {
  return (
    <div className="flex-1 min-h-0 rounded-xl border border-slate-700/50 bg-slate-950 overflow-hidden flex items-center justify-center relative">
      {/* Video Container - 9:16 Aspect Ratio */}
      <div className="relative h-full aspect-[9/16] max-w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden border border-slate-700/30 shadow-2xl">
        {/* Placeholder Video Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#b616d6]/20 border border-[#b616d6]/30 flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-[#b616d6]" />
            </div>
            <p className="text-slate-400 text-sm">Your video preview</p>
            <p className="text-slate-600 text-xs mt-1">9:16 Vertical Format</p>
          </div>
        </div>

        {/* Captions Preview */}
        <div className="absolute bottom-20 left-0 right-0 text-center px-4">
          <p className="text-white text-lg font-bold drop-shadow-lg">
            This is how your <span className="text-[#b616d6]">captions</span> will look
          </p>
        </div>

        {/* Playback Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress Bar */}
          <div className="mb-3">
            <Slider
              value={[currentTime]}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onPlayPause}
                className="h-8 w-8 p-0 hover:bg-white/10"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </Button>
              <span className="text-xs text-slate-400 ml-2">0:00 / 1:32</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/10"
              >
                <Volume2 className="w-4 h-4 text-white" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/10"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Neon Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[80%] bg-[#b616d6]/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
};

export default VideoCanvas;
