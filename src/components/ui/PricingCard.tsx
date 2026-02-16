import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingFeature {
  name: string;
  included: boolean;
  bold?: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  credits: string;
  creditsPerPrice: string;
  mediaInfo: string;
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
  credits,
  creditsPerPrice,
  mediaInfo,
  description,
  features,
  popular = false,
  isVibe = false,
  buttonText = "Get Started",
  onButtonClick,
  className
}: PricingCardProps) => {
  return (
    <div
      className={cn(
        'relative p-6 md:p-8 flex flex-col h-full rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-sm',
        popular ? 'border-brand-blue/40' : '',
        isVibe ? 'border-amber-500/40' : '',
        className
      )}>

      {popular &&
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-brand-blue to-brand-teal text-white text-xs font-semibold py-1.5 px-4 rounded-full">
          Most Popular
        </div>
      }
      
      {isVibe &&
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-xs font-semibold py-1.5 px-4 rounded-full">
          Vibe Marketing
        </div>
      }

      {/* Credits highlight box */}
      <div className="rounded-xl border border-white/10 bg-gray-800/60 p-4 mb-6">
        <div className="flex items-baseline gap-2">
          {isVibe && <span className="text-amber-400 text-3xl md:text-4xl">👑</span>}
          {popular && <span className="text-brand-teal text-3xl md:text-4xl">👑</span>}
          <span className={cn(
            "text-3xl md:text-4xl font-bold",
            isVibe ? "text-amber-400" : popular ? "text-brand-teal" : "text-white"
          )}>
            {credits}
          </span>
        </div>
        <p className="text-gray-300 text-sm mt-1">Credits per month</p>
        {creditsPerPrice &&
        <p className="text-gray-400 text-xs mt-1">
            As low as <span className="text-white font-semibold">{creditsPerPrice.match(/\$[\d.]+/)?.[0]}</span> per 100 Credits
          </p>
        }
        {mediaInfo &&
        <p className="text-gray-400 text-xs mt-1">
            <span className="text-white font-semibold">{mediaInfo}</span>
          </p>
        }
      </div>

      <div className="mb-4">
        
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-white">{price}</span>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) =>
        <li key={index} className="flex items-start">
            <span className={cn(
            "mr-3 flex-shrink-0 mt-0.5",
            feature.included ?
            "text-brand-teal" :
            "text-gray-600"
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
        )}
      </ul>
      
      <div className="mt-auto">
        {(title === "Starter" || isVibe) ? (
          <div className={cn(
            "rounded-lg p-[2px]",
            title === "Starter"
              ? "bg-gradient-to-r from-blue-500 to-cyan-400"
              : "bg-gradient-to-r from-purple-500 to-amber-400"
          )}>
            <Button
              onClick={onButtonClick}
              className="w-full transition-all py-5 rounded-[6px] bg-gray-900 text-white hover:bg-gray-800 border-0"
            >
              {buttonText}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onButtonClick}
            className={cn(
              "w-full transition-all py-5 rounded-lg",
              title === "Free" || title === "Gratis"
                ? "bg-white/10 text-white/70 hover:bg-white/15 border border-white/20"
                : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 border-0"
            )}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>);

};

export default PricingCard;