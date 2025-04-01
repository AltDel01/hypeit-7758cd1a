
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ViralityStrategyData } from '@/hooks/useViralityStrategyForm';

// Import PDF components from the pdf directory
import CoverPage from './CoverPage';
import BusinessOverviewPage from './BusinessOverviewPage';
import AudiencePage from './AudiencePage';
import ContentStrategyPage from './ContentStrategyPage';
import EngagementPage from './EngagementPage';
import PDFPreviewContainer from './PDFPreviewContainer';

interface PDFGeneratorProps {
  strategyData: ViralityStrategyData;
  onBack: () => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  strategyData,
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
      pdf.save(`${strategyData.businessInfo.businessName.replace(/\s+/g, '-')}-virality-strategy.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <PDFControls onGeneratePDF={generatePDF} onBack={onBack} />
      <PDFPreviewContainer ref={pdfRef}>
        <CoverPage 
          businessName={strategyData.businessInfo.businessName}
          tagline={strategyData.businessInfo.tagline}
        />
        
        <BusinessOverviewPage 
          businessInfo={strategyData.businessInfo}
          toneOfVoice={strategyData.toneOfVoice}
        />
        
        <AudiencePage 
          audience={strategyData.audience}
          competitors={strategyData.competitors}
        />
        
        <ContentStrategyPage 
          contentPillars={strategyData.contentPillars}
          marketingFunnel={strategyData.marketingFunnel}
          influencerStrategy={strategyData.influencerStrategy}
        />
        
        <EngagementPage 
          engagementStrategy={strategyData.engagementStrategy}
          seoStrategy={strategyData.seoStrategy}
          socialMediaRecommendation={strategyData.socialMediaRecommendation}
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
