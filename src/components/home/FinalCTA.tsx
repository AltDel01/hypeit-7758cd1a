import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  'No credit card required',
  'Free tier available',
  'Cancel anytime',
];

const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-8 md:py-12 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Start creating today
        </div>
        
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to create{' '}
          <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
            viral content
          </span>
          ?
        </h2>
        
        {/* Description */}
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are already using Viralin to produce stunning videos in minutes.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button
            asChild
            size="lg"
            className="px-8 py-6 text-lg bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white font-semibold hover:opacity-90 shadow-lg shadow-purple-500/30"
          >
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg border-gray-700 text-white hover:bg-gray-800"
          >
            <Link to="/pricing">
              View Pricing
            </Link>
          </Button>
        </div>
        
        {/* Features list */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
