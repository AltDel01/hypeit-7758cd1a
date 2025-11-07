import React from 'react';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';

const AICreatorGenerator = () => {
  return (
    <Card className="p-12 bg-background/60 backdrop-blur-sm border-slate-700">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <Bot className="w-16 h-16 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">AI Creator</h2>
        <p className="text-muted-foreground max-w-md">
          Advanced AI content creation tools coming soon. Leverage AI to create engaging content automatically.
        </p>
      </div>
    </Card>
  );
};

export default AICreatorGenerator;
