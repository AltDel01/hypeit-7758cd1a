
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
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Brand Visuals</h2>
      
      <div>
        <FormLabel className="block mb-2">Upload Logo (Optional)</FormLabel>
        <ImageUploader
          id="logo-upload"
          label="Upload Logo"
          icon={<Upload />}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setBrandLogo(e.target.files[0]);
            }
          }}
          image={brandLogo}
          onRemoveImage={() => setBrandLogo(null)}
        />
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
          
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-md cursor-pointer hover:border-blue-600 transition-colors">
            <ImageUploader
              id="product-photo-upload"
              label="Add Product Photo"
              icon={<Upload />}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleProductPhotoUpload(e.target.files[0]);
                }
              }}
              image={null}
              onRemoveImage={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Visuals;
