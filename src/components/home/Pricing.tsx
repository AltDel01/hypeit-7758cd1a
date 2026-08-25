import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PricingCard from '@/components/ui/PricingCard';
import QrisCheckoutDialog from '@/components/payments/QrisCheckoutDialog';
import { useAuth } from '@/contexts/AuthContext';

type Currency = 'IDR' | 'USD';

const detectIndonesia = () => {
  try {
    const override = new URLSearchParams(window.location.search).get('cur');
    if (override) return override.toUpperCase() === 'IDR';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Jakarta|Pontianak|Makassar|Jayapura/i.test(tz)) return true;
    const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    return langs.some((l) => /^id\b|-ID$/i.test(l));
  } catch {
    return false;
  }
};

const plans = [
  {
    key: 'free',
    title: 'Free',
    usd: 'FREE',
    idr: 'Coba Sekarang',
    credits: '500',
    usdPer: '',
    idrPer: '',
    mediaInfo: 'TRIAL',
    description: 'Perfect to try core features',
    features: [
      { name: 'Queue', included: true },
      { name: 'Fast-track generation', included: true },
      { name: '720p Video Generation', included: true, bold: '720p' },
      { name: 'Image upscaling', included: true },
      { name: 'Video extension', included: true },
      { name: 'Generated content is for commercial use', included: true }],
    popular: false,
  },
  {
    key: 'starter',
    title: 'Starter',
    usd: '$15/month',
    idr: 'Rp 249.000/bulan',
    credits: '3,000',
    usdPer: 'As low as $1.09 per 100 Credits',
    idrPer: 'As low as Rp 8.300 per 100 Credits',
    mediaInfo: '',
    description: 'For growing brands and creators',
    features: [
      { name: 'Queue unlimited tasks', included: true },
      { name: 'Fast-track generation', included: true },
      { name: '1080p Video Generation', included: true, bold: '1080p' },
      { name: 'Image upscaling', included: true },
      { name: 'Video extension', included: true },
      { name: 'Priority access to new features', included: true },
      { name: 'Generated content is for commercial use', included: true }],
    popular: true,
  },
  {
    key: 'pro',
    title: 'Pro',
    usd: '$25/month',
    idr: 'Rp 449.000/bulan',
    credits: '8,000',
    usdPer: 'As low as $1.01 per 100 Credits',
    idrPer: 'As low as Rp 5.613 per 100 Credits',
    mediaInfo: '',
    description: 'For businesses needing high conversion',
    features: [
      { name: 'Queue unlimited tasks', included: true },
      { name: 'Fast-track generation', included: true },
      { name: '1080p Video Generation', included: true, bold: '1080p' },
      { name: 'Image upscaling', included: true },
      { name: 'Video extension', included: true },
      { name: 'Priority access to new features', included: true },
      { name: 'Generated content is for commercial use', included: true }],
    popular: false,
  },
  {
    key: 'specialist',
    title: 'Specialist',
    usd: '$125/month',
    idr: 'Rp 1.750.000/bulan',
    credits: '26,000',
    usdPer: 'As low as $0.62 per 100 Credits',
    idrPer: 'As low as Rp 6.731 per 100 Credits',
    mediaInfo: '',
    description: 'Suitable for agency or enterprise',
    features: [
      { name: 'Queue unlimited tasks', included: true },
      { name: 'Fast-track generation', included: true },
      { name: '1080p Video Generation', included: true, bold: '1080p' },
      { name: 'Image upscaling', included: true },
      { name: 'Video extension', included: true },
      { name: 'Priority access to new features', included: true },
      { name: 'Beta test invite (if applicable)', included: true },
      { name: 'Generated content is for commercial use', included: true }],
    popular: false,
    isVibe: true,
  },
];

const CURRENCY_KEY = 'viralin.pricing.currency';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packKey, setPackKey] = useState<string | null>(null);
  const [manual, setManual] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(CURRENCY_KEY);
    } catch {
      return false;
    }
  });
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_KEY);
      if (saved === 'IDR' || saved === 'USD') return saved;
    } catch {
      /* ignore */
    }
    return detectIndonesia() ? 'IDR' : 'USD';
  });

  // Fallback: IP-based country check when browser locale/timezone is inconclusive
  React.useEffect(() => {
    if (manual || currency === 'IDR') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('https://ipapi.co/country/');
        const country = (await res.text()).trim().toUpperCase();
        if (!cancelled && country === 'ID') setCurrency('IDR');
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const chooseCurrency = (next: Currency) => {
    setCurrency(next);
    setManual(true);
    try {
      localStorage.setItem(CURRENCY_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const startCheckout = (key: string) => {
    if (key === 'free') return;
    if (currency === 'USD') return;
    if (!user) {
      navigate('/auth');
      return;
    }
    setPackKey(key);
  };

  const isIDR = currency === 'IDR';


  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10">
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple &amp; Transparent Pricing
          </h2>
          <p className="text-brand-slate-600 text-md md:text-lg">
            Choose the right plan for your business.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
            {(['USD', 'IDR'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => chooseCurrency(c)}
                aria-pressed={currency === c}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  currency === c
                    ? 'bg-primary text-primary-foreground'
                    : 'text-brand-slate-500 hover:text-foreground'
                }`}
              >
                {c === 'USD' ? 'USD ($)' : 'IDR (Rp)'}
              </button>
            ))}
          </div>
        </div>


        {/* Mobile: 2-col grid, Desktop: 4-col grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {plans.map((plan) => (
            <div key={plan.key}>
              <PricingCard
                title={isIDR && plan.key === 'free' ? 'Gratis' : plan.title}
                price={isIDR ? plan.idr : plan.usd}
                credits={plan.credits}
                creditsPerPrice={isIDR ? plan.idrPer : plan.usdPer}
                mediaInfo={plan.mediaInfo}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                isVibe={(plan as any).isVibe}
                buttonText={
                  plan.key === 'free'
                    ? 'Current Plan'
                    : isIDR
                      ? `Upgrade ke ${plan.title}`
                      : `Upgrade to ${plan.title}`
                }
                onButtonClick={() => startCheckout(plan.key)}
                className="duration-300" />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-brand-slate-500 text-sm px-2">
          Need a custom plan? Visit our page{' '}
          <a href="/enterprise" className="text-brand-blue hover:underline">
            here
          </a>
        </div>
      </div>

      <QrisCheckoutDialog packKey={packKey} onOpenChange={(open) => !open && setPackKey(null)} />
    </section>);

};

export default Pricing;
