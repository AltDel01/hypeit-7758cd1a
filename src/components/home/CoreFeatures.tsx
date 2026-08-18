import React from 'react';
import { Sparkles, Clapperboard, Flame, CircleUserRound, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import aiVideoDemo from '@/assets/ai-video-editing-demo.mp4';
import aiAvatarsVideo from '@/assets/hero-video.mp4';
const features = [{
  id: 'ai-video-editor',
  key: 'editor',
  icon: Clapperboard,
  gradient: 'from-purple-500 to-pink-500',
  video: aiVideoDemo,
}, {
  id: 'viral-clips',
  key: 'clips',
  icon: Flame,
  gradient: 'from-blue-500 to-cyan-500',
  image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=500&fit=crop',
}, {
  id: 'ai-avatars',
  key: 'avatars',
  icon: CircleUserRound,
  gradient: 'from-amber-500 to-orange-500',
  video: aiAvatarsVideo,
}, {
  id: 'content-generation',
  key: 'product',
  icon: ShoppingBag,
  gradient: 'from-green-500 to-emerald-500',
  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop',
}];
const CoreFeatures: React.FC = () => {
  const { t } = useTranslation();
  return <section className="relative py-12 md:py-24 px-3 md:px-4 overflow-hidden bg-black">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 mb-3 md:mb-6">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400" />
            <span className="text-xs md:text-sm font-medium text-purple-300">{t('home.coreFeatures.badge')}</span>
          </div>
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4">
            {t('home.coreFeatures.headingPrefix')}{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">{t('home.coreFeatures.headingHighlight')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xs md:text-base px-2">{t('home.coreFeatures.subtitle')}</p>
        </div>
        {features.map((feature, index) => <div key={feature.id} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-6 md:gap-8 lg:gap-16 mb-12 md:mb-24 last:mb-0`}>
            {/* Text Content */}
            <div className="flex-1 max-w-md text-center lg:text-left px-2 md:px-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 mb-4 md:mb-5">
                <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                <span className="text-purple-400 text-lg md:text-xl font-bold">{t(`home.coreFeatures.items.${feature.key}.badge`)}</span>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">
                {t(`home.coreFeatures.items.${feature.key}.title`)}
              </h2>
              
              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
                {t(`home.coreFeatures.items.${feature.key}.description`)}
              </p>
              
              {/* CTA Button */}
              <Button className={`bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white font-medium px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition-all text-sm md:text-base`}>
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                {t('common.tryForFree')}
              </Button>
            </div>
            
            {/* Image/Video Preview */}
            <div className="flex-1 w-full max-w-xl px-2 md:px-0">
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50">
                {'video' in feature && feature.video ? <video src={feature.video} autoPlay loop muted playsInline className="w-full h-48 sm:h-56 md:h-80 object-cover" /> : <img src={feature.image} alt={t(`home.coreFeatures.items.${feature.key}.title`)} className="w-full h-48 sm:h-56 md:h-80 object-cover" />}
                
                {/* Overlay UI Element */}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg md:rounded-xl px-2.5 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 border border-white/10">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-xs md:text-sm flex-1 truncate">{t(`home.coreFeatures.items.${feature.key}.overlay`)}</span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] md:text-xs px-2.5 md:px-4 h-7 md:h-8 flex-shrink-0">
                      {t('common.generate')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>)}
      </div>
    </section>;
};
export default CoreFeatures;