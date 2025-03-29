
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/stable-diffusion/ImageUploader';
import { Upload } from 'lucide-react';

interface Step3VisualsProps {
  brandLogo: File | null;
  setBrandLogo: React.Dispatch<React.SetStateAction<File | null>>;
  productPhotos: File[];
  handleProductPhotoUpload: (file: File) => void;
  removeProductPhoto: (index: number) => void;
}

const Step3Visuals: React.FC<Step3VisualsProps> = ({
  brandLogo,
  setBrandLogo,
  productPhotos,
  handleProductPhotoUpload,
  removeProductPhoto
}) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBrandLogo(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Brand Visuals</h2>
      
      <div>
        <FormLabel className="block mb-2">Upload Logo (Optional)</FormLabel>
        <div className="max-w-xs mx-auto sm:mx-0">
          <ImageUploader
            id="logo-upload"
            label="Upload Logo"
            icon={<Upload className="h-5 w-5" />}
            onChange={handleLogoUpload}
            image={brandLogo}
            onRemoveImage={() => setBrandLogo(null)}
            className="h-full"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <FormLabel className="block mb-2">Upload Product Photos</FormLabel>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {productPhotos.map((photo, index) => (
            <div key={index} className="relative">
              <img 
                src={URL.createObjectURL(photo)} 
                alt={`Product ${index + 1}`} 
                className="w-full h-40 object-cover rounded-md"
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => removeProductPhoto(index)}
              >
                &times;
              </Button>
            </div>
          ))}
          
          <div className="flex items-center justify-center h-60 border-2 border-dashed border-gray-700 rounded-md">
            <ImageUploader
              id="product-photo-upload"
              label="Add Product Photo"
              icon={<Upload className="h-8 w-8" />}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleProductPhotoUpload(e.target.files[0]);
                }
              }}
              image={null}
              onRemoveImage={() => {}}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Visuals;
