import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// This component is deprecated since we're now using Supabase for requests
// Keeping it for backwards compatibility but it no longer has functionality
export const TestRequestSection = () => {
  return (
    <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-2">Test Requests</h3>
      <p className="text-sm text-gray-400 mb-4">
        Test requests are now created through the AI generators (Video/Image).
        Use those tools to create generation requests.
      </p>
      <Button variant="outline" disabled className="w-full">
        Create requests via AI Generator
      </Button>
    </Card>
  );
};
