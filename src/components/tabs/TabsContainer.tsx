
import React, { useState } from 'react';
import MediaTabContent from './MediaTabContent';
import XPostForm from '@/components/social/XPostForm';
import LinkedInPostForm from '@/components/social/LinkedInPostForm';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TabsContainerProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  generateImage: () => void;
  setXText: React.Dispatch<React.SetStateAction<string>>;
  setLinkedinText: React.Dispatch<React.SetStateAction<string>>;
  generatedImage: string | null;
}

const TabsContainer = ({
  activeTab,
  setActiveTab,
  prompt,
  setPrompt,
  productImage,
  setProductImage,
  isGenerating,
  generateImage,
  setXText,
  setLinkedinText,
  generatedImage
}: TabsContainerProps) => {
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [selectedImagesPerBatch, setSelectedImagesPerBatch] = useState(1);
  const [selectedWriterOption, setSelectedWriterOption] = useState('x');
  const [visualMenuOpen, setVisualMenuOpen] = useState(false);
  const [writerMenuOpen, setWriterMenuOpen] = useState(false);
  
  const handleAspectRatioSelect = (ratio: string) => {
    setSelectedAspectRatio(ratio);
    setActiveTab(ratio === '1:1' ? 'feed' : 'story');
  };
  
  const handleWriterOptionSelect = (option: string) => {
    setSelectedWriterOption(option);
    setActiveTab(option);
    setWriterMenuOpen(false);
  };
  
  const renderVisualContent = () => {
    return (
      <div className="p-4 bg-gray-800">
        <div className="mb-6">
          <div className="text-sm font-medium text-white mb-3">Aspect Ratio</div>
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="aspectRatio" 
                checked={selectedAspectRatio === '1:1'} 
                onChange={() => handleAspectRatioSelect('1:1')}
                className="sr-only"
              />
              <div className={`p-2 border ${selectedAspectRatio === '1:1' ? 'border-blue-500' : 'border-gray-600'} rounded-md flex items-center`}>
                <div className="w-10 h-10 bg-gray-600"></div>
                <span className="ml-2">1:1</span>
              </div>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="aspectRatio" 
                checked={selectedAspectRatio === '9:16'} 
                onChange={() => handleAspectRatioSelect('9:16')}
                className="sr-only"
              />
              <div className={`p-2 border ${selectedAspectRatio === '9:16' ? 'border-blue-500' : 'border-gray-600'} rounded-md flex items-center`}>
                <div className="w-6 h-10 bg-gray-600"></div>
                <span className="ml-2">9:16</span>
              </div>
            </label>
          </div>
          
          <div className="text-sm font-medium text-white mb-3">Images Per Batch</div>
          <div className="flex gap-2 mb-4">
            {[1, 3, 15, 25].map((count, index) => (
              <button
                key={count}
                onClick={() => setSelectedImagesPerBatch(count)}
                className={`rounded-full px-5 py-2 ${selectedImagesPerBatch === count ? 'bg-gray-600' : 'bg-gray-800 border border-gray-600'} ${index > 1 ? 'flex items-center' : ''}`}
              >
                <span>{count}</span>
                {index > 1 && (
                  <span className="ml-1 text-yellow-400">💎</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderActiveContent = () => {
    if (activeTab === 'feed' || activeTab === 'story') {
      return (
        <MediaTabContent
          prompt={prompt}
          setPrompt={setPrompt}
          productImage={productImage}
          setProductImage={setProductImage}
          isGenerating={isGenerating}
          generateImage={generateImage}
          generatedImage={generatedImage}
        />
      );
    } else if (activeTab === 'x') {
      return (
        <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
          <h2 className="text-lg font-bold text-white mb-4">Generate Your X Post</h2>
          <XPostForm onGeneratePost={setXText} />
        </div>
      );
    } else if (activeTab === 'linkedin') {
      return (
        <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
          <h2 className="text-lg font-bold text-white mb-4">Generate Your LinkedIn Post</h2>
          <LinkedInPostForm onGeneratePost={setLinkedinText} />
        </div>
      );
    } else if (activeTab === 'blog') {
      return (
        <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
          <h2 className="text-lg font-bold text-white mb-4">Generate Your Blog Post</h2>
          <p className="text-gray-400 text-center">Blog post generation coming soon</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DropdownMenu open={visualMenuOpen} onOpenChange={setVisualMenuOpen}>
          <DropdownMenuTrigger className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors">
            <span>Social Media Visual</span>
            <ChevronDown className="ml-2 h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-gray-800 border border-gray-700 z-50">
            {renderVisualContent()}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu open={writerMenuOpen} onOpenChange={setWriterMenuOpen}>
          <DropdownMenuTrigger className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors">
            <span>Ghost Writer</span>
            <ChevronDown className="ml-2 h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-gray-800 border border-gray-700 z-50">
            <DropdownMenuItem onClick={() => handleWriterOptionSelect('x')} className="text-gray-300 hover:bg-gray-700 cursor-pointer">
              <div className="flex items-center justify-center w-full py-3">
                <svg 
                  viewBox="0 0 24 24" 
                  width="18" 
                  height="18" 
                  fill="currentColor"
                  className="mr-2"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleWriterOptionSelect('linkedin')} className="text-gray-300 hover:bg-gray-700 cursor-pointer">
              <div className="flex items-center justify-center w-full py-3">
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="mr-2"
                >
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 00.1.47V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                </svg>
                <span>LinkedIn</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleWriterOptionSelect('blog')} className="text-gray-300 hover:bg-gray-700 cursor-pointer">
              <div className="flex items-center justify-center w-full py-3">
                <span>Blog</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {renderActiveContent()}
    </div>
  );
};

export default TabsContainer;
