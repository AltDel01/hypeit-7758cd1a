import { useState } from 'react';
import { Layers, Megaphone, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/seo/Seo';
import SequenceGeneration from '@/components/tools/SequenceGeneration';
import AdCopyGenerator from '@/components/tools/AdCopyGenerator';
import ViralPredictor from '@/components/tools/ViralPredictor';

type Tab = 'sequence' | 'adcopy' | 'predictor';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'sequence', label: 'Sequence Generation', icon: Layers },
  { id: 'adcopy', label: 'Ad Copy', icon: Megaphone },
  { id: 'predictor', label: 'Viral Predictor', icon: Brain },
];

const Tools = () => {
  const [active, setActive] = useState<Tab>('sequence');

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Seo
        title="Tools, Sequence Gen, Ad Copy, Viral Predictor | Viralin AI"
        description="Run multi-prompt image and video generation, generate 15 ad campaigns from a URL, and predict virality with neural-inspired scoring."
        canonicalPath="/tools"
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-black animate-gradient-text mb-2">Tools</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Production-grade utilities. Generate in batches, write campaigns from a single URL, and predict virality before you spend.
          </p>
        </header>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
                active === t.id
                  ? 'bg-[#8C52FF] text-white shadow-lg shadow-[#8C52FF]/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50',
              )}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {active === 'sequence' && <SequenceGeneration />}
          {active === 'adcopy' && <AdCopyGenerator />}
          {active === 'predictor' && <ViralPredictor />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tools;
