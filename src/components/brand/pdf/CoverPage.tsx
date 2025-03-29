
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
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
        style={{ fontFamily: selectedFont }}
      >
        {brandLogo && (
          <div className="mb-8">
            <img 
              src={URL.createObjectURL(brandLogo)} 
              alt="Brand Logo" 
              className="max-h-36"
            />
          </div>
        )}
        
        <h1 className="text-4xl font-bold mb-4">
          {businessName}
        </h1>
        
        <h2 className="text-xl mb-8">Brand Identity Guidelines</h2>
        
        <div className="flex space-x-4 mb-8">
          {selectedColors.map((color, index) => (
            <div 
              key={index}
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
        
        {productPhotos.length > 0 && (
          <div className="mt-8">
            <img 
              src={URL.createObjectURL(productPhotos[0])} 
              alt="Featured Product" 
              className="max-h-48 rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverPage;
