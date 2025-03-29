
import React from 'react';

interface BrandStoryPageProps {
  brandStory: string;
  vision: string;
  mission: string;
  coreValues: string;
  selectedColors: string[];
  selectedFont: string;
  productPhotos: File[];
}

const BrandStoryPage: React.FC<BrandStoryPageProps> = ({
  brandStory,
  vision,
  mission,
  coreValues,
  selectedColors,
  selectedFont,
  productPhotos
}) => {
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      {/* Page header with gradient accent */}
      <div 
        className="h-16 w-full"
        style={{ backgroundColor: selectedColors[0] }}
      ></div>
      
      <div 
        className="p-12 pt-6"
        style={{ fontFamily: selectedFont }}
      >
        <h2 className="text-3xl font-bold mb-8 pb-2 flex items-center" style={{ color: selectedColors[0] }}>
          <div className="w-10 h-1 bg-gray-300 mr-3"></div>
          Brand Story & Vision
        </h2>
        
        {/* Story section with improved typography */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[0] }}></div>
            Our Story
          </h3>
          <p className="mb-6 whitespace-pre-line leading-relaxed">{brandStory}</p>
        </div>
        
        {/* Vision and Mission in stylish cards */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[1] }}></div>
              Vision
            </h3>
            <p className="whitespace-pre-line leading-relaxed">{vision}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[2] }}></div>
              Mission
            </h3>
            <p className="whitespace-pre-line leading-relaxed">{mission}</p>
          </div>
        </div>
        
        {/* Core values in a highlight box */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[0] }}></div>
            Core Values
          </h3>
          <div className="border-l-4 pl-4 py-2" style={{ borderColor: selectedColors[0] }}>
            <p className="whitespace-pre-line leading-relaxed">{coreValues}</p>
          </div>
        </div>
        
        {/* Product photos in a more interesting layout */}
        {productPhotos.length > 1 && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            {productPhotos.slice(1, 3).map((photo, index) => (
              <div key={index} className="relative">
                <div 
                  className="absolute inset-0 transform rotate-1 rounded-lg"
                  style={{ backgroundColor: selectedColors[index % selectedColors.length], opacity: 0.2 }}
                ></div>
                <img 
                  src={URL.createObjectURL(photo)} 
                  alt={`Product ${index + 2}`} 
                  className="relative z-10 rounded-lg shadow-md w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandStoryPage;
