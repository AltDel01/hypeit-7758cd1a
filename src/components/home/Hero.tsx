
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="md:w-1/2 space-y-6 animate-fade-in">
            <div className="inline-block rounded-full bg-brand-slate-100 px-3 py-1 text-sm font-medium text-brand-slate-800 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Launching soon • Join the waitlist
            </div>
            
            <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              AI-Powered <span className="text-gradient">Branding</span> for Small Businesses
            </h1>
            
            <p className="text-lg text-brand-slate-600 md:text-xl max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Generate stunning social media content, build your brand identity, and create marketing strategies, all with the power of AI.
            </p>
            
            <div className="pt-4 flex flex-wrap gap-4 items-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Button asChild className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:shadow-lg px-6 py-6 rounded-xl button-glow">
                <Link to="/signup">
                  Get Started For Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="border-brand-slate-300 text-brand-slate-700 hover:bg-brand-slate-50">
                <Link to="/features">
                  See all features
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Image/Mockup */}
          <div className="md:w-1/2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-blue to-brand-teal rounded-2xl blur opacity-20 animate-pulse"></div>
              <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-brand-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                  alt="BrandGen Dashboard Preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
