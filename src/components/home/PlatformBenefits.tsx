import React from 'react';
import { Zap, Award, Sliders, Sparkles } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: 'Speed',
    value: '10x',
    description: 'Faster than traditional editing',
    detail: 'What used to take hours now takes minutes. Our AI processes your videos instantly, so you can publish while the moment is still hot.',
  },
  {
    icon: Award,
    title: 'Quality',
    value: 'Pro',
    description: 'Professional-grade output',
    detail: 'Every video looks like it was made by a professional team. iPhone-quality enhancement, perfect color grading, and flawless transitions.',
  },
  {
    icon: Sliders,
    title: 'Control',
    value: '100%',
    description: 'Full creative control',
    detail: 'AI assists, but you decide. Fine-tune every aspect of your video with simple prompts. The perfect balance of automation and creativity.',
  },
];

const PlatformBenefits: React.FC = () => {
  return (
    <section className="relative py-12 md:py-12 px-3 md:px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 mb-3 md:mb-6">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400" />
            <span className="text-xs md:text-sm font-medium text-purple-300">Creator Benefits</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
            Why creators{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              love us
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto px-2">
            Join thousands of creators who've transformed their workflow with AI-powered editing
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group relative text-center p-5 md:p-8 rounded-xl md:rounded-2xl bg-gray-900/30 border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="inline-flex p-3 md:p-4 rounded-full bg-gradient-to-r from-[#8c52ff]/20 to-[#b616d6]/20 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
              </div>
              
              {/* Value + Title (one line on mobile) */}
              <div className="flex items-baseline justify-center gap-2 mb-1 md:mb-2 md:flex-col md:gap-0 md:items-center">
                <span className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
                  {benefit.value}
                </span>
                <h3 className="text-lg md:text-xl font-semibold text-white">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-purple-400 text-xs md:text-sm mb-3 md:mb-4">
                {benefit.description}
              </p>
              
              {/* Detail */}
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                {benefit.detail}
              </p>
              
              {/* Decorative line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformBenefits;
