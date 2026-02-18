import React from 'react';
import { Scissors, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiClipButtonProps {
  onClick?: () => void;
  className?: string;
}

const AiClipButton: React.FC<AiClipButtonProps> = ({ onClick, className }) => {
  return (
    <div className={cn("flex items-center gap-2 mb-3", className)}>
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8c52ff]/20 to-[#b616d6]/20 border border-[#8c52ff]/40 hover:border-[#8c52ff]/70 hover:from-[#8c52ff]/30 hover:to-[#b616d6]/30 transition-all duration-200 group"
      >
        <div className="relative flex items-center">
          <Scissors className="w-4 h-4 text-[#b616d6] group-hover:text-white transition-colors" />
          <Sparkles className="w-2.5 h-2.5 text-[#8c52ff] absolute -top-1 -right-1 group-hover:text-white transition-colors" />
        </div>
        <span className="text-sm font-semibold bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all">
          AI Clip
        </span>
        <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors hidden sm:inline">
          — Auto-clip highlights from your video
        </span>
      </button>
    </div>
  );
};

export default AiClipButton;
