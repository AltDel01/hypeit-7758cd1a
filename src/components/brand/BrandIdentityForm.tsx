
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import Step1BasicInfo from '@/components/brand/steps/Step1BasicInfo';
import Step2Colors from '@/components/brand/steps/Step2Colors';
import Step3Visuals from '@/components/brand/steps/Step3Visuals';
import Step4Foundations from '@/components/brand/steps/Step4Foundations';
import Step5Market from '@/components/brand/steps/Step5Market';
import FormProgress from '@/components/brand/FormProgress';
import FormNavigation from '@/components/brand/FormNavigation';
import { BrandIdentityFormValues } from '@/types/brand';
import { UseFormReturn } from 'react-hook-form';

interface BrandIdentityFormProps {
  step: number;
  totalSteps: number;
  form: UseFormReturn<BrandIdentityFormValues>;
  brandLogo: File | null;
  setBrandLogo: React.Dispatch<React.SetStateAction<File | null>>;
  productPhotos: File[];
  handleProductPhotoUpload: (file: File) => void;
  removeProductPhoto: (index: number) => void;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedFont: string;
  onSelectFont: (font: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSubmit: () => void;
}

const BrandIdentityForm: React.FC<BrandIdentityFormProps> = ({
  step,
  totalSteps,
  form,
  brandLogo,
  setBrandLogo,
  productPhotos,
  handleProductPhotoUpload,
  removeProductPhoto,
  selectedColors,
  setSelectedColors,
  selectedFont,
  onSelectFont,
  handleNext,
  handlePrevious,
  handleSubmit
}) => {
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BasicInfo 
            form={form} 
            selectedFont={selectedFont} 
            onSelectFont={onSelectFont} 
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
    <Card className="bg-gray-900 bg-opacity-60 backdrop-blur-sm text-white border-gray-800">
      <CardContent className="pt-6">
        <FormProgress currentStep={step} totalSteps={totalSteps} />

        <Form {...form}>
          <form className="space-y-4">
            {renderCurrentStep()}
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
  );
};

export default BrandIdentityForm;
