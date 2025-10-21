import React, { useState } from 'react';
import { BarChart3, TrendingUp, MessageSquare, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const AnalyticsInsights = () => {
  const [llamaQuery, setLlamaQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [insights, setInsights] = useState<string[]>([
    "Reels engagement rose 32% this week; consider posting more 15s videos",
    "Your audience is most active on weekdays between 6-8 PM",
    "Product showcase posts get 2.5x more engagement than text-only posts"
  ]);

  const handleAskLlama = async () => {
    if (!llamaQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a question for LLaMA",
        variant: "destructive"
      });
      return;
    }

    setIsQuerying(true);
    try {
      // TODO: Integrate with LLaMA Insight Summarizer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newInsight = `Based on your data: ${llamaQuery} - [AI-generated insight will appear here]`;
      setInsights([newInsight, ...insights]);
      setLlamaQuery('');
      
      toast({
        title: "Insight Generated",
        description: "LLaMA has analyzed your question",
      });
    } catch (error) {
      toast({
        title: "Query Failed",
        description: "Failed to get insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 animate-gradient-text">
          Analytics & Insights
        </h1>
        <p className="text-muted-foreground">
          Track performance with AI-powered insights from Meta, TikTok, YouTube, and Instagram
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Metrics (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-background/60 backdrop-blur-sm border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-600/20">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-2xl font-bold text-white">+32%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-background/60 backdrop-blur-sm border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-600/20">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="text-2xl font-bold text-white">15.2K</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-background/60 backdrop-blur-sm border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-600/20">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                  <p className="text-2xl font-bold text-white">248</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Overview</h2>
            <div className="h-[300px] flex items-center justify-center border border-dashed border-slate-600 rounded-lg">
              <p className="text-muted-foreground">Interactive charts will be displayed here</p>
            </div>
          </Card>

          {/* Top Posts */}
          <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Top Performing Posts</h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - LLaMA Insights Panel (1/3 width) */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border-purple-500/50">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              LLaMA Insight Summarizer
            </h2>

            {/* AI Insights List */}
            <div className="space-y-3 mb-6">
              {insights.map((insight, index) => (
                <Card 
                  key={index}
                  className="p-3 bg-background/40 border-slate-600 animate-fade-in"
                >
                  <p className="text-sm text-white">{insight}</p>
                </Card>
              ))}
            </div>

            {/* Ask LLaMA Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
                <MessageSquare className="w-4 h-4" />
                Ask LLaMA
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Why did my reach drop this week?"
                  value={llamaQuery}
                  onChange={(e) => setLlamaQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskLlama()}
                  className="bg-background/60"
                />
                <Button 
                  onClick={handleAskLlama}
                  disabled={isQuerying}
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  <Send className={`w-4 h-4 ${isQuerying ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">AI Recommendations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Post more video content during peak hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Increase posting frequency on Instagram</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Try carousel posts for product showcases</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInsights;
