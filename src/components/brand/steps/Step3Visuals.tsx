import React, { useRef } from 'react';
import { FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/stable-diffusion/ImageUploader';
import { Upload, Plus, Diamond } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBrandLogo(e.target.files[0]);
    }
  };
  
  const handleMultiplePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      filesArray.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB limit`,
            variant: "destructive"
          });
          return;
        }
        
        if (!file.type.match('image/(jpeg|jpg|png|gif)')) {
          toast({
            title: "Invalid file type",
            description: "Only PNG, JPG, and GIF files are allowed",
            variant: "destructive"
          });
          return;
        }
        
        handleProductPhotoUpload(file);
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGenerateMoodboard = () => {
    toast({
      title: "Coming Soon",
      description: "The moodboard generator will be available soon!",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Brand Visuals</h2>
      
      <div>
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
        <FormLabel className="block mb-2 text-white">Upload Product Photos</FormLabel>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {productPhotos.map((photo, index) => (
            <div key={index} className="relative h-40 bg-gray-800 rounded-md overflow-hidden">
              <img 
                src={URL.createObjectURL(photo)} 
                alt={`Product ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <Button 
                variant="destructive" 
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={() => removeProductPhoto(index)}
              >
                &times;
              </Button>
            </div>
          ))}
          
          <div 
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              multiple 
              accept="image/png, image/jpeg, image/gif"
              onChange={handleMultiplePhotoUpload}
            />
            <Plus className="h-10 w-10 text-blue-400 mb-2" />
            <p className="text-sm font-medium text-blue-400">Add Product Photo</p>
            <p className="text-xs text-gray-400 mt-1">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <Button 
          variant="purple" 
          className="flex-1"
          onClick={handleGenerateMoodboard}
        >
          Generate Moodboard
        </Button>
      </div>
    </div>
  );
};

export default Step3Visuals;
