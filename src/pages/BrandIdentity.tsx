
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Upload, ArrowUp } from 'lucide-react';

const BrandIdentity = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navbar />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-0">
        {/* Main content area - 3/5 width */}
        <div className="col-span-3 p-8 border-r border-gray-800">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Create Your Brand Identity</h1>
            
            <div className="mb-8">
              <div className="rounded-md border border-gray-700 p-6 bg-gray-900">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Brand Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      placeholder="Enter your brand name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Brand Description</label>
                    <textarea 
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white h-24"
                      placeholder="Describe your brand in a few sentences..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Brand Logo (Optional)</label>
                    <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-md">
                      <div className="text-center">
                        <Upload size={32} className="text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Drop your logo here or</p>
                        <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">Upload Logo</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Industry</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                      <option value="">Select your industry</option>
                      <option value="tech">Technology</option>
                      <option value="food">Food & Beverage</option>
                      <option value="health">Health & Wellness</option>
                      <option value="fashion">Fashion & Apparel</option>
                      <option value="education">Education</option>
                      <option value="finance">Finance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Generate Brand Identity
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Example brand identities - 2/5 width */}
        <div className="col-span-2 p-6 bg-[#121212] overflow-y-auto max-h-screen">
          <div className="grid grid-cols-1 gap-5">
            <div className="rounded-lg overflow-hidden bg-gray-900 p-4">
              <h3 className="text-white font-medium mb-3">Sample Brand Identity</h3>
              <img 
                src="https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                alt="Brand identity example" 
                className="w-full rounded-md mb-3" 
              />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-8 rounded-md" 
                    style={{ backgroundColor: ['#FF6B6B', '#4ECDC4', '#1A535C', '#F7FFF7'][i] }}
                  />
                ))}
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden bg-gray-900 p-4">
              <h3 className="text-white font-medium mb-3">Sample Brand Guidelines</h3>
              <img 
                src="https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Brand guidelines example" 
                className="w-full rounded-md" 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandIdentity;
