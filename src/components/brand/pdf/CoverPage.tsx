
import React from 'react';

interface CoverPageProps {
  businessName: string;
  brandLogo: File | null;
  selectedColors: string[];
  selectedFont: string;
  productPhotos: File[];
}

const CoverPage: React.FC<CoverPageProps> = ({
  businessName,
  brandLogo,
  selectedColors,
  selectedFont,
  productPhotos
}) => {
  // Create a dynamic gradient based on selected colors
  const gradientStyle = {
    background: selectedColors.length >= 2 
      ? `linear-gradient(135deg, ${selectedColors[0]} 0%, ${selectedColors[1]} 100%)`
      : selectedColors[0]
  };

  // Get the first product photo to feature on the cover
  const featuredPhoto = productPhotos.length > 0 ? productPhotos[0] : null;

  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-24" style={gradientStyle}></div>
      
      {/* Main content - centered with more spacing */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center"
        style={{ fontFamily: selectedFont }}
      >
        {/* Logo with enhanced presentation */}
        {brandLogo && (
          <div className="mb-10 p-6 bg-white rounded-full shadow-lg">
            <img 
              src={URL.createObjectURL(brandLogo)} 
              alt="Brand Logo" 
              className="max-h-40 max-w-40"
            />
          </div>
        )}
        
        {/* Business name - larger and more prominent */}
        <h1 className="text-5xl font-bold mb-6 tracking-tight">
          {businessName}
        </h1>
        
        {/* Subtitle with decorative line */}
        <div className="flex items-center justify-center w-full mb-10">
          <div className="h-0.5 w-16 bg-gray-300"></div>
          <h2 className="text-2xl font-light mx-4 text-gray-700">Brand Identity Guidelines</h2>
          <div className="h-0.5 w-16 bg-gray-300"></div>
        </div>
        
        {/* Color swatches in a more stylish layout */}
        <div className="flex items-center justify-center space-x-6 mb-12">
          {selectedColors.map((color, index) => (
            <div 
              key={index}
              className="w-16 h-16 rounded-full shadow-md transform transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
        
        {/* Featured image in stylish frame */}
        {featuredPhoto && (
          <div className="mt-8 relative">
            <div className="absolute inset-0 transform rotate-3 bg-gray-200 rounded-lg"></div>
            <img 
              src={URL.createObjectURL(featuredPhoto)} 
              alt="Featured Product" 
              className="relative z-10 max-h-48 rounded-lg shadow-lg object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Decorative bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={gradientStyle}></div>
    </div>
  );
};

export default CoverPage;
