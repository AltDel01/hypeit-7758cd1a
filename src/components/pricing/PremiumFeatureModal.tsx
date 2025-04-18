
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">Want to Fully Experience your AI Social Media Specialist?</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 text-center">
            Select the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {/* Free Plan */}
          <div className="relative p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
            <div className="text-3xl font-bold text-white mb-4">$0</div>
            <p className="text-sm text-gray-400 mb-6">Perfect for trying out core features</p>
            
            <ul className="space-y-3 mb-8">
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
          <div className="relative p-6 rounded-xl border border-purple-500/30 bg-gray-900/50 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
            <div className="text-3xl font-bold text-white mb-4">$15<span className="text-lg text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-6">For growing brands and businesses</p>
            
            <ul className="space-y-3 mb-8">
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
          <div className="relative p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <div className="text-3xl font-bold text-white mb-4">$25<span className="text-lg text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-6">For Businesses that Need High Conversion</p>
            
            <ul className="space-y-3 mb-8">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeatureModal;

