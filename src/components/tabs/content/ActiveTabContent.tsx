
import React from 'react';
import MediaTabContent from '../MediaTabContent';
import XPostForm from '@/components/social/XPostForm';
import LinkedInPostForm from '@/components/social/LinkedInPostForm';

interface ActiveTabContentProps {
  activeTab: string;
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

const ActiveTabContent = ({
  activeTab,
  prompt,
  setPrompt,
  productImage,
  setProductImage,
  isGenerating,
  generateImage,
  setXText,
  setLinkedinText,
  generatedImage
}: ActiveTabContentProps) => {
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

export default ActiveTabContent;
