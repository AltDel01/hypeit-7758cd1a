
import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { BrandIdentityFormValues } from '@/types/brand';

// Import PDF components
import PDFControls from './PDFControls';
import CoverPage from './CoverPage';
import BrandStoryPage from './BrandStoryPage';
import MarketAudiencePage from './MarketAudiencePage';
import BrandIdentityPage from './BrandIdentityPage';

interface PDFGeneratorProps {
  formData: BrandIdentityFormValues;
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
      <PDFControls onGeneratePDF={generatePDF} onBack={onBack} />
      
      {/* PDF Preview */}
      <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto overflow-hidden" ref={pdfRef}>
        <CoverPage 
          businessName={formData.businessName}
          brandLogo={brandLogo}
          selectedColors={selectedColors}
          selectedFont={selectedFont}
          productPhotos={productPhotos}
        />
        
        <BrandStoryPage 
          brandStory={formData.brandStory}
          vision={formData.vision}
          mission={formData.mission}
          coreValues={formData.coreValues}
          selectedColors={selectedColors}
          selectedFont={selectedFont}
          productPhotos={productPhotos}
        />
        
        <MarketAudiencePage 
          coreServices={formData.coreServices}
          audience={formData.audience}
          market={formData.market}
          goals={formData.goals}
          selectedColors={selectedColors}
          selectedFont={selectedFont}
          productPhotos={productPhotos}
        />
        
        <BrandIdentityPage 
          businessName={formData.businessName}
          selectedColors={selectedColors}
          selectedFont={selectedFont}
          brandLogo={brandLogo}
        />
      </div>
    </div>
  );
};

export default PDFGenerator;
