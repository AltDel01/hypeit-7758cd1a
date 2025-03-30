
import React from 'react';

interface ImageGalleryProps {
  feedImages: string[];
  storyImages: string[];
  generatedImage: string | null;
  activeTab: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  feedImages, 
  storyImages, 
  generatedImage, 
  activeTab 
}) => {
  const images = activeTab === 'feed' ? feedImages : storyImages;
  const scrollAnimationClass = activeTab === 'feed' 
    ? 'animate-feed-scroll-down' 
    : 'animate-story-scroll-up';
  
  const containerHeight = "calc(100vh - 77px)"; // Navbar height is 77px
  
  return (
    <div className="h-full bg-gray-900 bg-opacity-50 overflow-hidden border-l border-gray-800">
      <div 
        className="h-full overflow-hidden relative py-4 px-6"
        style={{ height: containerHeight }}
      >
        {generatedImage && (
          <div className="absolute top-4 left-0 right-0 z-20 px-6">
            <div className="bg-gray-900 border border-[#8c52ff] rounded-md overflow-hidden mb-4 opacity-100 shadow-lg">
              <div className="bg-[#8c52ff] px-3 py-1.5 text-white text-sm">
                Your Generated Content
              </div>
              <div className="p-3 flex justify-center">
                <img 
                  src={generatedImage} 
                  alt="Generated content" 
                  className={`max-h-[300px] ${activeTab === 'feed' ? 'aspect-square' : 'aspect-[9/16]'} object-contain rounded-sm`}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Gallery of example images */}
        <div 
          className={`flex flex-wrap justify-center gap-4 ${scrollAnimationClass} pt-${generatedImage ? '64' : '0'}`}
          style={{ paddingTop: generatedImage ? '320px' : '0' }}
        >
          {images.concat(images).map((src, index) => (
            <div 
              key={index} 
              className={`relative mb-4 rounded-md overflow-hidden border border-gray-800 ${
                activeTab === 'feed' ? 'w-[280px] h-[280px]' : 'w-[160px] h-[280px]'
              }`}
            >
              <img 
                src={src} 
                alt={`Example content ${index + 1}`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
