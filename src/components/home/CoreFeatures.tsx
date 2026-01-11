import React from 'react';
import { Sparkles, Captions, Film, Layers, Wand2, Smartphone, Zap, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Editing',
    description: 'Let AI handle the heavy lifting. Describe what you want, and watch as your vision comes to life automatically.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Captions,
    title: 'Auto Captions',
    description: 'Generate trending-style captions that grab attention. Perfect for TikTok, Reels, and Shorts.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Film,
    title: 'Smart B-Roll',
    description: 'Automatically insert relevant stock footage that matches your content and keeps viewers engaged.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Layers,
    title: 'Pro Transitions',
    description: 'Add smooth, professional transitions between clips with a single click. No editing skills required.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: Wand2,
    title: 'Cinematic Effects',
    description: 'Apply stunning visual effects and color grading to make your content look professionally produced.',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: Smartphone,
    title: 'iPhone Quality',
    description: 'Upscale and enhance your footage to match the quality standards of top creators.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const CoreFeatures: React.FC = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Powerful Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything you need to go{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              viral
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Create professional-quality videos in minutes, not hours. Our AI handles the editing so you can focus on creating.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <a
            href="/features"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            See all features
          </a>
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
