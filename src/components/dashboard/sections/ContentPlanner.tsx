import React, { useState } from 'react';
import { Calendar, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const ContentPlanner = () => {
  const [businessInfo, setBusinessInfo] = useState({
    business: '',
    industry: '',
    marketSegment: '',
    caption: ''
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedCaption, setEnhancedCaption] = useState('');

  const handleEnhanceCaption = async () => {
    if (!businessInfo.caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please enter a caption to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      // TODO: Integrate with LLaMA API
      // For now, simulate enhancement
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnhancedCaption(`✨ ${businessInfo.caption}\n\n[Enhanced by LLaMA: Added engagement hooks and optimized tone]`);
      
      toast({
        title: "Caption Enhanced!",
        description: "LLaMA has optimized your caption for better engagement",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance caption. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 animate-gradient-text">
            Content Planner
          </h1>
          <p className="text-muted-foreground">
            Plan your 15-day content calendar with AI-powered caption enhancement
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Business Information Form */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Business Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="business">Business Name</Label>
            <Input
              id="business"
              placeholder="e.g., Coffee Shop"
              value={businessInfo.business}
              onChange={(e) => setBusinessInfo({...businessInfo, business: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Food & Beverage"
              value={businessInfo.industry}
              onChange={(e) => setBusinessInfo({...businessInfo, industry: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="segment">Market Segment</Label>
            <Input
              id="segment"
              placeholder="e.g., Young Professionals"
              value={businessInfo.marketSegment}
              onChange={(e) => setBusinessInfo({...businessInfo, marketSegment: e.target.value})}
            />
          </div>
        </div>

        {/* Caption Enhancer */}
        <div className="space-y-4">
          <Label htmlFor="caption">Caption / Content Idea</Label>
          <Textarea
            id="caption"
            placeholder="Enter your caption or content idea here..."
            className="min-h-[120px]"
            value={businessInfo.caption}
            onChange={(e) => setBusinessInfo({...businessInfo, caption: e.target.value})}
          />
          
          <Button 
            onClick={handleEnhanceCaption}
            disabled={isEnhancing}
            className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Sparkles className={`w-4 h-4 ${isEnhancing ? 'animate-pulse' : ''}`} />
            {isEnhancing ? 'Enhancing with LLaMA...' : 'Enhance Caption with LLaMA'}
          </Button>

          {enhancedCaption && (
            <Card className="p-4 bg-purple-600/10 border-purple-500/50 animate-fade-in">
              <p className="text-sm font-medium text-purple-300 mb-2">Enhanced Caption:</p>
              <p className="text-white whitespace-pre-wrap">{enhancedCaption}</p>
            </Card>
          )}
        </div>
      </Card>

      {/* Calendar View Placeholder */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          15-Day Content Calendar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 15 }, (_, i) => (
            <Card 
              key={i} 
              className="p-4 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer"
            >
              <p className="text-sm font-medium text-white mb-1">Day {i + 1}</p>
              <p className="text-xs text-muted-foreground">Click to add content</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ContentPlanner;
