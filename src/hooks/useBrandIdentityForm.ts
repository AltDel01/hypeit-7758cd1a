
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { brandIdentitySchema, BrandIdentityFormValues } from '@/types/brand';

export function useBrandIdentityForm() {
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

  const getPDFData = (): BrandIdentityFormValues => {
    const values = form.getValues();
    
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

  return {
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
  };
}
