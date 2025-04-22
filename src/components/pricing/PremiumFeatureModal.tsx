
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const PremiumFeatureModal: React.FC<PremiumFeatureModalProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Improved mobile spacing and sizing */}
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-5xl w-full max-h-[95vh] overflow-y-auto md:py-10 px-2 sm:px-4">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold text-white text-center mt-2">Want to Fully Experience your AI Social Media Specialist?</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 text-center">
            Select the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        {/* Scrolling flex on mobile, 4 grid on desktop */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:gap-6 py-3 md:py-6 md:overflow-visible overflow-x-auto snap-x no-scrollbar">
          {/* Free Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
            <div className="text-3xl font-bold text-white mb-4">$0</div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">Perfect for trying out core features</p>
            
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">1 branding image per day</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">3 branding images per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">10 text content per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Free 1 page generated moodboard</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Access to consult with Ava</span>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
              disabled
            >
              Current Plan
            </Button>
          </div>

          {/* Starter Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-purple-500/30 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
            <div className="text-3xl font-bold text-white mb-4">$15<span className="text-lg text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">For growing brands and businesses</p>
            
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">15 branding images per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">25 text content per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Free Generated Logo</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Free Color Psychology</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">15 pages of full package brand identity per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Access to consult with Ava</span>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
              onClick={() => navigate('/pricing')}
            >
              Upgrade to Starter
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <div className="text-3xl font-bold text-white mb-4">$25<span className="text-lg text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">For Businesses that Need High Conversion</p>
            
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">25 branding images per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">40 text content per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Free Generated Logo</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Free Color Psychology</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">15 pages of full package brand identity per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Full package of virality strategy</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Social media analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Access to consult with Ava</span>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-gradient-to-r from-[#8c52ff] to-[#5ce1e6] hover:from-[#7a45e6] hover:to-[#4cbec3] text-white"
              onClick={() => navigate('/pricing')}
            >
              Upgrade to Pro
            </Button>
          </div>

          {/* Specialist Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-yellow-500/30 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold">
              Specialist
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 pt-6 md:pt-0">Specialist</h3>
            <div className="text-3xl font-bold text-white mb-4">$125<span className="text-lg text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">AI-powered end-to-end social growth and analytics</p>
            
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">All Pro Benefits</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI Automated posting to social media</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI winning content analytics</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI influencer recommendation and analytics</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI contact, collect rate card, and generate brief with influencers automatically</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI social media Audit</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI competitor benchmarking</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI social media reporting</span></li>
              <li className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">AI social media trend analytics</span></li>
            </ul>
            
            <Button 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeatureModal;

