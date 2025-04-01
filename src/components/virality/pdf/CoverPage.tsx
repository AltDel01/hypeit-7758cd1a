
import React from 'react';

interface CoverPageProps {
  businessName: string;
  tagline: string;
}

const CoverPage: React.FC<CoverPageProps> = ({
  businessName,
  tagline
}) => {
  return (
    <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#8c52ff] to-[#D946EF]"></div>
      
      {/* Main content - centered with more spacing */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center">
        {/* Brand symbol */}
        <div className="mb-12 w-24 h-24 rounded-full bg-gradient-to-br from-[#8c52ff] to-[#D946EF] flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <svg className="w-12 h-12 text-[#8c52ff]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L19 6V18L12 22L5 18V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 6L12 10L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 10L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        {/* Business name - larger and more prominent */}
        <h1 className="text-5xl font-bold mb-6 tracking-tight">
          {businessName}
        </h1>
        
        {/* Tagline */}
        <p className="text-xl text-gray-600 mb-8">{tagline}</p>
        
        {/* Subtitle with decorative line */}
        <div className="flex items-center justify-center w-full mb-10">
          <div className="h-0.5 w-16 bg-gray-300"></div>
          <h2 className="text-2xl font-light mx-4 text-gray-700">Virality Strategy</h2>
          <div className="h-0.5 w-16 bg-gray-300"></div>
        </div>
        
        {/* Graphic elements */}
        <div className="flex justify-center space-x-4 mt-8">
          {[1, 2, 3].map((_, index) => (
            <div 
              key={index}
              className="w-16 h-16 rounded-lg transform transition-transform"
              style={{ 
                backgroundColor: index === 0 ? '#8c52ff' : index === 1 ? '#9b87f5' : '#D946EF',
                transform: `rotate(${index * 15}deg)`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Decorative bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-r from-[#D946EF] to-[#8c52ff]"></div>
    </div>
  );
};

export default CoverPage;
