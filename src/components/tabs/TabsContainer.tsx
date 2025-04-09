
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import VisualContentMenu from './visual/VisualContentMenu';
import WriterMenuItems from './writer/WriterMenuItems';
import ActiveTabContent from './content/ActiveTabContent';

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
  
  const [selectedWriterOption, setSelectedWriterOption] = useState('x');

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DropdownMenu open={visualMenuOpen} onOpenChange={setVisualMenuOpen}>
          <DropdownMenuTrigger className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors">
            <span>Social Media Visual</span>
            <ChevronDown className="ml-2 h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full border border-gray-700 z-50">
            <VisualContentMenu 
              selectedAspectRatio={selectedAspectRatio}
              handleAspectRatioSelect={handleAspectRatioSelect}
              selectedImagesPerBatch={selectedImagesPerBatch}
              setSelectedImagesPerBatch={setSelectedImagesPerBatch}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu open={writerMenuOpen} onOpenChange={setWriterMenuOpen}>
          <DropdownMenuTrigger className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors">
            <span>Ghost Writer</span>
            <ChevronDown className="ml-2 h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-gray-800 border border-gray-700 z-50">
            <WriterMenuItems handleWriterOptionSelect={handleWriterOptionSelect} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ActiveTabContent
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
