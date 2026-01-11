import React from 'react';
import { Zap, Award, Sliders } from 'lucide-react';

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
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Why creators{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              love us
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of creators who've transformed their workflow with AI-powered editing
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group relative text-center p-8 rounded-2xl bg-gray-900/30 border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-[#8c52ff]/20 to-[#b616d6]/20 mb-6 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-8 h-8 text-purple-400" />
              </div>
              
              {/* Value */}
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent mb-2">
                {benefit.value}
              </div>
              
              {/* Title & Description */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-purple-400 text-sm mb-4">
                {benefit.description}
              </p>
              
              {/* Detail */}
              <p className="text-gray-400 text-sm leading-relaxed">
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
