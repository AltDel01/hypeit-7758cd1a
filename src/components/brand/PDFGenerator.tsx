
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDown, ArrowLeft } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface PDFGeneratorProps {
  formData: {
    businessName: string;
    brandStory: string;
    vision: string;
    mission: string;
    coreValues: string;
    coreServices: string;
    audience: string;
    market: string;
    goals: string;
  };
  brandLogo: File | null;
  productPhotos: File[];
  selectedColors: string[];
  selectedFont: string;
  onBack: () => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  formData,
  brandLogo,
  productPhotos,
  selectedColors,
  selectedFont,
  onBack
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const generatePDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      
      // Use html-to-image to convert each page to an image
      const pages = pdfRef.current.querySelectorAll('.pdf-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const image = await toPng(page);
        
        // Add new page for all but the first page
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add the image to the PDF
        pdf.addImage(image, 'PNG', 0, 0, 210, 297);
      }
      
      // Save the PDF
      pdf.save(`${formData.businessName.replace(/\s+/g, '-')}-brand-identity.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-gray-700 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
        </Button>
        <Button
          onClick={generatePDF}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FileDown className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
      
      {/* PDF Preview */}
      <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto overflow-hidden" ref={pdfRef}>
        {/* Cover Page */}
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
              {formData.businessName}
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
        
        {/* Brand Story Page */}
        <div className="pdf-page w-[210mm] h-[297mm] relative overflow-hidden bg-white text-black">
          <div 
            className="p-12"
            style={{ fontFamily: selectedFont }}
          >
            <h2 className="text-2xl font-bold mb-8 pb-2 border-b-2" style={{ borderColor: selectedColors[0] }}>
              Brand Story & Vision
            </h2>
            
            <h3 className="text-xl font-semibold mb-2">Our Story</h3>
            <p className="mb-6 whitespace-pre-line">{formData.brandStory}</p>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Vision</h3>
                <p className="whitespace-pre-line">{formData.vision}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Mission</h3>
                <p className="whitespace-pre-line">{formData.mission}</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Core Values</h3>
            <p className="mb-8 whitespace-pre-line">{formData.coreValues}</p>
            
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
        
        {/* Services & Audience Page */}
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
                <p className="whitespace-pre-line">{formData.coreServices}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Target Audience</h3>
                <p className="whitespace-pre-line">{formData.audience}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Market</h3>
                <p className="whitespace-pre-line">{formData.market}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Goals</h3>
                <p className="whitespace-pre-line">{formData.goals}</p>
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
        
        {/* Brand Identity Elements Page */}
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
                  {formData.businessName}
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
      </div>
    </div>
  );
};
