import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FooterMenu from '@/components/layout/FooterMenu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Zap, Shield, CreditCard, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    category: 'Credits & Pricing',
    icon: Zap,
    questions: [
      {
        q: 'How are credits calculated for each generation?',
        a: `Credits are calculated using a simple formula:\n\n**Total Cost = (Base Cost + Feature Add-ons) × Quality Multiplier × Duration Multiplier**\n\n**Base costs by tool:**\n• AI Clip: 60 credits\n• AI Creator: 50 credits\n• Retention Editing: 40 credits\n• AI Edit: 20 credits\n• Default: 10 credits\n\n**Feature add-ons:**\n• Language Dubbing: +25\n• B-roll: +15\n• Captions, Transitions, Effects: +10 each\n• iPhone Quality, Trim, Zoom, Thumbnail, Censor Word: +5 each\n\n**Quality multipliers:**\n• 480P: 0.5× | 720P: 1× | 1080P: 1.5× | 4K: 3×\n\n**Duration multipliers:**\n• 5s: 1× | 10s: 1.8× | 15s: 2.5× | 30s: 4× | 60s: 7×\n\nFor example, an AI Clip (60) with Captions (+10) at 1080P (×1.5) for 10 seconds (×1.8) = **189 credits**.`,
      },
      {
        q: 'When are credits deducted from my account?',
        a: 'Credits are deducted immediately when your generation request is submitted. Before submission, you can see a live cost preview next to the Generate button — hover over it to see the full breakdown.',
      },
      {
        q: 'What happens if I don\'t have enough credits?',
        a: 'If your remaining credits are insufficient for the selected configuration, the Generate button will be blocked and you\'ll see a warning. You can reduce the cost by lowering quality, shortening duration, or removing feature add-ons. Alternatively, you can upgrade your plan for more monthly credits.',
      },
      {
        q: 'How do I get more credits?',
        a: 'Credits are included with your subscription plan and reset monthly. You can upgrade your plan at any time from the Pricing page to get a higher monthly credit allowance.',
      },
    ],
  },
  {
    category: 'Account & Security',
    icon: Shield,
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'You can reset your password from the Login page by clicking "Forgot Password." A reset link will be sent to your registered email address.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. We use industry-standard encryption and secure authentication powered by Supabase. Your media files and personal data are protected with row-level security policies.',
      },
    ],
  },
  {
    category: 'Plans & Billing',
    icon: CreditCard,
    questions: [
      {
        q: 'Can I change my plan at any time?',
        a: 'Yes, you can upgrade or downgrade your plan at any time from the Pricing page. Changes take effect immediately, and your credit balance will be adjusted accordingly.',
      },
      {
        q: 'Do unused credits roll over?',
        a: 'No, credits reset at the start of each billing cycle. We recommend using your credits within the billing period.',
      },
    ],
  },
  {
    category: 'General',
    icon: HelpCircle,
    questions: [
      {
        q: 'What video formats are supported?',
        a: 'Viralin supports most common video formats including MP4, MOV, AVI, and WebM. For best results, we recommend uploading MP4 files.',
      },
      {
        q: 'How long does a generation take?',
        a: 'Generation time varies based on the complexity of your request, video duration, and selected quality. Most requests complete within 2–10 minutes. You\'ll receive a notification when your content is ready.',
      },
    ],
  },
];

const FAQ: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about Viralin, credits, and how our platform works.
          </p>
        </div>

        <div className="space-y-10">
          {faqItems.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{section.category}</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {section.questions.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${section.category}-${i}`}
                    className="border border-border rounded-xl px-5 bg-card/50"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </main>
      <Footer />
      <FooterMenu />
    </div>
  );
};

export default FAQ;
