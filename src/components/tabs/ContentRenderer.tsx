
import React from 'react';
import MediaTabContent from './MediaTabContent';
import XPostForm from '@/components/social/XPostForm';
import LinkedInPostForm from '@/components/social/LinkedInPostForm';
import BlogPostForm from '@/components/social/BlogPostForm';

interface ContentRendererProps {
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

const ContentRenderer = ({
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
}: ContentRendererProps) => {
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
  }

  const contentTypes = {
    x: {
      title: "Generate Your X Post",
      Component: XPostForm,
      onGenerate: setXText
    },
    linkedin: {
      title: "Generate Your LinkedIn Post",
      Component: LinkedInPostForm,
      onGenerate: setLinkedinText
    },
    blog: {
      title: "Generate Your Blog Post",
      Component: BlogPostForm,
      onGenerate: (text: string) => console.log('Blog post generated:', text)
    }
  };

  const content = contentTypes[activeTab as keyof typeof contentTypes];
  if (!content) return null;

  const { title, Component, onGenerate } = content;

  return (
    <div className="rounded-md border border-gray-700 p-4 bg-gray-900">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <Component onGeneratePost={onGenerate} />
    </div>
  );
};

export default ContentRenderer;
