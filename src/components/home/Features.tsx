
import React from 'react';
import FeatureCard from '@/components/ui/FeatureCard';
import { 
  Image, 
  MessageSquare, 
  Palette, 
  FileText, 
  TrendingUp, 
  Target
} from 'lucide-react';

const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-brand-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            All the tools you need to build your brand
          </h2>
          <p className="text-brand-slate-600 text-lg">
            Our AI-powered platform streamlines your branding and marketing efforts, 
            so you can focus on growing your business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="AI Image Generation"
            description="Transform product photos into stunning social media content with our advanced AI. Generate images for Instagram, Facebook, and more."
            icon={<Image className="h-6 w-6 text-brand-blue" />}
          />
          
          <FeatureCard
            title="Engaging Captions"
            description="Create compelling captions and text content for all your social media posts. Our AI adapts to your brand voice."
            icon={<MessageSquare className="h-6 w-6 text-brand-teal" />}
          />
          
          <FeatureCard
            title="Brand Identity Creation"
            description="Develop your unique brand identity with AI-generated color palettes, typography recommendations, and logo designs."
            icon={<Palette className="h-6 w-6 text-brand-blue" />}
          />
          
          <FeatureCard
            title="Comprehensive Moodboards"
            description="Create beautiful moodboards that capture your brand essence. Download as PDF to share with your team or clients."
            icon={<FileText className="h-6 w-6 text-brand-teal" />}
          />
          
          <FeatureCard
            title="Marketing Strategy"
            description="Get a detailed social media strategy tailored to your business goals, target audience, and industry."
            icon={<TrendingUp className="h-6 w-6 text-brand-blue" />}
          />
          
          <FeatureCard
            title="Audience Targeting"
            description="Understand your ideal customer with detailed demographic, interest, and behavior analysis."
            icon={<Target className="h-6 w-6 text-brand-teal" />}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
