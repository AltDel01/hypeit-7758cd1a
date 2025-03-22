import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Wand2, CircleOff } from 'lucide-react';
import stableDiffusionService from '@/services/StableDiffusionService';

const StableDiffusionInpainting = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(25);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const maskImageRef = useRef<HTMLImageElement | null>(null);
  
  // Handle model loading
  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      setLoadingStatus("Initializing model...");
      
      await stableDiffusionService.loadModel((progress) => {
        setLoadingStatus(progress.status);
        if (progress.progress !== undefined) {
          setLoadingProgress(progress.progress * 100);
        }
      });
      
      setIsModelLoading(false);
    } catch (error) {
      console.error("Error loading model:", error);
      toast.error("Failed to load the Stable Diffusion model");
      setIsModelLoading(false);
    }
  };
  
  // Handle original image upload
  const handleOriginalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setOriginalImage(e.target.files[0]);
    }
  };
  
  // Handle mask image upload
  const handleMaskImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMaskImage(e.target.files[0]);
    }
  };
  
  // Generate the inpainted image
  const generateInpaintedImage = async () => {
    if (!originalImage || !maskImage || !prompt) {
      toast.error("Please provide an original image, a mask image, and a prompt");
      return;
    }
    
    try {
      setIsGenerating(true);
      toast.info("Starting inpainting...");
      
      // Convert files to HTML images - use instance methods now
      const originalImgEl = await stableDiffusionService.fileToImage(originalImage);
      const maskImgEl = await stableDiffusionService.fileToImage(maskImage);
      
      // Ensure both images have the same dimensions
      originalImageRef.current = originalImgEl;
      maskImageRef.current = maskImgEl;
      
      // Resize images if needed - use instance methods now
      const resizedOriginal = stableDiffusionService.resizeImageIfNeeded(originalImgEl);
      const resizedMask = stableDiffusionService.resizeImageIfNeeded(maskImgEl);
      
      // Perform inpainting
      const result = await stableDiffusionService.inpaint(
        resizedOriginal,
        resizedMask,
        {
          prompt,
          negativePrompt,
          numInferenceSteps,
          guidanceScale
        }
      );
      
      // Set the result image - use URL.createObjectURL with the Blob
      setResultImage(URL.createObjectURL(new Blob([result], { type: 'image/png' })));
      toast.success("Inpainting completed successfully!");
    } catch (error) {
      console.error("Inpainting error:", error);
      toast.error("Failed to generate inpainted image");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Load the model on component mount
  useEffect(() => {
    loadModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Stable Diffusion Inpainting</h2>
          <p className="text-gray-500 mb-4">
            Upload an image and a mask, then provide a prompt to inpaint the masked area.
          </p>
        </div>
        
        {isModelLoading ? (
          <div className="p-6 border rounded-md">
            <h3 className="font-medium mb-2">Loading Stable Diffusion Model...</h3>
            <p className="mb-2 text-sm text-gray-500">{loadingStatus}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This may take a few minutes on the first run
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="original-image">Original Image</Label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="original-image"
                    type="file"
                    accept="image/*"
                    onChange={handleOriginalImageUpload}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="ml-2"
                  >
                    <Upload size={16} />
                  </Button>
                </div>
                {originalImage && (
                  <div className="mt-2 relative aspect-square w-full max-h-[300px] overflow-hidden rounded-md border">
                    <img
                      src={URL.createObjectURL(originalImage)}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="mask-image">Mask Image (white areas will be inpainted)</Label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="mask-image"
                    type="file"
                    accept="image/*"
                    onChange={handleMaskImageUpload}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="ml-2"
                  >
                    <CircleOff size={16} />
                  </Button>
                </div>
                {maskImage && (
                  <div className="mt-2 relative aspect-square w-full max-h-[300px] overflow-hidden rounded-md border">
                    <img
                      src={URL.createObjectURL(maskImage)}
                      alt="Mask"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to add to the masked area..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
                <Textarea
                  id="negative-prompt"
                  placeholder="What you don't want to see..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="inference-steps">
                  Inference Steps: {numInferenceSteps}
                </Label>
                <Slider
                  id="inference-steps"
                  min={10}
                  max={50}
                  step={1}
                  value={[numInferenceSteps]}
                  onValueChange={(value) => setNumInferenceSteps(value[0])}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="guidance-scale">
                  Guidance Scale: {guidanceScale.toFixed(1)}
                </Label>
                <Slider
                  id="guidance-scale"
                  min={1}
                  max={15}
                  step={0.1}
                  value={[guidanceScale]}
                  onValueChange={(value) => setGuidanceScale(value[0])}
                  className="mt-2"
                />
              </div>
              
              <Button
                className="w-full"
                disabled={isGenerating || !originalImage || !maskImage || !prompt}
                onClick={generateInpaintedImage}
              >
                {isGenerating ? "Generating..." : "Generate"}
                <Wand2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Result</h3>
        {resultImage ? (
          <div className="aspect-square w-full max-h-[500px] overflow-hidden rounded-md border">
            <img
              src={resultImage}
              alt="Inpainted result"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center aspect-square w-full max-h-[500px] rounded-md border bg-gray-50">
            <p className="text-gray-500">
              Inpainted image will appear here
            </p>
          </div>
        )}
        
        {resultImage && (
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => {
              const link = document.createElement('a');
              link.href = resultImage;
              link.download = 'inpainted-image.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download Result
          </Button>
        )}
      </div>
    </div>
  );
};

export default StableDiffusionInpainting;
