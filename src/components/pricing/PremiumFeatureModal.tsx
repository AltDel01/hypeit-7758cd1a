
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

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
      <DialogContent className="bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Upgrade to Access {feature}</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            Choose a plan to unlock all premium features
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {/* Free Plan */}
            <div className="p-4 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Free Plan</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 1 branding image per day</li>
                <li>• 3 branding images per month</li>
                <li>• 10 text content per month</li>
                <li>• Free 1 page generated moodboard</li>
                <li>• Access to consult with Ava</li>
              </ul>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                disabled
              >
                Current Plan
              </Button>
            </div>

            {/* Starter Plan */}
            <div className="p-4 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Starter Plan</h3>
              <div className="text-sm text-purple-400 mb-2">US$ 15 Per Month</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 15 branding images per month</li>
                <li>• 25 text content per month</li>
                <li>• Free Generated Logo</li>
                <li>• Free Color Psychology</li>
                <li>• 15 pages of full package brand identity per month</li>
                <li>• Access to consult with Ava</li>
              </ul>
              <Button 
                className="w-full mt-4 bg-[#8c52ff] hover:bg-[#7a45e6]"
                onClick={() => navigate('/pricing')}
              >
                Upgrade to Starter
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="p-4 border border-purple-500/20 rounded-lg bg-purple-500/5">
              <div className="absolute -top-3 right-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro Plan</h3>
              <div className="text-sm text-purple-400 mb-2">US$ 25 Per Month</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 25 branding images per month</li>
                <li>• 40 text content per month</li>
                <li>• Free Generated Logo</li>
                <li>• Free Color Psychology</li>
                <li>• 15 pages of full package brand identity per month</li>
                <li>• Full package of virality strategy</li>
                <li>• Social media analytics</li>
                <li>• Access to consult with Ava</li>
              </ul>
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-[#8c52ff] to-[#5ce1e6] hover:from-[#7a45e6] hover:to-[#4cbec3]"
                onClick={() => navigate('/pricing')}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeatureModal;
