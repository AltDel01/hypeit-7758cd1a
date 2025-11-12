
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const TrendingTopicsSidebar: React.FC = () => {
  return (
    <div className="col-span-2 p-6 bg-transparent overflow-y-auto max-h-screen">
      <div className="space-y-5">
        <div className="rounded-lg overflow-hidden bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-3">Trending Topics</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <span>#SustainableFashion</span>
              <span className="text-green-400">+128%</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <span>#WellnessWednesday</span>
              <span className="text-green-400">+95%</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <span>#ProductivityHacks</span>
              <span className="text-green-400">+82%</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <span>#RemoteWork</span>
              <span className="text-green-400">+67%</span>
            </li>
          </ul>
        </div>
        
        <div className="rounded-lg overflow-hidden bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-3">Content Pillar Example</h3>
          <div className="bg-gray-800 rounded-md p-3 mb-3">
            <h4 className="text-[#8c52ff] text-sm font-medium mb-2">Educational Content</h4>
            <ul className="pl-5 text-gray-300 text-sm space-y-1 list-disc">
              <li>Industry insights and trends</li>
              <li>How-to guides and tutorials</li>
              <li>Expert interviews and tips</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button variant="link" size="sm" className="text-[#8c52ff] p-0">
              See more examples <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingTopicsSidebar;
