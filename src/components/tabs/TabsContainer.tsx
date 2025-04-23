
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTabs } from '@/hooks/useTabs';
import VisualSettings from './VisualSettings';
import ContentRenderer from './ContentRenderer';

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
  const {
    selectedAspectRatio,
    selectedImagesPerBatch,
    setSelectedImagesPerBatch,
    visualMenuOpen,
    setVisualMenuOpen,
    writerMenuOpen,
    setWriterMenuOpen,
    handleAspectRatioSelect,
    handleWriterOptionSelect
  } = useTabs();

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DropdownMenu open={visualMenuOpen} onOpenChange={setVisualMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors">
              <span>Social Media Visual</span>
              <ChevronDown className="ml-2 h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full border border-gray-700 z-50">
            <VisualSettings
              selectedAspectRatio={selectedAspectRatio}
              selectedImagesPerBatch={selectedImagesPerBatch}
              onAspectRatioSelect={(ratio) => handleAspectRatioSelect(ratio, setActiveTab)}
              onImagesPerBatchSelect={setSelectedImagesPerBatch}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu open={writerMenuOpen} onOpenChange={setWriterMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors">
              <span>Ghost Writer</span>
              <ChevronDown className="ml-2 h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-gray-800 border border-gray-700 z-50">
            {[
              { id: 'x', icon: () => (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-white mr-2">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )},
              { id: 'linkedin', label: 'LinkedIn', icon: () => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 00.1.47V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                </svg>
              )},
              { id: 'blog', label: 'Blog', icon: () => null }
            ].map(({ id, label, icon: Icon }) => (
              <DropdownMenuItem
                key={id}
                onClick={() => handleWriterOptionSelect(id, setActiveTab)}
                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex items-center justify-center w-full py-3">
                  {Icon && <Icon />}
                  {label && <span>{label}</span>}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ContentRenderer
        activeTab={activeTab}
        prompt={prompt}
        setPrompt={setPrompt}
        productImage={productImage}
        setProductImage={setProductImage}
        isGenerating={isGenerating}
        generateImage={generateImage}
        setXText={setXText}
        setLinkedinText={setLinkedinText}
        generatedImage={generatedImage}
      />
    </div>
  );
};

export default TabsContainer;

