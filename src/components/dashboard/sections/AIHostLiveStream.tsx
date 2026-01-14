import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

const AIHostLiveStream = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">AI Host Live Stream</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Create and manage AI-powered live streaming content
        </p>
      </div>

      <Card className="p-4 md:p-6">
        <CardHeader className="p-0 pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Video className="w-4 h-4 md:w-5 md:h-5" />
            AI Live Stream Studio
          </CardTitle>
          <CardDescription className="text-sm">
            Coming soon: AI-powered live streaming features
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm md:text-base text-muted-foreground">
            This feature is currently under development. Stay tuned for exciting AI live streaming capabilities!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIHostLiveStream;
