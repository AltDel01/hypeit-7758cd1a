import React, { useState } from 'react';
import { ImageIcon, Video, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VisualGenerator from './ai-generator/VisualGenerator';
import VideoGenerator from './ai-generator/VideoGenerator';
import AICreatorGenerator from './ai-generator/AICreatorGenerator';

const AIContentGenerator = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'video' | 'ai-creator'>('visual');

  const tabs = [
    { id: 'visual', label: 'Visual', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'ai-creator', label: 'AI Creator', icon: Bot }
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'visual':
        return <VisualGenerator />;
      case 'video':
        return <VideoGenerator />;
      case 'ai-creator':
        return <AICreatorGenerator />;
      default:
        return <VisualGenerator />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 animate-gradient-text">
          AI Content Generator
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload product images and generate stunning visuals with AI
        </p>
      </div>

      {/* Submenu Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              className={`gap-1.5 md:gap-2 text-xs md:text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                  : ''
              }`}
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AIContentGenerator;
