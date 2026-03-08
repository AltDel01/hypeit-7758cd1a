import React from 'react';
import { Clapperboard, Flame, Captions, Languages, Maximize, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tools = [
  {
    icon: Clapperboard,
    badge: 'AI Video Editor',
    title: 'Edit Like a Pro, Automatically.',
    description: 'Cinematic transitions, motion graphics, and visual effects — all applied by AI. No timeline scrubbing, no manual keyframing.',
    gradient: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=500&fit=crop',
  },
  {
    icon: Flame,
    badge: 'Viral Clip Extractor',
    title: 'Find the Gold in Your Content.',
    description: 'Drop long-form videos and let AI identify the most engaging moments. Get perfectly-cut clips optimized for every platform.',
    gradient: 'from-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=500&fit=crop',
  },
  {
    icon: Captions,
    badge: 'AI Captions & Subtitles',
    title: 'Words That Pop.',
    description: 'Auto-generated captions with trendy styles, animations, and perfect timing. Boost engagement and accessibility in one click.',
    gradient: 'from-cyan-500 to-blue-500',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=500&fit=crop',
  },
  {
    icon: Languages,
    badge: 'Multi-Language Dubbing',
    title: 'Go Global Instantly.',
    description: 'Translate and dub your content in 30+ languages with natural-sounding AI voices. Lip-sync included.',
    gradient: 'from-emerald-500 to-teal-500',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
  },
  {
    icon: Maximize,
    badge: 'Smart Resize',
    title: 'One Video, Every Platform.',
    description: 'Automatically adapt your content for TikTok, Reels, Shorts, Stories, and Feed — with intelligent reframing that keeps the action centered.',
    gradient: 'from-pink-500 to-rose-500',
    image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=500&fit=crop',
  },
  {
    icon: Palette,
    badge: 'Brand Kit',
    title: 'Your Brand, Every Frame.',
    description: 'Upload your logo, colors, and fonts once. Every piece of content automatically matches your brand identity.',
    gradient: 'from-violet-500 to-indigo-500',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=500&fit=crop',
  },
];

const ToolsShowcase: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 px-3 md:px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Platform Tools</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powered by{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              intelligent tools
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Every feature is designed to save you hours while producing studio-quality results.
          </p>
        </div>

        {/* Alternating layout */}
        {tools.map((tool, index) => (
          <div
            key={tool.badge}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-6 md:gap-8 lg:gap-16 mb-12 md:mb-24 last:mb-0`}
          >
            {/* Text */}
            <div className="flex-1 max-w-md text-center lg:text-left px-2 md:px-0">
              <div className="inline-flex items-center gap-3 mb-4 md:mb-5">
                <tool.icon className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                <span className="text-purple-400 text-lg md:text-xl font-bold">{tool.badge}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">
                {tool.title}
              </h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
                {tool.description}
              </p>
              <Button className={`bg-gradient-to-r ${tool.gradient} hover:opacity-90 text-white font-medium px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition-all text-sm md:text-base`}>
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                Try for Free
              </Button>
            </div>

            {/* Image */}
            <div className="flex-1 w-full max-w-xl px-2 md:px-0">
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50">
                <img
                  src={tool.image}
                  alt={tool.badge}
                  className="w-full h-48 sm:h-56 md:h-80 object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg md:rounded-xl px-2.5 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 border border-white/10">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg bg-gradient-to-r ${tool.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-xs md:text-sm flex-1 truncate">{tool.badge} active</span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] md:text-xs px-2.5 md:px-4 h-7 md:h-8 flex-shrink-0">
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

export default ToolsShowcase;
