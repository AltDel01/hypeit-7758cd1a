
import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CampaignAnalytics: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Campaign Analytics</h1>
      <p className="text-gray-400 mb-8">
        Track and optimize your marketing campaigns with detailed analytics and insights.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Campaign Performance</h2>
          <p className="text-gray-400">
            Campaign analytics features will be available in the next update.
            Connect your marketing platforms to get insights about your campaign performance.
          </p>
          
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" disabled className="opacity-70">
              <BarChart2 className="mr-2 h-4 w-4" />
              Feature Coming Soon
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border border-gray-700 p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Campaign Metrics</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="text-white">--%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full"></div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Click-through Rate</span>
                <span className="text-white">--%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full"></div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Cost per Acquisition</span>
                <span className="text-white">--$</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
