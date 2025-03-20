
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
      popular: true,
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
      popular: false,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-brand-slate-600 text-lg">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricing.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              buttonText={plan.title === "Free" ? "Get Started" : "Start Free Trial"}
              className={cn(
                plan.popular ? "md:scale-105 md:shadow-lg z-10" : "",
                "duration-300"
              )}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center text-brand-slate-500 text-sm">
          Need a custom plan? <a href="#" className="text-brand-blue hover:underline">Contact us</a> for enterprise pricing.
        </div>
      </div>
    </section>
  );
};

export default Pricing;
