
import React from 'react';
import { LineChart } from 'lucide-react';

const ContentPerformance = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Content Performance</h1>
      <p className="text-gray-400 mb-8">
        Track how your content is performing across different platforms.
      </p>
      
      <div className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Generated Content Analytics</h2>
        <p className="text-gray-400 mb-6">
          This feature will show performance metrics for all content generated through Viralin AI.
        </p>
        
        <div className="text-center py-8">
          <LineChart className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Connect your social accounts to start tracking content performance.</p>
        </div>
      </div>
    </div>
  );
};

export default ContentPerformance;
