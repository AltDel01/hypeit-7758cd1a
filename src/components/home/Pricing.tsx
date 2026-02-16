import React from 'react';
import PricingCard from '@/components/ui/PricingCard';
import { cn } from '@/lib/utils';

const Pricing = () => {
  const pricing = [
  {
    title: "Free",
    price: "FREE",
    credits: "500",
    creditsPerPrice: "",
    mediaInfo: "TRIAL",
    description: "Perfect to try core features",
    features: [
    { name: "Queue", included: true },
    { name: "Fast-track generation", included: true },
    { name: "720p Video Generation", included: true, bold: "720p" },
    { name: "Image upscaling", included: true },
    { name: "Video extension", included: true },
    { name: "Generated content is for commercial use", included: true }],

    popular: false
  },
  {
    title: "Starter",
    price: "$15/month",
    credits: "3,000",
    creditsPerPrice: "As low as $1.09 per 100 Credits",
    mediaInfo: "",
    description: "For growing brands and businesses",
    features: [
    { name: "Queue unlimited tasks", included: true },
    { name: "Fast-track generation", included: true },
    { name: "1080p Video Generation", included: true, bold: "1080p" },
    { name: "Image upscaling", included: true },
    { name: "Video extension", included: true },
    { name: "Priority access to new features", included: true },
    { name: "Generated content is for commercial use", included: true }],

    popular: true
  },
  {
    title: "Pro",
    price: "$25/month",
    credits: "8,000",
    creditsPerPrice: "As low as $1.01 per 100 Credits",
    mediaInfo: "",
    description: "For businesses needing high conversion",
    features: [
    { name: "Queue unlimited tasks", included: true },
    { name: "Fast-track generation", included: true },
    { name: "1080p Video Generation", included: true, bold: "1080p" },
    { name: "Image upscaling", included: true },
    { name: "Video extension", included: true },
    { name: "Priority access to new features", included: true },
    { name: "Generated content is for commercial use", included: true }],

    popular: false
  },
  {
    title: "Specialist",
    price: "$125/month",
    credits: "26,000",
    creditsPerPrice: "As low as $0.62 per 100 Credits",
    mediaInfo: "",
    description: "End-to-end AI social growth & analytics",
    features: [
    { name: "Queue unlimited tasks", included: true },
    { name: "Fast-track generation", included: true },
    { name: "1080p Video Generation", included: true, bold: "1080p" },
    { name: "Image upscaling", included: true },
    { name: "Video extension", included: true },
    { name: "Priority access to new features", included: true },
    { name: "Beta test invite (if applicable)", included: true },
    { name: "Generated content is for commercial use", included: true }],

    popular: false,
    isVibe: true,
    buttonText: "Upgrade to Specialist"
  }];


  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple & Transparent Pricing
          </h2>
          <p className="text-brand-slate-600 text-md md:text-lg">
            Choose the right plan for your business. 
          </p>
        </div>
        
        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto snap-x md:overflow-visible pb-4 no-scrollbar">
          {pricing.map((plan, index) =>
          <div
            key={index}
            className="snap-start min-w-[85vw] max-w-xs sm:min-w-[60vw] md:min-w-0 md:max-w-none">

              <PricingCard
              title={plan.title}
              price={plan.price}
              credits={plan.credits}
              creditsPerPrice={plan.creditsPerPrice}
              mediaInfo={plan.mediaInfo}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              isVibe={(plan as any).isVibe}
              buttonText={
              plan.title === "Free" ?
              "Current Plan" :
              plan.title === "Starter" ?
              "Upgrade to Starter" :
              plan.title === "Pro" ?
              "Upgrade to Pro" :
              "Upgrade to Specialist"}
              className="duration-300" />

            </div>
          )}
        </div>
        
        <div className="mt-10 text-center text-brand-slate-500 text-sm px-2">
          Need a custom plan?{" "}
          <a href="#" className="text-brand-blue hover:underline">
            Contact us
          </a>{" "}
          for enterprise pricing.
        </div>
      </div>
    </section>);

};

export default Pricing;