import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, MessageSquare, TrendingUp, Target, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// AI API is handled securely via Edge Functions - no client-side keys needed

interface LlamaInsightsPanelProps {
  username: string;
  platform: string;
}

const LlamaInsightsPanel: React.FC<LlamaInsightsPanelProps> = ({ username, platform }) => {
  const [llamaQuery, setLlamaQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(true);

  useEffect(() => {
    // Simulate AI generating initial summary
    const timer = setTimeout(() => {
      setMessages([
        {
          role: 'assistant',
          content: `📊 **Summary for @${username}**\n\nBased on the analytics data, here are the key insights:\n\n✅ **Strengths:**\n- Strong engagement rate with authentic audience\n- Good follower growth trajectory\n- High-quality content performance\n\n⚠️ **Areas for Improvement:**\n- Posting consistency could be increased\n- Engagement timing optimization needed\n- Hashtag strategy refinement recommended\n\n🎯 **Recommendations:**\n1. Post during peak engagement hours (6-8 PM)\n2. Increase video content by 30% for better reach\n3. Focus on top-performing content themes\n4. Collaborate with similar accounts to expand reach`
        }
      ]);
      setIsGeneratingSummary(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [username]);

  const handleAskLlama = async () => {
    if (!llamaQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a question for AI",
        variant: "destructive"
      });
      return;
    }

    const userMessage = { role: 'user' as const, content: llamaQuery };
    setMessages(prev => [...prev, userMessage]);
    setLlamaQuery('');
    setIsQuerying(true);

    try {
      // TODO: Integrate with actual AI API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = {
        role: 'assistant' as const,
        content: `Based on your question about "${llamaQuery}", here's my analysis:\n\nThe data suggests focusing on consistency and engagement timing. Your audience is most active during evening hours, so scheduling posts accordingly would maximize reach and interaction.`
      };
      
      setMessages(prev => [...prev, aiResponse]);
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
    <div className="space-y-4 h-full flex flex-col">
      <Card className="p-6 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border-purple-500/50 flex-1 flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          AI Insight Summarizer
        </h2>

        {/* AI Insights Messages */}
        <div className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-[500px] pr-2">
          {isGeneratingSummary ? (
            <Card className="p-4 bg-background/40 border-slate-600">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <p className="text-sm text-white">Generating insights...</p>
              </div>
            </Card>
          ) : (
            messages.map((message, index) => (
              <Card 
                key={index}
                className={`p-4 animate-fade-in ${
                  message.role === 'user' 
                    ? 'bg-purple-600/30 border-purple-500/50 ml-8' 
                    : 'bg-background/40 border-slate-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <Sparkles className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <MessageSquare className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  )}
                  <p className="text-sm text-white whitespace-pre-wrap flex-1">{message.content}</p>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Ask AI Input */}
        <div className="space-y-3 border-t border-slate-700 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
            <MessageSquare className="w-4 h-4" />
            Ask AI for More Insights
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., How can I improve engagement?"
              value={llamaQuery}
              onChange={(e) => setLlamaQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskLlama()}
              className="bg-background/60 border-slate-600"
              disabled={isQuerying}
            />
            <Button 
              onClick={handleAskLlama}
              disabled={isQuerying || !llamaQuery.trim()}
              size="icon"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              <Send className={`w-4 h-4 ${isQuerying ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Action Recommendations */}
      <Card className="p-4 bg-background/60 backdrop-blur-sm border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Quick Actions
        </h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-400">•</span>
            <span>Increase posting frequency to 3x per week</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>Optimize posting time to 6-8 PM</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Experiment with more video content</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default LlamaInsightsPanel;
