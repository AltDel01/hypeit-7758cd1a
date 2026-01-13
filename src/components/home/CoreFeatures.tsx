import React from 'react';
import { Sparkles, Scissors, UserCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    badge: 'AI Video Editor',
    icon: Sparkles,
    title: 'Magical Editing, Instantly.',
    description: 'Transform raw footage into scroll-stopping content. Our AI adds visual hooks, cinematic transitions, and perfectly-timed motion graphics—automatically.',
    gradient: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=500&fit=crop',
    overlayText: 'Adding cinematic transitions...',
  },
  {
    badge: 'Viral Clips',
    icon: Scissors,
    title: 'Turn Long Videos Into Viral Moments.',
    description: 'Drop your long-form content and let AI find the golden moments. Get perfectly-cut clips optimized for TikTok, Reels, and Shorts in seconds.',
    gradient: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=500&fit=crop',
    overlayText: 'Extracting viral moments...',
  },
  {
    badge: 'AI Avatars',
    icon: UserCircle,
    title: 'Your Brand Speaks. You Don\'t Have To.',
    description: 'Turn any photo into a photorealistic AI avatar that speaks for your brand. Create unlimited UGC and promotional content—no camera, no crew, no problem.',
    gradient: 'from-amber-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop',
    overlayText: 'Generating avatar voice...',
  },
  {
    badge: 'Content Generation',
    icon: ImageIcon,
    title: 'Product Visuals That Sell.',
    description: 'Generate stunning product images and videos that convert. Perfect for e-commerce, affiliates, and anyone who needs professional content at scale.',
    gradient: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop',
    overlayText: 'Creating product showcase...',
  },
];

const CoreFeatures: React.FC = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden bg-black">
      <div className="relative z-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16 mb-24 last:mb-0`}
          >
            {/* Text Content */}
            <div className="flex-1 max-w-md">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">{feature.badge}</span>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {feature.title}
              </h2>
              
              {/* Description */}
              <p className="text-gray-400 text-base leading-relaxed mb-6">
                {feature.description}
              </p>
              
              {/* CTA Button */}
              <Button 
                className={`bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-all`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try for Free
              </Button>
            </div>
            
            {/* Image/Preview */}
            <div className="flex-1 w-full max-w-xl">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                
                {/* Overlay UI Element */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm flex-1">{feature.overlayText}</span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4">
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreFeatures;
