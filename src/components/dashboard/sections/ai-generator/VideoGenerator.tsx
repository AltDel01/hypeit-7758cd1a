import React from 'react';
import { Video } from 'lucide-react';
import { Card } from '@/components/ui/card';

const VideoGenerator = () => {
  return (
    <Card className="p-12 bg-background/60 backdrop-blur-sm border-slate-700">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <Video className="w-16 h-16 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Video Generator</h2>
        <p className="text-muted-foreground max-w-md">
          AI-powered video generation coming soon. Create stunning video content for your social media.
        </p>
      </div>
    </Card>
  );
};

export default VideoGenerator;
