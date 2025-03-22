
import React, { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import stableDiffusionService from '@/services/StableDiffusionService';
import InpaintingForm from './stable-diffusion/InpaintingForm';
import ResultPreview from './stable-diffusion/ResultPreview';

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
  
  // Generate the inpainted image
  const generateInpaintedImage = async () => {
    if (!originalImage || !maskImage || !prompt) {
      toast.error("Please provide an original image, a mask image, and a prompt");
      return;
    }
    
    try {
      setIsGenerating(true);
      toast.info("Starting inpainting...");
      
      // Convert files to HTML images
      const originalImgEl = await stableDiffusionService.fileToImage(originalImage);
      const maskImgEl = await stableDiffusionService.fileToImage(maskImage);
      
      // Ensure both images have the same dimensions
      originalImageRef.current = originalImgEl;
      maskImageRef.current = maskImgEl;
      
      // Resize images if needed
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
      
      // Set the result image
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
      <InpaintingForm 
        isModelLoading={isModelLoading}
        loadingStatus={loadingStatus}
        loadingProgress={loadingProgress}
        originalImage={originalImage}
        setOriginalImage={setOriginalImage}
        maskImage={maskImage}
        setMaskImage={setMaskImage}
        prompt={prompt}
        setPrompt={setPrompt}
        negativePrompt={negativePrompt}
        setNegativePrompt={setNegativePrompt}
        numInferenceSteps={numInferenceSteps}
        setNumInferenceSteps={setNumInferenceSteps}
        guidanceScale={guidanceScale}
        setGuidanceScale={setGuidanceScale}
        onGenerate={generateInpaintedImage}
        isGenerating={isGenerating}
      />
      
      <ResultPreview resultImage={resultImage} />
    </div>
  );
};

export default StableDiffusionInpainting;
