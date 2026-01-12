import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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
  isVibe?: boolean;
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
  isVibe = false,
  buttonText = "Mulai Sekarang",
  onButtonClick,
  className,
}: PricingCardProps) => {
  return (
    <div 
      className={cn(
        'relative p-6 md:p-8 flex flex-col h-full rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-sm',
        popular ? 'border-brand-blue/40' : '',
        isVibe ? 'border-amber-500/40' : '',
        className
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-brand-blue to-brand-teal text-white text-xs font-semibold py-1.5 px-4 rounded-full">
          Paling Populer
        </div>
      )}
      
      {isVibe && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-xs font-semibold py-1.5 px-4 rounded-full">
          Vibe Marketing
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline">
          <span className="text-3xl md:text-4xl font-bold text-white">{price}</span>
          {price !== 'Rp. 0' && <span className="text-gray-400 ml-1">/bln</span>}
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className={cn(
              "mr-3 flex-shrink-0 mt-0.5",
              feature.included 
                ? "text-brand-teal" 
                : "text-gray-600"
            )}>
              <Check size={16} className="flex-shrink-0" />
            </span>
            <span className={cn(
              "text-sm",
              feature.included ? "text-gray-300" : "text-gray-600 line-through"
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
            "w-full transition-all py-5",
            popular 
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 border-0" 
              : isVibe
                ? "bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500/10"
                : title === "Gratis"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border-0"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 border-0"
          )}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
