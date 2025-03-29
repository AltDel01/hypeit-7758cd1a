
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { PDFGenerator } from '@/components/brand/pdf/PDFGenerator';
import { useBrandIdentityForm } from '@/hooks/useBrandIdentityForm';
import BrandIdentityForm from '@/components/brand/BrandIdentityForm';
import AuroraBackground from '@/components/effects/AuroraBackground';

const BrandIdentity = () => {
  const {
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
    setSelectedFont,
    showPdfPreview,
    setShowPdfPreview,
    handleNext,
    handlePrevious,
    handleSubmit,
    getPDFData
  } = useBrandIdentityForm();

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-8 animate-gradient-text animate-fade-in-up">Create Your Brand Identity</h1>
            
            {!showPdfPreview ? (
              <BrandIdentityForm
                step={step}
                totalSteps={totalSteps}
                form={form}
                brandLogo={brandLogo}
                setBrandLogo={setBrandLogo}
                productPhotos={productPhotos}
                handleProductPhotoUpload={handleProductPhotoUpload}
                removeProductPhoto={removeProductPhoto}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                selectedFont={selectedFont}
                onSelectFont={setSelectedFont}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                handleSubmit={handleSubmit}
              />
            ) : (
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
    </AuroraBackground>
  );
};

export default BrandIdentity;
