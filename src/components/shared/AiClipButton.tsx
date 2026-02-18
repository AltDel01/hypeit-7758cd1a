import React from 'react';
import { Scissors, Sparkles, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiClipButtonProps {
  onAiClip?: () => void;
  onRetentionEditing?: () => void;
  onAiCreator?: () => void;
  className?: string;
}

const toolButtons = [
  {
    key: 'aiclip',
    label: 'AI Clip',
    description: 'Auto-clip highlights',
    icon: (
      <div className="relative flex items-center">
        <Scissors className="w-4 h-4 text-[#d966ff]" />
        <Sparkles className="w-2.5 h-2.5 text-[#a259ff] absolute -top-1 -right-1" />
      </div>
    ),
    gradient: 'from-[#a259ff] to-[#d966ff]',
    border: 'border-[#a259ff]/50 hover:border-[#d966ff]',
    bg: 'from-[#a259ff]/20 to-[#d966ff]/20 hover:from-[#a259ff]/35 hover:to-[#d966ff]/35',
  },
  {
    key: 'retention',
    label: 'Retention Editing',
    description: 'Boost watch time',
    icon: <TrendingUp className="w-4 h-4 text-[#ff6b6b]" />,
    gradient: 'from-[#ff6b6b] to-[#ff9a3c]',
    border: 'border-[#ff6b6b]/50 hover:border-[#ff9a3c]',
    bg: 'from-[#ff6b6b]/20 to-[#ff9a3c]/20 hover:from-[#ff6b6b]/35 hover:to-[#ff9a3c]/35',
  },
  {
    key: 'creator',
    label: 'AI Creator',
    description: 'Build personal brand or promote your product',
    icon: <User className="w-4 h-4 text-[#38d9f5]" />,
    gradient: 'from-[#38d9f5] to-[#4f8eff]',
    border: 'border-[#38d9f5]/50 hover:border-[#4f8eff]',
    bg: 'from-[#38d9f5]/20 to-[#4f8eff]/20 hover:from-[#38d9f5]/35 hover:to-[#4f8eff]/35',
  },
];

const AiClipButton: React.FC<AiClipButtonProps> = ({
  onAiClip,
  onRetentionEditing,
  onAiCreator,
  className,
}) => {
  const handlers = [onAiClip, onRetentionEditing, onAiCreator];

  return (
    <div className={cn("flex items-center justify-center gap-2 mb-3 overflow-x-auto scrollbar-hide", className)}>
      {toolButtons.map((btn, idx) => (
        <button
          key={btn.key}
          onClick={handlers[idx]}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r border transition-all duration-200 group",
            btn.bg,
            btn.border
          )}
        >
          {btn.icon}
          <span
            className={cn(
              "text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all group-hover:brightness-125",
              btn.gradient
            )}
          >
            {btn.label}
          </span>
          <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors hidden sm:inline">
            — {btn.description}
          </span>
        </button>
      ))}
    </div>
  );
};

export default AiClipButton;
