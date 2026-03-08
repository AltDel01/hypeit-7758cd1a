import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroBackground from '@/components/enterprise/HeroBackground';
import caseTravel from '@/assets/enterprise/case-travel.jpg';
import caseCpg from '@/assets/enterprise/case-cpg.jpg';
import caseAgency from '@/assets/enterprise/case-agency.jpg';
import { Button } from '@/components/ui/button';
import {
  Building2, Plane, ShoppingBag, Users, ArrowRight, CheckCircle,
  Play, BarChart3, Zap, Globe, Shield, Headphones, Star, ChevronDown, ChevronUp } from
'lucide-react';

const caseStudies = [
{
  id: 'travel',
  icon: Plane,
  industry: 'Travel & Hospitality',
  company: 'Global Travel Brand',
  gradient: 'from-sky-500 to-blue-600',
  bgGlow: 'bg-sky-500/15',
  bgImage: caseTravel,
  problem: 'Shooting promotional videos across 30+ destinations worldwide cost $500K+ per campaign with crews, logistics, and post-production delays of 8–12 weeks.',
  solution: 'With Viralin, their in-house team captures raw footage on-location using smartphones. AI handles editing, color grading, transitions, and format optimization for every platform — instantly.',
  results: [
  { metric: '85%', label: 'Reduction in production costs' },
  { metric: '10x', label: 'Faster turnaround time' },
  { metric: '3x', label: 'More content per destination' }],

  quote: '"We went from spending months on a single campaign to publishing daily destination content across 15 markets."'
},
{
  id: 'cpg',
  icon: ShoppingBag,
  industry: 'CPG & Consumer Brands',
  company: 'Leading FMCG Brand',
  gradient: 'from-amber-500 to-orange-600',
  bgGlow: 'bg-amber-500/15',
  bgImage: caseCpg,
  problem: 'Professional product shoots with studio rentals, photographers, videographers, and editors cost $50K–$200K per product launch. Seasonal campaigns multiplied this 4x annually.',
  solution: 'Teams now shoot product footage in simple setups. Viralin\'s AI transforms raw clips into studio-quality ads with branded overlays, motion graphics, and platform-specific formats.',
  results: [
  { metric: '70%', label: 'Lower cost per asset' },
  { metric: '200+', label: 'Assets per product launch' },
  { metric: '4x', label: 'Faster go-to-market' }],

  quote: '"Our creative output increased 10x while our production budget dropped by more than half."'
},
{
  id: 'agency',
  icon: Users,
  industry: 'Social Media & Influencer Agencies',
  company: 'Top Digital Agency',
  gradient: 'from-fuchsia-500 to-purple-600',
  bgGlow: 'bg-fuchsia-500/15',
  bgImage: caseAgency,
  problem: 'Managing 50+ brand clients with hundreds of raw footage files monthly. Manual editing bottlenecks limited output to 20–30 videos per editor per month.',
  solution: 'Viralin enables batch processing of raw footage into scroll-stopping social content. AI identifies viral moments, adds hooks, captions, and brand elements at scale.',
  results: [
  { metric: '500%', label: 'Increase in content output' },
  { metric: '15 min', label: 'Avg. time per finished video' },
  { metric: '40%', label: 'Higher client retention' }],

  quote: '"We scaled from 30 to 200+ videos per month without hiring a single new editor."'
}];


const enterpriseFeatures = [
{ icon: Shield, title: 'Enterprise-Grade Security', desc: 'SOC 2 compliant, SSO, and role-based access controls.' },
{ icon: Users, title: 'Team Collaboration', desc: 'Shared workspaces, approval workflows, and brand asset libraries.' },
{ icon: BarChart3, title: 'Analytics & Insights', desc: 'Track content performance and ROI across all channels.' },
{ icon: Zap, title: 'API & Integrations', desc: 'Connect with your existing DAM, CMS, and social tools.' },
{ icon: Globe, title: 'Multi-Language Support', desc: 'AI-powered localization for global content strategies.' },
{ icon: Headphones, title: 'Dedicated Support', desc: 'Priority support with a dedicated customer success manager.' }];


const trustedLogos = [
'Fortune 500 Companies', 'Global Agencies', 'Leading Brands', 'Media Networks'];


const CaseStudyCard = ({ study, index }: {study: typeof caseStudies[0];index: number;}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = study.icon;

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-border transition-all duration-500">
      {/* Header */}
      <div className="relative p-6 md:p-8 overflow-hidden">
        <img src={study.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 ${study.id === 'travel' ? 'bg-black/50' : 'bg-black/65'}`} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${study.gradient} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{study.industry}</p>
              <p className="text-sm font-semibold text-white">{study.company}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">The Challenge</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{study.problem}</p>
        </div>

        <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">The Solution</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{study.solution}</p>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {study.results.map((result, i) =>
            <div key={i} className="text-center p-3 rounded-xl bg-secondary/50">
                <p className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${study.gradient} bg-clip-text text-transparent`}>
                  {result.metric}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{result.label}</p>
              </div>
            )}
          </div>

          {/* Quote */}
          <blockquote className="border-l-2 border-muted pl-4 italic text-sm text-muted-foreground">
            {study.quote}
          </blockquote>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
          
          {expanded ? 'Show less' : 'Read full case study'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>);

};

const Enterprise = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {document.body.removeChild(script);};
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
          <HeroBackground />
          
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-medium mb-6">
              <Building2 className="w-3.5 h-3.5" />
              Enterprise Solutions
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Video Production at{' '}
              <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
                Enterprise Scale
              </span>
              ,
              <br />
              Without Enterprise Cost
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Replace expensive content production cost and months-long timelines. 
Viralin empowers your teams to create studio-quality video content from raw footage in minutes, not months without needing technical content editing skills and complicated SaaS tools.
            
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="px-8 py-6 text-base bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white font-semibold hover:opacity-90 shadow-lg shadow-purple-500/25"
                onClick={() => document.getElementById('book-demo')?.scrollIntoView({ behavior: 'smooth' })}>
                
                Book a Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base border-border text-foreground hover:bg-secondary"
                onClick={() => document.getElementById('case-studies')?.scrollIntoView({ behavior: 'smooth' })}>
                
                <Play className="w-4 h-4 mr-2" />
                See Case Studies
              </Button>
            </div>

            {/* Trust bar */}
            <div className="mt-16 pt-8 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Trusted by industry leaders</p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {trustedLogos.map((logo, i) =>
                <span key={i} className="text-sm font-medium text-muted-foreground/50">{logo}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pain Point Stats */}
        <section className="py-12 md:py-20 px-4 border-y border-border/40 bg-secondary/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {[
              { stat: '$500K+', label: 'Avg. enterprise video production cost per campaign' },
              { stat: '8–12 Weeks', label: 'Traditional post-production turnaround' },
              { stat: '70%', label: 'Of content never gets repurposed' },
              { stat: '5x', label: 'More content needed YoY for social' }].
              map((item, i) =>
              <div key={i}>
                  <p className="text-2xl md:text-4xl font-bold text-foreground mb-2">{item.stat}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{item.label}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section id="case-studies" className="py-16 md:py-24 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                Real Results, Real{' '}
                <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
                  Impact
                </span>
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                See how enterprises across industries are transforming their content production with Viralin.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {caseStudies.map((study, index) =>
              <CaseStudyCard key={study.id} study={study} index={index} />
              )}
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
        <section className="py-16 md:py-24 px-4 bg-secondary/40 border-y border-border/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                Built for Enterprise
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything your organization needs to scale content production securely.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {enterpriseFeatures.map((feature, i) =>
              <div key={i} className="p-6 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Book a Demo CTA */}
        <section id="book-demo" className="py-16 md:py-24 px-4 bg-secondary/20 border-t border-border/40">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                <Star className="w-3.5 h-3.5" />
                Get Started
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-[1.1]">
                Ready to Transform Your{' '}
                <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
                  Content Production
                </span>
                ?
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Book a personalized demo to see how Viralin can reduce your production costs by up to 85% while 10x-ing your content output.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
                {[
                'Custom pricing for your team',
                'Live product walkthrough',
                'ROI analysis for your use case'].
                map((item, i) =>
                <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
              {/* Left side - Copy */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                  <Star className="w-3.5 h-3.5" />
                  Book a Demo
                </div>
                
                <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-[1.1] lg:text-3xl">
                  Book your{' '}
                  <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
                    30-minute
                  </span>
                  {' '}Viralin demo
                </h2>

                <p className="text-sm text-muted-foreground/70">What to expect:</p>

                <div className="space-y-4">
                  {[
                  { bold: 'personalized demo', text: 'Get a personalized demo tailored to your business' },
                  { bold: 'success stories', text: 'Hear proven customer success stories in your industry' },
                  { bold: 'pricing', text: 'Learn about pricing and features for your use case' }].
                  map((item, i) =>
                  <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <p className="text-sm md:text-base text-muted-foreground">{item.text}</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Right side - Calendly */}
              <div className="rounded-2xl border border-border/60 overflow-hidden bg-card/30 backdrop-blur-sm">
                <div
                  className="calendly-inline-widget w-full"
                  data-url="https://calendly.com/hello-viralin/30min?primary_color=b616d6&hide_event_type_details=1&hide_gdpr_banner=1"
                  style={{ minWidth: '320px', height: '480px' }} />
                
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>);

};

export default Enterprise;