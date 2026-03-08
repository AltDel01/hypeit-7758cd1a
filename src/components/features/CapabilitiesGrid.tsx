import React from 'react';
import { Flame, Video, BookOpen, Mic, CircleUserRound, ShoppingBag } from 'lucide-react';

const capabilities = [
  {
    icon: Flame,
    title: 'Viral Ready Short-Form Content',
    description: 'AI-optimized clips engineered for TikTok, Instagram Reels, and YouTube Shorts. Maximize reach with scroll-stopping hooks and trending formats.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    gradient: 'from-rose-500 to-orange-500',
    featured: true,
  },
  {
    icon: Video,
    title: 'Promotional Videos',
    description: 'Create stunning brand ads, product launches, and campaign videos that convert viewers into customers.',
    image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=400&fit=crop',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'Explainer Videos',
    description: 'Transform complex ideas into clear, engaging how-to content, tutorials, and walkthroughs with AI narration.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Mic,
    title: 'Podcasts',
    description: 'Generate professional podcast episodes with AI-powered avatars. No studio, no scheduling, just content.',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: CircleUserRound,
    title: 'AI Avatars / UGC',
    description: 'Photorealistic talking avatars that speak for your brand. Create unlimited UGC and promotional content at scale.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: ShoppingBag,
    title: 'Product Visuals',
    description: 'Generate e-commerce images and videos that sell. Perfect for product listings, ads, and social commerce.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const CapabilitiesGrid: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 px-3 md:px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            What you can{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              create
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            From viral short-form clips to full-length promotional videos — create any content format powered by AI.
          </p>
        </div>

        {/* Featured card - Viral Ready */}
        <div className="mb-6 md:mb-8">
          <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50 hover:border-white/20 transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${capabilities[0].gradient} flex items-center justify-center`}>
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Featured</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {capabilities[0].title}
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg">
                  {capabilities[0].description}
                </p>
              </div>
              <div className="flex-1 relative min-h-[200px] md:min-h-[300px]">
                <img
                  src={capabilities[0].image}
                  alt={capabilities[0].title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent lg:hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* Rest of capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {capabilities.slice(1).map((cap) => (
            <div
              key={cap.title}
              className="group relative rounded-xl overflow-hidden border border-white/10 bg-gray-900/50 hover:border-white/20 transition-all duration-300"
            >
              <div className="relative h-40 md:h-48 overflow-hidden">
                <img
                  src={cap.image}
                  alt={cap.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <div className={`absolute top-3 left-3 w-9 h-9 rounded-lg bg-gradient-to-r ${cap.gradient} flex items-center justify-center`}>
                  <cap.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="p-4 md:p-5">
                <h3 className="text-lg font-semibold text-white mb-2">{cap.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesGrid;
