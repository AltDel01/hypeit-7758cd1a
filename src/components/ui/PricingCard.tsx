
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import GlassMorphismCard from './GlassMorphismCard';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

const PricingCard = ({
  title,
  price,
  description,
  features,
  popular = false,
  buttonText = "Mulai Sekarang",
  onButtonClick,
  className,
}: PricingCardProps) => {
  return (
    <GlassMorphismCard 
      className={cn(
        'relative p-8 flex flex-col h-full',
        popular ? 'border-brand-blue/30 ring-1 ring-brand-blue/20' : '',
        className
      )}
      hoverEffect={popular ? 'glow' : 'lift'}
      intensity={popular ? 'high' : 'medium'}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-brand-blue to-brand-teal text-white text-xs font-semibold py-1 px-4 rounded-full">
          Paling Populer
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-brand-slate-600 text-sm">{description}</p>
      </div>
      
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        {price !== 'Rp. 0' && !price.includes('Rp.') && <span className="text-brand-slate-500">/bulan</span>}
        {price.includes('Rp.') && price !== 'Rp. 0' && <span className="text-brand-slate-500">/bulan</span>}
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className={cn(
              "mr-2 flex-shrink-0 rounded-full p-1",
              feature.included 
                ? "text-brand-teal bg-brand-teal/10" 
                : "text-brand-slate-300 bg-brand-slate-100"
            )}>
              <Check size={14} className="flex-shrink-0" />
            </span>
            <span className={cn(
              "text-sm",
              feature.included ? "text-brand-slate-700" : "text-brand-slate-400 line-through"
            )}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>
      
      <div className="mt-auto">
        <Button
          onClick={onButtonClick}
          className={cn(
            "w-full transition-all",
            popular 
              ? "bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:shadow-lg" 
              : "bg-white border border-brand-slate-200 text-brand-slate-800 hover:bg-brand-slate-50"
          )}
        >
          {buttonText}
        </Button>
      </div>
    </GlassMorphismCard>
  );
};

export default PricingCard;
