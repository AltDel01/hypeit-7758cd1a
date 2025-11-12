
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { BrandIdentityFormValues } from '@/types/brand';

// Import PDF components from the pdf directory
import CoverPage from './CoverPage';
import BrandStoryPage from './BrandStoryPage';
import MarketAudiencePage from './MarketAudiencePage';
import BrandIdentityPage from './BrandIdentityPage';
import PDFPreviewContainer from './PDFPreviewContainer';

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
      <PDFPreviewContainer ref={pdfRef}>
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
      </PDFPreviewContainer>
    </div>
  );
};

// Separate component for PDF controls
const PDFControls: React.FC<{
  onGeneratePDF: () => void;
  onBack: () => void;
}> = ({ onGeneratePDF, onBack }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="outline"
        onClick={onBack}
        className="border-gray-700 text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
      </Button>
      <Button
        onClick={onGeneratePDF}
        className="bg-[#8c52ff] hover:bg-[#7a45e6]"
      >
        <FileDown className="mr-2 h-4 w-4" /> Download PDF
      </Button>
    </div>
  );
};

export default PDFGenerator;
