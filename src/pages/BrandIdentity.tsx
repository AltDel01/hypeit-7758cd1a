
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { PDFGenerator } from '@/components/brand/pdf/PDFGenerator';
import { useBrandIdentityForm } from '@/hooks/useBrandIdentityForm';
import BrandIdentityForm from '@/components/brand/BrandIdentityForm';

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
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navbar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Create Your Brand Identity</h1>
          
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
              setSelectedFont={setSelectedFont}
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
  );
};

export default BrandIdentity;
