import React from 'react';
import { Scissors, Film, VolumeX, Languages, Sparkles, Type, Captions, Maximize } from 'lucide-react';

const capabilities = [
  {
    icon: Scissors,
    title: 'Trimming & Cutting',
    description: 'Intelligent auto-trim that detects pauses, dead air, and low-engagement moments — cutting them instantly for tight, punchy edits.',
    gradient: 'from-rose-500 to-orange-500',
    featured: true,
  },
  {
    icon: Film,
    title: 'B-Roll & Footage Insertion',
    description: 'AI analyzes your script and auto-inserts relevant stock footage, context clips, and visual cutaways exactly where needed.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: VolumeX,
    title: 'Silence Certain Words',
    description: 'Auto-detect and mute, bleep, or remove specific words and phrases. Perfect for brand-safe content and compliance.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Languages,
    title: 'Language Dubbing',
    description: 'Translate and dub your content in 30+ languages with natural AI voices and lip-sync technology.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Sparkles,
    title: 'Transitions & Effects',
    description: 'Cinematic transitions, visual effects, and color grading applied automatically based on your content style.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Type,
    title: 'Motion Graphics',
    description: 'Auto-animated text, lower thirds, titles, and kinetic typography that match your brand identity.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Captions,
    title: 'AI Captions & Subtitles',
    description: 'Auto-generated captions with trendy styles, word-by-word highlighting, and perfect timing for maximum engagement.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Maximize,
    title: 'Smart Resize',
    description: 'One-click format adaptation for TikTok, Reels, Shorts, Stories, and Feed with intelligent subject reframing.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Scissors,
    title: 'AI Clipping',
    description: 'Automatically detect the most engaging moments in your content and extract them as standalone clips ready to publish.',
    gradient: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: Film,
    title: 'Long-Form to Short-Form',
    description: 'Transform lengthy videos into bite-sized knowledge feeds — perfect for repurposing webinars, podcasts, and tutorials into snackable social content.',
    gradient: 'from-indigo-500 to-violet-500',
  },
];

const CapabilitiesGrid: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 px-3 md:px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            AI editing{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              capabilities
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Every editing tool you need — powered by AI that understands your content and makes professional edits in seconds.
          </p>
        </div>

        {/* Featured card */}
        <div className="mb-6 md:mb-8">
          <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50 hover:border-white/20 transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${capabilities[0].gradient} flex items-center justify-center`}>
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Core Feature</span>
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
                  src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=400&fit=crop"
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
              className="group relative rounded-xl overflow-hidden border border-white/10 bg-gray-900/50 hover:border-white/20 transition-all duration-300 p-5 md:p-6"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${cap.gradient} flex items-center justify-center mb-4`}>
                <cap.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{cap.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesGrid;
