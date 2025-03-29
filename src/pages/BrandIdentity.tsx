
import React, { useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/stable-diffusion/ImageUploader';
import BrandColorPicker from '@/components/brand/BrandColorPicker';
import FontSelector from '@/components/brand/FontSelector';
import { ArrowLeft, ArrowRight, FileDown, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { PDFGenerator } from '@/components/brand/PDFGenerator';

// Define form schema
const brandIdentitySchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  brandStory: z.string().min(10, { message: "Brand story must be at least 10 characters" }),
  vision: z.string().min(10, { message: "Vision must be at least 10 characters" }),
  mission: z.string().min(10, { message: "Mission must be at least 10 characters" }),
  coreValues: z.string().min(10, { message: "Core values must be at least 10 characters" }),
  coreServices: z.string().min(10, { message: "Core services must be at least 10 characters" }),
  audience: z.string().min(10, { message: "Audience must be at least 10 characters" }),
  market: z.string().min(10, { message: "Market must be at least 10 characters" }),
  goals: z.string().min(10, { message: "Goals must be at least 10 characters" })
});

type BrandIdentityFormValues = z.infer<typeof brandIdentitySchema>;

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

  const handleSubmit = async (data: BrandIdentityFormValues) => {
    // Form validation is already handled by react-hook-form
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
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          i + 1 === step 
                            ? 'bg-blue-600' 
                            : i + 1 < step 
                              ? 'bg-green-600' 
                              : 'bg-gray-700'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full transition-all"
                      style={{ width: `${(step / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {/* Step 1: Business Name and Font */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your business name" 
                                  {...field} 
                                  className="bg-gray-800 border-gray-700 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="mt-6">
                          <FormLabel className="block mb-2">Select Font</FormLabel>
                          <FontSelector
                            selectedFont={selectedFont}
                            onSelectFont={setSelectedFont}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Brand Colors */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Brand Colors</h2>
                        <p className="text-gray-400 mb-4">
                          Select exactly 3 colors that represent your brand's personality.
                        </p>
                        
                        <BrandColorPicker
                          selectedColors={selectedColors}
                          setSelectedColors={setSelectedColors}
                          maxColors={3}
                        />
                      </div>
                    )}

                    {/* Step 3: Logo and Product Photos */}
                    {step === 3 && (
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
                    )}

                    {/* Step 4: Brand Story, Vision, Mission, Core Values */}
                    {step === 4 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Brand Foundations</h2>
                        
                        <FormField
                          control={form.control}
                          name="brandStory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand Story</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell your brand's story..." 
                                  className="bg-gray-800 border-gray-700 text-white resize-none min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="vision"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vision</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What's your brand's vision for the future?" 
                                  className="bg-gray-800 border-gray-700 text-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="mission"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mission</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What's your brand's mission?" 
                                  className="bg-gray-800 border-gray-700 text-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="coreValues"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Core Values</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What are your brand's core values?" 
                                  className="bg-gray-800 border-gray-700 text-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 5: Services, Audience, Market, Goals */}
                    {step === 5 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Market & Audience</h2>
                        
                        <FormField
                          control={form.control}
                          name="coreServices"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Core Services or Products</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What are your main services or products?" 
                                  className="bg-gray-800 border-gray-700 text-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="audience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Audience</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your target audience..." 
                                  className="bg-gray-800 border-gray-700 text-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="market"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Market</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your market..." 
                                  className="bg-gray-800 border-gray-700 text-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="goals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Goals</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What are your brand's goals?" 
                                  className="bg-gray-800 border-gray-700 text-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-8">
                      {step > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handlePrevious}
                          className="border-gray-700 text-white"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                      )}
                      
                      {step < totalSteps ? (
                        <Button 
                          type="button" 
                          onClick={handleNext}
                          className="ml-auto bg-blue-600 hover:bg-blue-700"
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          className="ml-auto bg-green-600 hover:bg-green-700"
                        >
                          Generate Brand Identity <FileDown className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            /* PDF Preview Section */
            <PDFGenerator 
              formData={form.getValues()}
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
