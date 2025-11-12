import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ViralityStrategyData } from '@/types/virality';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  const generatePDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      setIsGenerating(true);
      
      // Start progress animation
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 20) return prev + 2;
          if (prev < 50) return prev + 1;
          if (prev < 80) return prev + 0.5;
          if (prev < 90) return prev + 0.2;
          return prev;
        });
      }, 200);
      
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
      
      // Complete the progress
      setLoadingProgress(100);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      // Save the PDF
      pdf.save(`${strategyData.businessInfo.businessName.replace(/\s+/g, '-')}-virality-strategy.pdf`);
      
      // Reset generating state after a small delay for smooth UX
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <PDFControls 
        onGeneratePDF={generatePDF} 
        onBack={onBack}
        isGenerating={isGenerating}
      />
      
      <PDFPreviewContainer 
        ref={pdfRef}
        isGenerating={isGenerating}
        loadingProgress={loadingProgress}
      >
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
  isGenerating: boolean;
}> = ({ onGeneratePDF, onBack, isGenerating }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="outline"
        onClick={onBack}
        className="border-gray-700 text-white"
        disabled={isGenerating}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
      </Button>
      <Button
        onClick={onGeneratePDF}
        className="bg-[#8c52ff] hover:bg-[#7a45e6]"
        disabled={isGenerating}
      >
        <FileDown className="mr-2 h-4 w-4" /> {isGenerating ? 'Generating...' : 'Download PDF'}
      </Button>
    </div>
  );
};

export default PDFGenerator;
