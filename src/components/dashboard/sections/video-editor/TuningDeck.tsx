import React, { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import CaptionsTab from './tuning-tabs/CaptionsTab';
import VisualsTab from './tuning-tabs/VisualsTab';
import ExportTab from './tuning-tabs/ExportTab';

const TuningDeck: React.FC = () => {
  const [activeTab, setActiveTab] = useState('captions');

  return (
    <div className="h-full rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#b616d6]" />
          <h3 className="text-sm font-semibold text-white">Tuning Deck</h3>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full grid grid-cols-3 bg-slate-800/50 rounded-none border-b border-slate-700/50 p-0 h-10">
          <TabsTrigger 
            value="captions" 
            className="rounded-none data-[state=active]:bg-[#b616d6]/20 data-[state=active]:text-[#b616d6] data-[state=active]:shadow-none text-xs"
          >
            Captions
          </TabsTrigger>
          <TabsTrigger 
            value="visuals" 
            className="rounded-none data-[state=active]:bg-[#b616d6]/20 data-[state=active]:text-[#b616d6] data-[state=active]:shadow-none text-xs"
          >
            Visuals
          </TabsTrigger>
          <TabsTrigger 
            value="export" 
            className="rounded-none data-[state=active]:bg-[#b616d6]/20 data-[state=active]:text-[#b616d6] data-[state=active]:shadow-none text-xs"
          >
            Export
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="captions" className="m-0 p-4">
            <CaptionsTab />
          </TabsContent>
          <TabsContent value="visuals" className="m-0 p-4">
            <VisualsTab />
          </TabsContent>
          <TabsContent value="export" className="m-0 p-4">
            <ExportTab />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Export Button */}
      <div className="p-4 border-t border-slate-700/50">
        <Button 
          className="w-full h-11 bg-gradient-to-r from-[#8c52ff] to-[#b616d6] hover:from-[#7a45e6] hover:to-[#a012c0] text-white font-semibold shadow-lg shadow-[#b616d6]/25"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Video
        </Button>
      </div>
    </div>
  );
};

export default TuningDeck;
