
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { 
  Form,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { PDFGenerator } from '@/components/brand/PDFGenerator';
import { brandIdentitySchema, BrandIdentityFormValues } from '@/types/brand';

// Import step components
import Step1BasicInfo from '@/components/brand/steps/Step1BasicInfo';
import Step2Colors from '@/components/brand/steps/Step2Colors';
import Step3Visuals from '@/components/brand/steps/Step3Visuals';
import Step4Foundations from '@/components/brand/steps/Step4Foundations';
import Step5Market from '@/components/brand/steps/Step5Market';
import FormProgress from '@/components/brand/FormProgress';
import FormNavigation from '@/components/brand/FormNavigation';

const BrandIdentity = () => {
  const [step, setStep] = useState(1);
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  const [productPhotos, setProductPhotos] = useState<File[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const { toast } = useToast();
  const totalSteps = 5;

  const form = useForm<BrandIdentityFormValues>({
    resolver: zodResolver(brandIdentitySchema),
    defaultValues: {
      businessName: '',
      brandStory: '',
      vision: '',
      mission: '',
      coreValues: '',
      coreServices: '',
      audience: '',
      market: '',
      goals: ''
    }
  });

  const handleNext = async () => {
    if (step === 1) {
      const isNameValid = await form.trigger('businessName');
      if (!isNameValid) return;
    } else if (step === 2) {
      if (selectedColors.length !== 3) {
        toast({
          title: "Please select 3 colors",
          description: "You need to select exactly 3 brand colors",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 3) {
      // Logo is optional, but we do check if product photos are added
      if (productPhotos.length === 0) {
        toast({
          title: "Please upload photos",
          description: "You need to upload at least one product photo",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 4) {
      const isValid = await form.trigger(['brandStory', 'vision', 'mission', 'coreValues']);
      if (!isValid) return;
    }
    
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const isValid = form.formState.isValid;
    if (!isValid) {
      form.trigger();
      toast({
        title: "Missing information",
        description: "Please fill in all required fields before generating your brand identity.",
        variant: "destructive"
      });
      return;
    }
    
    setShowPdfPreview(true);
    toast({
      title: "Brand identity created!",
      description: "Your brand identity document is ready. You can download it now.",
    });
  };

  const handleProductPhotoUpload = (file: File) => {
    setProductPhotos(prev => [...prev, file]);
  };

  const removeProductPhoto = (index: number) => {
    setProductPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Make sure all the fields are filled before sending to PDF generator
  const getPDFData = () => {
    const values = form.getValues();
    
    // Explicitly create a new object with all required properties
    // that matches the BrandIdentityFormValues type exactly
    const completeValues: BrandIdentityFormValues = {
      businessName: values.businessName || '',
      brandStory: values.brandStory || '',
      vision: values.vision || '',
      mission: values.mission || '',
      coreValues: values.coreValues || '',
      coreServices: values.coreServices || '',
      audience: values.audience || '',
      market: values.market || '',
      goals: values.goals || ''
    };
    
    return completeValues;
  };

  // Render current step based on step state
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BasicInfo 
            form={form} 
            selectedFont={selectedFont} 
            onSelectFont={setSelectedFont} 
          />
        );
      case 2:
        return (
          <Step2Colors 
            selectedColors={selectedColors} 
            setSelectedColors={setSelectedColors} 
          />
        );
      case 3:
        return (
          <Step3Visuals 
            brandLogo={brandLogo}
            setBrandLogo={setBrandLogo}
            productPhotos={productPhotos}
            handleProductPhotoUpload={handleProductPhotoUpload}
            removeProductPhoto={removeProductPhoto}
          />
        );
      case 4:
        return <Step4Foundations form={form} />;
      case 5:
        return <Step5Market form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navbar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Create Your Brand Identity</h1>
          
          {!showPdfPreview ? (
            <Card className="bg-gray-900 text-white border-gray-800">
              <CardContent className="pt-6">
                {/* Progress indicator */}
                <FormProgress currentStep={step} totalSteps={totalSteps} />

                <Form {...form}>
                  <form className="space-y-4">
                    {/* Render the current step */}
                    {renderCurrentStep()}

                    {/* Navigation buttons */}
                    <FormNavigation 
                      step={step}
                      totalSteps={totalSteps}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      onSubmit={handleSubmit}
                      isSubmitStep={step === totalSteps}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            /* PDF Preview Section */
            <PDFGenerator 
              formData={getPDFData()}
              brandLogo={brandLogo}
              productPhotos={productPhotos}
              selectedColors={selectedColors}
              selectedFont={selectedFont}
              onBack={() => setShowPdfPreview(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default BrandIdentity;
