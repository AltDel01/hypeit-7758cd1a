import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle, Play, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CapabilitiesGrid from '@/components/features/CapabilitiesGrid';
import ToolsShowcase from '@/components/features/ToolsShowcase';
import FinalCTA from '@/components/home/FinalCTA';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-28 md:pt-36 pb-12 md:pb-20 px-3 md:px-4 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[150px]" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs md:text-sm font-medium mb-6">
              <Wand2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              AI-Powered Editing Tools
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Edit Smarter with{' '}
              <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </h1>

            <p className="text-sm md:text-xl text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto">
              Trimming, B-Roll insertion, word silencing, dubbing, transitions, motion graphics, captions — all powered by AI that edits like a pro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="px-6 md:px-8 py-5 md:py-6 text-sm md:text-lg bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white font-semibold hover:opacity-90 shadow-lg shadow-purple-500/30"
              >
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 md:px-8 py-5 md:py-6 text-sm md:text-lg border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {['No credit card required', 'Free tier available', 'Cancel anytime'].map((text) => (
                <div key={text} className="flex items-center gap-1.5 text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                  <span className="text-xs md:text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CapabilitiesGrid />
        <ToolsShowcase />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
