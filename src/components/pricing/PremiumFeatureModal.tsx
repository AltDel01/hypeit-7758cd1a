
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
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-6xl w-full max-h-[95vh] overflow-y-auto md:py-12 px-1 sm:px-8">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold text-white text-center mt-2">Want to fully experience your AI Social Media Specialist?</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 text-center">
            Choose the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:gap-8 py-3 md:py-8 md:overflow-visible overflow-x-auto snap-x no-scrollbar">
          {/* Free Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="rounded-lg bg-gray-800/60 p-3 mb-4">
              <div className="flex items-baseline gap-2"><span className="text-2xl font-bold text-white">500</span><span className="text-gray-300 text-xs">Credits per month</span></div>
              <p className="text-gray-400 text-xs mt-1"><span className="text-white font-semibold">3,300</span> images / <span className="text-white font-semibold">33 720p videos</span></p>
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Free</h3>
            <div className="text-2xl font-bold text-white mb-3">FREE</div>
            <p className="text-sm text-gray-400 mb-4">Perfect to try core features</p>
            <ul className="space-y-2 mb-4">
              {["Queue","Fast-track generation","720p Video Generation","Image upscaling","Video extension","Generated content is for commercial use"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" disabled>Current Plan</Button>
          </div>

          {/* Starter Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-purple-500/30 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">Most Popular</div>
            <div className="rounded-lg bg-gray-800/60 p-3 mb-4">
              <div className="flex items-baseline gap-2"><span className="text-brand-teal">👑</span><span className="text-2xl font-bold text-brand-teal">3,000</span><span className="text-gray-300 text-xs">Credits per month</span></div>
              <p className="text-gray-400 text-xs mt-1">As low as <span className="text-white font-semibold">$1.09</span> per 100 Credits</p>
              <p className="text-gray-400 text-xs mt-1"><span className="text-white font-semibold">15,000</span> images / <span className="text-white font-semibold">150 720p videos</span></p>
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Starter</h3>
            <div className="text-2xl font-bold text-white mb-3">$15<span className="text-lg text-gray-400">/month</span></div>
            <p className="text-sm text-gray-400 mb-4">For growing brands and businesses</p>
            <ul className="space-y-2 mb-4">
              {["Queue unlimited tasks","Fast-track generation","1080p Video Generation","Image upscaling","Video extension","Priority access to new features","Generated content is for commercial use"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-[#8c52ff] hover:bg-[#7a45e6] text-white" onClick={() => navigate('/pricing')}>Upgrade to Starter</Button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="rounded-lg bg-gray-800/60 p-3 mb-4">
              <div className="flex items-baseline gap-2"><span className="text-2xl font-bold text-white">8,000</span><span className="text-gray-300 text-xs">Credits per month</span></div>
              <p className="text-gray-400 text-xs mt-1">As low as <span className="text-white font-semibold">$1.01</span> per 100 Credits</p>
              <p className="text-gray-400 text-xs mt-1"><span className="text-white font-semibold">40,000</span> images / <span className="text-white font-semibold">400 720p videos</span></p>
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Pro</h3>
            <div className="text-2xl font-bold text-white mb-3">$25<span className="text-lg text-gray-400">/month</span></div>
            <p className="text-sm text-gray-400 mb-4">For businesses needing high conversion</p>
            <ul className="space-y-2 mb-4">
              {["Queue unlimited tasks","Fast-track generation","1080p Video Generation","Image upscaling","Video extension","Priority access to new features","Generated content is for commercial use"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#5ce1e6] hover:from-[#7a45e6] hover:to-[#4cbec3] text-white" onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
          </div>

          {/* Specialist Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-yellow-500/30 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold">Vibe Marketing</div>
            <div className="rounded-lg bg-gray-800/60 p-3 mb-4 mt-4 md:mt-0">
              <div className="flex items-baseline gap-2"><span className="text-amber-400">👑</span><span className="text-2xl font-bold text-amber-400">26,000</span><span className="text-gray-300 text-xs">Credits per month</span></div>
              <p className="text-gray-400 text-xs mt-1">As low as <span className="text-white font-semibold">$0.62</span> per 100 Credits</p>
              <p className="text-gray-400 text-xs mt-1"><span className="text-white font-semibold">130,000</span> images / <span className="text-white font-semibold">1,300 720p videos</span></p>
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Specialist</h3>
            <div className="text-2xl font-bold text-white mb-3">$125<span className="text-lg text-gray-400">/month</span></div>
            <p className="text-sm text-gray-400 mb-4">End-to-end AI social growth & analytics</p>
            <ul className="space-y-2 mb-4">
              {["Queue unlimited tasks","Fast-track generation","1080p Video Generation","Image upscaling","Video extension","Priority access to new features","Beta test invite (if applicable)","Generated content is for commercial use"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#FEF7CD] hover:from-[#7a45e6] hover:to-[#FFE29F] text-gray-900 font-bold" onClick={() => navigate('/pricing')}>Upgrade to Specialist</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeatureModal;
