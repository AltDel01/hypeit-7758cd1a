
import React from 'react';
import { cn } from '@/lib/utils';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';

export interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  upgradeBadge?: boolean;
}

const ActionCard = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  upgradeBadge = false
}: ActionCardProps) => {
  return (
    <GlassMorphismCard 
      className={cn(
        "p-4 hover:cursor-pointer transition-all duration-300 bg-gray-900/50 border-gray-700",
        disabled ? "opacity-80" : "hover:-translate-y-1"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start">
        <div className="flex items-center justify-center rounded-md p-2 mr-3 bg-gray-800">
          {icon}
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-white">{title}</h3>
            {upgradeBadge && (
              <span className="ml-2 text-xs bg-[#8c52ff]/10 text-[#8c52ff] px-2 py-0.5 rounded-full">
                Pro
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </GlassMorphismCard>
  );
};

export default ActionCard;
