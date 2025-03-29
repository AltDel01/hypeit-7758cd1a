
import React from 'react';

interface MarketAudiencePageProps {
  coreServices: string;
  audience: string;
  market: string;
  goals: string;
  selectedColors: string[];
  selectedFont: string;
  productPhotos: File[];
}

const MarketAudiencePage: React.FC<MarketAudiencePageProps> = ({
  coreServices,
  audience,
  market,
  goals,
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
        <h2 className="text-2xl font-bold mb-8 pb-2 border-b-2" style={{ borderColor: selectedColors[1] }}>
          Market & Audience
        </h2>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">Core Services/Products</h3>
            <p className="whitespace-pre-line">{coreServices}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Target Audience</h3>
            <p className="whitespace-pre-line">{audience}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">Market</h3>
            <p className="whitespace-pre-line">{market}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Goals</h3>
            <p className="whitespace-pre-line">{goals}</p>
          </div>
        </div>
        
        {productPhotos.length > 3 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            {productPhotos.slice(3).map((photo, index) => (
              <img 
                key={index}
                src={URL.createObjectURL(photo)} 
                alt={`Product ${index + 4}`} 
                className="rounded-lg shadow-md w-full h-32 object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAudiencePage;
