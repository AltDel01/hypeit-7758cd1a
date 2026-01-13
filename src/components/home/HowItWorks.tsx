import React from 'react';
import { Upload, Wand2, Download, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload or Describe',
    description: 'Upload your raw video footage or simply describe the video you want to create. Our AI understands natural language.',
  },
  {
    number: '02',
    icon: Wand2,
    title: 'Customize with AI',
    description: 'Select the editing features you want — captions, transitions, effects, B-roll. Tell AI how you want it styled.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Export & Share',
    description: 'Download your professionally edited video in seconds. Ready for TikTok, Instagram, YouTube, or any platform.',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="relative py-12 md:py-16 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4 md:mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            How it{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From raw footage to viral content in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative group"
              >
                {/* Step card */}
                <div className="relative p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-purple-500/30 transition-all duration-300 text-center">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#8c52ff] to-[#b616d6] rounded-full text-white text-sm font-bold">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="inline-flex p-4 rounded-2xl bg-gray-800 mb-6 mt-4 group-hover:bg-purple-500/20 transition-colors">
                    <step.icon className="w-8 h-8 text-purple-400" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 w-8 h-8 hidden md:flex items-center justify-center">
                    <div className="w-3 h-3 border-t-2 border-r-2 border-purple-500/50 transform rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
