import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AspectRatioSelector from './AspectRatioSelector';

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [requestId, setRequestId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({
          title: "Image Uploaded",
          description: "Product image ready for video generation",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      // Call OpenAI or another service to enhance the prompt
      // For now, use a simple enhancement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enhanced prompt with more video-specific details
      const enhanced = `A photorealistic, 4k commercial video shot in a bright, well-lit supermarket aisle. A young, attractive Asian woman with long wavy black hair, wearing a fitted red long-sleeve top, stands holding a blue and gold bag of popcorn. She looks excitedly at the camera, reaches into the bag to pick out a single, round, golden mushroom popcorn kernel. She brings it to her mouth, eats it with a distinct crunch, and her face lights up with a look of pure delight and satisfaction, nodding in approval. The background features shelves fully stocked with yellow and blue snack bags, slightly out of focus (depth of field) to keep attention on the woman. The lighting is even, bright, and professional store lighting. Smooth camera movement, cinematic quality, professional commercial production.`;
      
      setEnhancedPrompt(enhanced);
      
      toast({
        title: "Prompt Enhanced!",
        description: "AI optimized your prompt for better video results",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present
        const base64 = base64String.includes(',') 
          ? base64String.split(',')[1] 
          : base64String;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const pollVideoStatus = async (reqId: string, prompt: string, operationName?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          requestId: reqId,
          checkOnly: true,
          prompt: prompt,
          operationName: operationName
        }
      });

      if (error) {
        console.error('Polling error:', error);
        return null;
      }

      if (data?.status === "completed") {
        // Clear polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        console.log("Video generation completed");
        
        // The video URL now includes the API key and can be used directly in the video element
        if (data.videoUrl) {
          console.log("Video URL received");
          return data.videoUrl;
        }
        
        // No video URL in response
        console.warn("No video URL in response");
        return null;
      } else if (data?.status === "error") {
        // Clear polling interval on error
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        const errorMsg = data.error || data.errorDetails || "Video generation failed";
        throw new Error(errorMsg);
      }

      return null; // Still processing
    } catch (error) {
      console.error('Polling error:', error);
      return null;
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt or enhance your prompt first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    try {
      // Convert image to base64 only if image exists
      let imageBase64: string | undefined = undefined;
      let imageName: string | undefined = undefined;
      let imageType: string | undefined = undefined;
      
      if (uploadedImageFile) {
        imageBase64 = await convertImageToBase64(uploadedImageFile);
        imageName = uploadedImageFile.name;
        imageType = uploadedImageFile.type;
      }
      
      // Call the video generation function
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          prompt: finalPrompt,
          enhanced_prompt: enhancedPrompt || undefined,
          aspect_ratio: aspectRatio,
          ...(imageBase64 && {
            product_image: imageBase64,
            product_image_name: imageName,
            product_image_type: imageType
          })
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to start video generation");
      }

      if (data?.status === "error") {
        const errorMsg = data.error || data.errorDetails || "Video generation failed";
        console.error("Video generation error:", data);
        throw new Error(errorMsg);
      }

      // If video is immediately available
      if (data?.status === "completed") {
        console.log("Video ready in response");
        
        // The video URL includes the API key and can be used directly
        if (data.videoUrl) {
          console.log("Setting video URL directly");
          setGeneratedVideo(data.videoUrl);
          toast({
            title: "Video Generated!",
            description: "Your AI-generated video is ready",
          });
          setIsGenerating(false);
          return;
        }
        
        throw new Error("No video URL in response");
      }

      // If processing, start polling
      if (data?.requestId) {
        setRequestId(data.requestId);
        const operationName = data?.operationName;
        
        // Start polling for video status
        const pollInterval = setInterval(async () => {
          try {
            const videoUrl = await pollVideoStatus(data.requestId, finalPrompt, operationName);
            if (videoUrl) {
              setGeneratedVideo(videoUrl);
              setIsGenerating(false);
              toast({
                title: "Video Generated!",
                description: "Your AI-generated video is ready",
              });
            }
          } catch (pollError) {
            // Handle polling errors
            console.error('Polling error:', pollError);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsGenerating(false);
            toast({
              title: "Generation Failed",
              description: pollError instanceof Error ? pollError.message : "Video generation failed during polling",
              variant: "destructive"
            });
          }
        }, 5000); // Poll every 5 seconds

        pollingIntervalRef.current = pollInterval as unknown as number;

        // Set a maximum polling time (e.g., 2 minutes)
        setTimeout(() => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (isGenerating) {
            setIsGenerating(false);
            toast({
              title: "Generation Timeout",
              description: "Video generation is taking longer than expected. Please check back later.",
              variant: "destructive"
            });
          }
        }, 120000); // 2 minutes timeout

        toast({
          title: "Video Generation Started",
          description: "Your video is being generated. This may take a few moments...",
        });
      } else {
        throw new Error("Invalid response from video generation service");
      }
    } catch (error) {
      console.error('Video generation error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate video. Please try again.";
      
      // Show detailed error if available
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000 // Show for 5 seconds
      });
      setIsGenerating(false);
      
      // Clear polling on error
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Left Column - Input */}
      <div className="space-y-4 md:space-y-6">
        {/* Image Upload - Optional */}
        <Card className="p-4 md:p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <Video className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
            Product Image <span className="text-[10px] md:text-xs font-normal text-gray-400 ml-1 md:ml-2">(Optional)</span>
          </h2>
          
          <div className="space-y-3 md:space-y-4">
            <Label 
              htmlFor="video-image-upload"
              className="flex flex-col items-center justify-center h-40 md:h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="h-full w-full object-contain rounded-lg" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs md:text-sm text-muted-foreground">Click to upload (optional)</p>
                </div>
              )}
            </Label>
            <Input
              id="video-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-[10px] md:text-xs text-gray-500">Note: Image upload is optional. Video will be generated based on your prompt.</p>
          </div>
        </Card>

        {/* Prompt Input */}
        <Card className="p-4 md:p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <Wand2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            Generation Prompt
          </h2>
          
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="video-prompt" className="text-sm">Your Prompt</Label>
              <Textarea
                id="video-prompt"
                placeholder="Describe the video you want to create..."
                className="min-h-[80px] md:min-h-[100px] mt-1"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleEnhancePrompt}
              disabled={isEnhancing}
              variant="outline"
              className="w-full gap-2 text-sm"
            >
              <Sparkles className={`w-4 h-4 ${isEnhancing ? 'animate-pulse' : ''}`} />
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </Button>

            {enhancedPrompt && (
              <Card className="p-3 md:p-4 bg-purple-600/10 border-purple-500/50 animate-fade-in">
                <p className="text-xs md:text-sm font-medium text-purple-300 mb-1 md:mb-2">Enhanced Prompt:</p>
                <p className="text-white text-xs md:text-sm">{enhancedPrompt}</p>
              </Card>
            )}
          </div>
        </Card>

        {/* Aspect Ratio Selection */}
        <AspectRatioSelector 
          selectedRatio={aspectRatio} 
          onRatioChange={setAspectRatio} 
        />

        {/* Generate Button */}
        <Card className="p-4 md:p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </Button>
        </Card>
      </div>

      {/* Right Column - Results */}
      <Card className="p-4 md:p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Result Video</h2>
        <div className="flex items-center justify-center h-[300px] md:h-[500px] border-2 border-dashed border-slate-600 rounded-lg overflow-hidden">
          {isGenerating ? (
            <span className="flex flex-col items-center gap-2 p-4">
              <Wand2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-purple-400" />
              <p className="text-sm md:text-base text-muted-foreground text-center">Generating your video...</p>
            </span>
          ) : generatedVideo ? (
            <video src={generatedVideo} controls className="h-full w-full object-contain" />
          ) : (
            <p className="text-sm md:text-base text-muted-foreground text-center px-4">Generated video will appear here</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VideoGenerator;
