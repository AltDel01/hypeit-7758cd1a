import React, { useState } from 'react';
import { Clapperboard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIEditorPrompt from './video-editor/AIEditorPrompt';
import ViralClipsDashboard from './video-editor/ViralClipsDashboard';

type SubTab = 'editor' | 'viralclips';

const AIVideoEditor: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('editor');

  const subTabs = [
    { id: 'editor' as SubTab, label: 'AI Editor', icon: Clapperboard },
    { id: 'viralclips' as SubTab, label: 'Viral Clip', icon: Sparkles },
  ];

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 animate-gradient-text">
          AI Video Editor
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Edit videos like a pro with AI-powered tools
        </p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all duration-200",
              activeSubTab === tab.id
                ? "bg-[#b616d6] text-white shadow-lg shadow-[#b616d6]/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'editor' ? (
        <AIEditorPrompt />
      ) : (
        <ViralClipsDashboard />
      )}
    </div>
  );
};

export default AIVideoEditor;
