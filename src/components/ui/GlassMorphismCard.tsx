
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassMorphismCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  intensity?: 'low' | 'medium' | 'high';
}

const GlassMorphismCard = ({
  children,
  className,
  hoverEffect = 'lift',
  intensity = 'medium',
  ...props
}: GlassMorphismCardProps) => {
  const getOpacity = () => {
    switch (intensity) {
      case 'low':
        return 'bg-white/40';
      case 'high':
        return 'bg-white/80';
      case 'medium':
      default:
        return 'bg-white/60';
    }
  };

  const getShadow = () => {
    switch (intensity) {
      case 'low':
        return 'shadow-sm';
      case 'high':
        return 'shadow-lg';
      case 'medium':
      default:
        return 'shadow-md';
    }
  };

  const getHoverEffect = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover:-translate-y-1';
      case 'scale':
        return 'hover:scale-[1.02]';
      case 'glow':
        return 'hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]';
      case 'none':
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 backdrop-blur-xl transition-all duration-300',
        getOpacity(),
        getShadow(),
        getHoverEffect(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassMorphismCard;
