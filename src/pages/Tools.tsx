import { useState } from 'react';
import { Layers, Megaphone, Brain, Mic2, Camera, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/seo/Seo';
import SequenceGeneration from '@/components/tools/SequenceGeneration';
import AdCopyGenerator from '@/components/tools/AdCopyGenerator';
import ViralPredictor from '@/components/tools/ViralPredictor';
import LipSyncStudio from '@/components/tools/LipSyncStudio';
import CinemaStudio from '@/components/tools/CinemaStudio';
import WorkflowStudio from '@/components/tools/WorkflowStudio';

type Tab = 'sequence' | 'adcopy' | 'predictor' | 'lipsync' | 'cinema' | 'workflow';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'sequence', label: 'Sequence Generation', icon: Layers },
  { id: 'adcopy', label: 'Ad Copy', icon: Megaphone },
  { id: 'predictor', label: 'Viral Predictor', icon: Brain },
  { id: 'lipsync', label: 'Lip Sync', icon: Mic2 },
  { id: 'cinema', label: 'Cinema', icon: Camera },
  { id: 'workflow', label: 'Workflow', icon: Workflow },
];

const Tools = () => {
  const [active, setActive] = useState<Tab>('sequence');

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Seo
        title="Tools, Sequence Gen, Lip Sync, Cinema, Workflow | Viralin AI"
        description="Batch image and video generation, lip sync studio, cinematic shot composer, and chained AI workflows, all powered by Alibaba DashScope."
        path="/tools"
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-black animate-gradient-text mb-2">Tools</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Production-grade utilities. Batch generations, lip sync, cinematic shots, and multi-step pipelines.
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
          {active === 'lipsync' && <LipSyncStudio />}
          {active === 'cinema' && <CinemaStudio />}
          {active === 'workflow' && <WorkflowStudio />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tools;
