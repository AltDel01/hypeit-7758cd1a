
import React from 'react';
import PricingCard from '@/components/ui/PricingCard';
import { cn } from '@/lib/utils';

const Pricing = () => {
  const pricing = [
    {
      title: "Free",
      price: "Free",
      description: "Perfect for trying out BrandGen's core features",
      features: [
        { name: "5 AI images per month", included: true },
        { name: "10 text contents per month", included: true },
        { name: "Basic moodboard creation", included: true },
        { name: "1 logo suggestion", included: true },
        { name: "Brand identity package", included: false },
        { name: "Social media strategy", included: false },
        { name: "Competitor analysis", included: false },
        { name: "Priority support", included: false },
      ],
      popular: false,
    },
    {
      title: "Pro",
      price: "$29",
      description: "For professionals who need more creative power",
      features: [
        { name: "25 AI images per month", included: true },
        { name: "40 text contents per month", included: true },
        { name: "Advanced moodboard creation", included: true },
        { name: "5 logo suggestions", included: true },
        { name: "Brand identity package", included: true },
        { name: "Social media strategy", included: false },
        { name: "Competitor analysis", included: false },
        { name: "Priority support", included: true },
      ],
      popular: true
    },
    {
      title: "Business",
      price: "$79",
      description: "For businesses that need the complete package",
      features: [
        { name: "25 AI images per month", included: true },
        { name: "40 text contents per month", included: true },
        { name: "Advanced moodboard creation", included: true },
        { name: "Unlimited logo suggestions", included: true },
        { name: "Brand identity package", included: true },
        { name: "Social media strategy", included: true },
        { name: "Competitor analysis", included: true },
        { name: "Priority support", included: true },
      ],
      popular: false
    },
    {
      title: "Specialist",
      price: "$125",
      description: "AI-powered end-to-end social growth and analytics",
      features: [
        { name: "All Pro Benefits", included: true },
        { name: "AI Automated posting to social media", included: true },
        { name: "AI winning content analytics", included: true },
        { name: "AI influencer recommendation and analytics", included: true },
        { name: "AI contact, collect rate card, and generate brief with influencers automatically", included: true },
        { name: "AI social media Audit", included: true },
        { name: "AI competitor benchmarking", included: true },
        { name: "AI social media reporting", included: true },
        { name: "AI social media trend analytics", included: true },
      ],
      popular: false
    }
  ];

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
            Simple, transparent pricing
          </h2>
          <p className="text-brand-slate-600 text-md md:text-lg">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>
        </div>
        
        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto snap-x md:overflow-visible pb-4 no-scrollbar">
          {pricing.map((plan, index) => (
            <div
              key={index}
              className="snap-start min-w-[85vw] max-w-xs sm:min-w-[60vw] md:min-w-0 md:max-w-none"
            >
              <PricingCard
                title={plan.title}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                buttonText={
                  plan.title === "Free"
                    ? "Get Started"
                    : plan.title === "Specialist"
                      ? "Contact Sales"
                      : "Start Free Trial"}
                className={
                  (plan.popular
                    ? "md:scale-105 md:shadow-lg z-10"
                    : "") + " duration-300"
                }
              />
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center text-brand-slate-500 text-sm px-2">
          Need a custom plan?{" "}
          <a href="#" className="text-brand-blue hover:underline">
            Contact us
          </a>{" "}
          for enterprise pricing.
        </div>
      </div>
    </section>
  );
};

export default Pricing;

