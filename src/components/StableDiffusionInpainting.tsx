
import React, { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import stableDiffusionService from '@/services/StableDiffusionService';
import InpaintingForm from './stable-diffusion/InpaintingForm';
import ResultPreview from './stable-diffusion/ResultPreview';
import { useAuth } from '@/contexts/AuthContext';

const StableDiffusionInpainting = () => {
  const { user } = useAuth();
  
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useWebhook, setUseWebhook] = useState<boolean>(false);
  const [generationStartTime, setGenerationStartTime] = useState<number>(0);
  
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const maskImageRef = useRef<HTMLImageElement | null>(null);
  
  // Handle model loading
  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      setLoadingStatus("Initializing model...");
      console.log("Starting model load...");
      
      await stableDiffusionService.loadModel((progress) => {
        setLoadingStatus(progress.status);
        console.log(`Loading status: ${progress.status}, progress: ${progress.progress}`);
        if (progress.progress !== undefined) {
          setLoadingProgress(progress.progress * 100);
        }
      });
      
      console.log("Model loaded successfully");
      setIsModelLoading(false);
      toast.success("Stable Diffusion model loaded successfully!");
    } catch (error) {
      console.error("Error loading model:", error);
      setErrorMessage(`Failed to load model: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Failed to load the Stable Diffusion model");
      setIsModelLoading(false);
    }
  };
  
  // Helper function to update progress with animation
  const animateProgress = () => {
    // For a 60-second expected process, calculate progress based on elapsed time
    const elapsed = Date.now() - generationStartTime;
    const expectedDuration = 60000; // 60 seconds in ms
    const progress = Math.min(95, (elapsed / expectedDuration) * 100);
    setLoadingProgress(progress);
    
    if (progress < 95) {
      requestAnimationFrame(animateProgress);
    }
  };
  
  // Generate the inpainted image
  const generateInpaintedImage = async () => {
    if (!originalImage || !maskImage || !prompt) {
      const missingItems = [];
      if (!originalImage) missingItems.push("original image");
      if (!maskImage) missingItems.push("mask image");
      if (!prompt) missingItems.push("prompt");
      
      const errorMsg = `Please provide: ${missingItems.join(", ")}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setGenerationStartTime(Date.now());
      setLoadingProgress(0);
      requestAnimationFrame(animateProgress);
      
      toast.info("Starting inpainting...");
      console.log("Starting inpainting process with prompt:", prompt);
      
      // If using webhook, send the image to the webhook
      if (useWebhook) {
        try {
          await stableDiffusionService.sendImageToWebhook(originalImage, prompt);
          console.log("Image sent to webhook successfully");
        } catch (webhookError) {
          console.error("Webhook error:", webhookError);
          // Continue with local processing despite webhook error
          toast.error("Failed to send to webhook, continuing with local processing");
        }
      }
      
      // Convert files to HTML images
      console.log("Converting original image to HTML Image");
      const originalImgEl = await stableDiffusionService.fileToImage(originalImage);
      console.log("Converting mask image to HTML Image");
      const maskImgEl = await stableDiffusionService.fileToImage(maskImage);
      
      // Ensure both images have the same dimensions
      originalImageRef.current = originalImgEl;
      maskImageRef.current = maskImgEl;
      
      console.log("Original image dimensions:", originalImgEl.width, "x", originalImgEl.height);
      console.log("Mask image dimensions:", maskImgEl.width, "x", maskImgEl.height);
      
      // Resize images if needed
      console.log("Resizing original image if needed");
      const resizedOriginal = stableDiffusionService.resizeImageIfNeeded(originalImgEl);
      console.log("Resizing mask image if needed");
      const resizedMask = stableDiffusionService.resizeImageIfNeeded(maskImgEl);
      
      console.log("Resized dimensions:", resizedOriginal.width, "x", resizedOriginal.height);
      
      // Perform inpainting
      console.log("Calling inpaint with prompt:", prompt);
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
      
      // Set final progress
      setLoadingProgress(100);
      
      console.log("Inpainting completed, creating object URL");
      // Set the result image
      setResultImage(URL.createObjectURL(new Blob([result], { type: 'image/png' })));
      toast.success("Inpainting completed successfully!");
    } catch (error) {
      console.error("Inpainting error:", error);
      const errorMsg = `Failed to generate inpainted image: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Load the model on component mount
  useEffect(() => {
    loadModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Calculate generation time
  const elapsedSeconds = Math.floor((Date.now() - generationStartTime) / 1000);
  const generationTime = generationStartTime > 0 ? Math.max(1, elapsedSeconds) : 60;
  
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
        errorMessage={errorMessage}
        useWebhook={useWebhook}
        setUseWebhook={setUseWebhook}
      />
      
      <ResultPreview 
        resultImage={resultImage} 
        isLoading={isGenerating}
        loadingProgress={loadingProgress}
        generationTime={generationTime}
      />
    </div>
  );
};

export default StableDiffusionInpainting;
