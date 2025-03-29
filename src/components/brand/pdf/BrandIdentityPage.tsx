
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
      {/* Page header with gradient accent */}
      <div 
        className="h-16 w-full"
        style={{ backgroundColor: selectedColors[2] }}
      ></div>
      
      <div 
        className="p-12 pt-6"
        style={{ fontFamily: selectedFont }}
      >
        <h2 className="text-3xl font-bold mb-8 pb-2 flex items-center" style={{ color: selectedColors[2] }}>
          <div className="w-10 h-1 bg-gray-300 mr-3"></div>
          Brand Identity Elements
        </h2>
        
        {/* Colors section with more sophisticated display */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[2] }}></div>
            Brand Colors
          </h3>
          <div className="grid grid-cols-3 gap-8">
            {selectedColors.map((color, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-24 h-24 mx-auto rounded-lg mb-3 shadow-md transform transition-transform hover:scale-105 duration-300"
                  style={{ backgroundColor: color }}
                ></div>
                <p className="font-mono text-sm bg-gray-100 inline-block px-3 py-1 rounded">{color.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Typography section with better samples */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[2] }}></div>
            Typography
          </h3>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <p className="text-lg mb-4 font-medium border-b pb-3">Primary Font: <span className="text-gray-700">{selectedFont}</span></p>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Heading 1</p>
                <p style={{ fontFamily: selectedFont, fontWeight: 700 }} className="text-4xl">
                  {businessName}
                </p>
              </div>
              
              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Heading 2</p>
                <p style={{ fontFamily: selectedFont, fontWeight: 600 }} className="text-2xl">
                  About Our Brand
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Body Text</p>
                <p style={{ fontFamily: selectedFont }} className="text-base leading-relaxed">
                  This shows how the typography looks in a paragraph format.
                  The right font choice establishes your brand's personality and impacts readability.
                  Consistency in typography helps create a cohesive brand identity.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logo section with elegant presentation */}
        {brandLogo && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <div className="w-2 h-6 mr-2 rounded-sm" style={{ backgroundColor: selectedColors[2] }}></div>
              Logo
            </h3>
            
            <div className="flex justify-center">
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                <img 
                  src={URL.createObjectURL(brandLogo)} 
                  alt="Brand Logo" 
                  className="max-h-40"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandIdentityPage;
