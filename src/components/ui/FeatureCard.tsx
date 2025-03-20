
import React from 'react';
import { cn } from '@/lib/utils';
import GlassMorphismCard from './GlassMorphismCard';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const FeatureCard = ({
  title,
  description,
  icon,
  className,
  iconClassName,
}: FeatureCardProps) => {
  return (
    <GlassMorphismCard 
      className={cn('p-6 h-full flex flex-col', className)}
      hoverEffect="lift"
    >
      <div className={cn(
        'flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-teal/20 mb-4',
        iconClassName
      )}>
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-brand-slate-600 text-sm leading-relaxed mt-auto">{description}</p>
    </GlassMorphismCard>
  );
};

export default FeatureCard;
