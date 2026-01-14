import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';

const GenerateBrandIdentity = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Generate Brand Identity</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Create comprehensive brand identity assets with AI
        </p>
      </div>

      <Card className="p-4 md:p-6">
        <CardHeader className="p-0 pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Palette className="w-4 h-4 md:w-5 md:h-5" />
            Brand Identity Studio
          </CardTitle>
          <CardDescription className="text-sm">
            Coming soon: AI-powered brand identity generation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm md:text-base text-muted-foreground">
            This feature is currently under development. Stay tuned for AI-powered brand identity creation tools!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateBrandIdentity;
