
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
      <div 
        className="p-12"
        style={{ fontFamily: selectedFont }}
      >
        <h2 className="text-2xl font-bold mb-8 pb-2 border-b-2" style={{ borderColor: selectedColors[0] }}>
          Brand Story & Vision
        </h2>
        
        <h3 className="text-xl font-semibold mb-2">Our Story</h3>
        <p className="mb-6 whitespace-pre-line">{brandStory}</p>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">Vision</h3>
            <p className="whitespace-pre-line">{vision}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Mission</h3>
            <p className="whitespace-pre-line">{mission}</p>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Core Values</h3>
        <p className="mb-8 whitespace-pre-line">{coreValues}</p>
        
        {productPhotos.length > 1 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {productPhotos.slice(1, 3).map((photo, index) => (
              <img 
                key={index}
                src={URL.createObjectURL(photo)} 
                alt={`Product ${index + 2}`} 
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandStoryPage;
