
import React from 'react';

interface BrandIdentityPageProps {
  businessName: string;
  selectedColors: string[];
  selectedFont: string;
  brandLogo: File | null;
}

const BrandIdentityPage: React.FC<BrandIdentityPageProps> = ({
  businessName,
  selectedColors,
  selectedFont,
  brandLogo
}) => {
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      <div 
        className="p-12"
        style={{ fontFamily: selectedFont }}
      >
        <h2 className="text-2xl font-bold mb-8 pb-2 border-b-2" style={{ borderColor: selectedColors[2] }}>
          Brand Identity Elements
        </h2>
        
        <h3 className="text-xl font-semibold mb-4">Brand Colors</h3>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {selectedColors.map((color, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-24 h-24 mx-auto rounded-lg mb-2"
                style={{ backgroundColor: color }}
              ></div>
              <p className="font-mono text-sm">{color.toUpperCase()}</p>
            </div>
          ))}
        </div>
        
        <h3 className="text-xl font-semibold mb-4">Typography</h3>
        <div className="mb-8">
          <p className="text-lg mb-2">Primary Font: {selectedFont}</p>
          <div className="space-y-2">
            <p style={{ fontFamily: selectedFont, fontWeight: 700 }} className="text-3xl">
              {businessName}
            </p>
            <p style={{ fontFamily: selectedFont, fontWeight: 700 }} className="text-xl">
              Heading Example
            </p>
            <p style={{ fontFamily: selectedFont }} className="text-base">
              Body text example. This shows how the typography looks in a paragraph format.
              The right font choice establishes your brand's personality and impacts readability.
            </p>
          </div>
        </div>
        
        {brandLogo && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Logo</h3>
            <div className="flex justify-center">
              <img 
                src={URL.createObjectURL(brandLogo)} 
                alt="Brand Logo" 
                className="max-h-32"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandIdentityPage;
