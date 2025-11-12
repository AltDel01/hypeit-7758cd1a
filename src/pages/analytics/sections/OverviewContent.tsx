
import React from 'react';
import { LineChart, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const OverviewContent = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Analytics Overview</h1>
      <p className="text-gray-400 mb-8">
        Monitor and analyze your performance across all platforms.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Social Media Performance</h2>
          <p className="text-gray-400">
            Track engagement, follower growth, and reach across your social platforms.
          </p>
          
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" className="opacity-70">
              <BarChart className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </Card>
        
        <Card className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Content Analytics</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Generated Content</span>
                <span className="text-white">4</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-[40%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Brand Assets</span>
                <span className="text-white">2</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full w-[20%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Active Campaigns</span>
                <span className="text-white">1</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[10%]"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewContent;
