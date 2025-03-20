
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

const Virality = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navbar />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-0">
        {/* Main content area - 3/5 width */}
        <div className="col-span-3 p-8 border-r border-gray-800">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Boost Your Content Virality</h1>
            
            <div className="mb-8">
              <div className="rounded-md border border-gray-700 p-6 bg-gray-900">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Target Audience</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                      <option value="">Select your target audience</option>
                      <option value="gen-z">Gen Z (18-24)</option>
                      <option value="millennials">Millennials (25-40)</option>
                      <option value="gen-x">Gen X (41-56)</option>
                      <option value="boomers">Baby Boomers (57-75)</option>
                      <option value="custom">Custom Demographics</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Content Theme</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                      <option value="">Select content theme</option>
                      <option value="educational">Educational</option>
                      <option value="entertaining">Entertaining</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="promotional">Promotional</option>
                      <option value="trending">Trending Topics</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Campaign Goal</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                      <option value="">Select your campaign goal</option>
                      <option value="awareness">Brand Awareness</option>
                      <option value="engagement">Increase Engagement</option>
                      <option value="conversion">Drive Conversions</option>
                      <option value="loyalty">Customer Loyalty</option>
                      <option value="leads">Generate Leads</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Strategy Focus</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <input type="checkbox" id="hashtags" className="mr-2" />
                        <label htmlFor="hashtags" className="text-gray-300">Trending Hashtags</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="challenges" className="mr-2" />
                        <label htmlFor="challenges" className="text-gray-300">Viral Challenges</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="collaborations" className="mr-2" />
                        <label htmlFor="collaborations" className="text-gray-300">Influencer Collaborations</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="timing" className="mr-2" />
                        <label htmlFor="timing" className="text-gray-300">Optimal Posting Times</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Generate Virality Strategy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Virality examples - 2/5 width */}
        <div className="col-span-2 p-6 bg-[#121212] overflow-y-auto max-h-screen">
          <div className="space-y-5">
            <div className="rounded-lg overflow-hidden bg-gray-900 p-4">
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
            
            <div className="rounded-lg overflow-hidden bg-gray-900 p-4">
              <h3 className="text-white font-medium mb-3">Virality Case Study</h3>
              <img 
                src="https://images.unsplash.com/photo-1611162616475-46592b321512?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                alt="Viral campaign example" 
                className="w-full rounded-md mb-3" 
              />
              <p className="text-gray-400 text-sm">
                A successful campaign that generated 2.5M views and 150K shares by leveraging
                user-generated content and a branded hashtag challenge.
              </p>
            </div>
            
            <div className="rounded-lg overflow-hidden bg-gray-900 p-4">
              <h3 className="text-white font-medium mb-3">Performance Metrics</h3>
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="text-white">8.5%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Share Rate</span>
                    <span className="text-white">12.3%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-purple-500 rounded-full" style={{ width: '63%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-white">3.7%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '37%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Virality;
