
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
      {/* Page header with gradient accent */}
      <div 
        className="h-16 w-full"
        style={{ backgroundColor: selectedColors[1] }}
      ></div>
      
      <div 
        className="p-12 pt-6"
        style={{ fontFamily: selectedFont }}
      >
        <h2 className="text-3xl font-bold mb-8 pb-2 flex items-center" style={{ color: selectedColors[1] }}>
          <div className="w-10 h-1 bg-gray-300 mr-3"></div>
          Market & Audience
        </h2>
        
        {/* Services & Audience section with cards */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-t-4" style={{ borderColor: selectedColors[0] }}>
            <h3 className="text-xl font-semibold mb-3">Core Services/Products</h3>
            <p className="whitespace-pre-line leading-relaxed">{coreServices}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-t-4" style={{ borderColor: selectedColors[1] }}>
            <h3 className="text-xl font-semibold mb-3">Target Audience</h3>
            <p className="whitespace-pre-line leading-relaxed">{audience}</p>
          </div>
        </div>
        
        {/* Market & Goals section with cards */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-t-4" style={{ borderColor: selectedColors[2] }}>
            <h3 className="text-xl font-semibold mb-3">Market</h3>
            <p className="whitespace-pre-line leading-relaxed">{market}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-t-4" style={{ borderColor: selectedColors.length > 2 ? selectedColors[0] : selectedColors[0] }}>
            <h3 className="text-xl font-semibold mb-3">Goals</h3>
            <p className="whitespace-pre-line leading-relaxed">{goals}</p>
          </div>
        </div>
        
        {/* Product photos in a stylish gallery */}
        {productPhotos.length > 3 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[1] }}></div>
              Product Gallery
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {productPhotos.slice(3).map((photo, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Product ${index + 4}`} 
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAudiencePage;
