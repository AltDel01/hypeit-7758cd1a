import React from 'react';
import ContentGenerator from './ContentGenerator'; // Assuming ContentGenerator is in the same directory

// Define the props interface for MediaTabContent
interface MediaTabContentProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  productImage: File | null;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  isGenerating: boolean;
  // Add the missing prop type definition needed by ContentGenerator
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>; // <--- ADDED THIS LINE
  generateImage: () => void; // This will be passed to ContentGenerator's onGenerate
  generatedImage: string | null;
}

const MediaTabContent = ({
  prompt,
  setPrompt,
  productImage,
  setProductImage,
  isGenerating,
  setIsGenerating, // <-- Receive the prop
  generateImage,
  generatedImage
}: MediaTabContentProps) => {
  return (
    <div className="mt-6">
      {/* Ensure all required props for ContentGenerator are passed down */}
      <ContentGenerator
        prompt={prompt}
        setPrompt={setPrompt}
        productImage={productImage}
        setProductImage={setProductImage}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating} // <-- Pass the prop down to ContentGenerator
        onGenerate={generateImage}      // Pass generateImage as onGenerate
        generatedImage={generatedImage}
      />
    </div>
  );
};

export default MediaTabContent;