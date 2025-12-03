import React, { useState } from 'react';
import { Upload, Wand2, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import AspectRatioSelector from './AspectRatioSelector';

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnhancedPrompt(`A photorealistic, 4k commercial video shot in a bright, well-lit supermarket aisle. A young, attractive Asian woman with long wavy black hair, wearing a fitted red long-sleeve top, stands holding a blue and gold bag of popcorn. She looks excitedly at the camera, reaches into the bag to pick out a single, round, golden mushroom popcorn kernel. She brings it to her mouth, eats it with a distinct crunch, and her face lights up with a look of pure delight and satisfaction, nodding in approval. The background features shelves fully stocked with yellow and blue snack bags, slightly out of focus (depth of field) to keep attention on the woman. The lighting is even, bright, and professional store lighting.`);
      
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

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast({
        title: "Image Required",
        description: "Please upload a product image first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGeneratedVideo('/videos/popcorn-promo-demo.mp4');
      
      toast({
        title: "Video Generated!",
        description: "Your AI-generated video is ready",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input */}
      <div className="space-y-6">
        {/* Image Upload */}
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            Product Image
          </h2>
          
          <div className="space-y-4">
            <Label 
              htmlFor="video-image-upload"
              className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="h-full w-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload product image</p>
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
          </div>
        </Card>

        {/* Prompt Input */}
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            Generation Prompt
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-prompt">Your Prompt</Label>
              <Textarea
                id="video-prompt"
                placeholder="Describe the video you want to create..."
                className="min-h-[100px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleEnhancePrompt}
              disabled={isEnhancing}
              variant="outline"
              className="w-full gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isEnhancing ? 'animate-pulse' : ''}`} />
              {isEnhancing ? 'Enhancing...' : 'Enhance Prompt with AI'}
            </Button>

            {enhancedPrompt && (
              <Card className="p-4 bg-purple-600/10 border-purple-500/50 animate-fade-in">
                <p className="text-sm font-medium text-purple-300 mb-2">Enhanced Prompt:</p>
                <p className="text-white text-sm">{enhancedPrompt}</p>
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
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !uploadedImage}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </Button>
        </Card>
      </div>

      {/* Right Column - Results */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Result Video</h2>
        <div className="flex items-center justify-center h-[500px] border-2 border-dashed border-slate-600 rounded-lg overflow-hidden">
          {isGenerating ? (
            <span className="flex flex-col items-center gap-2">
              <Wand2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-muted-foreground">Generating your video...</p>
            </span>
          ) : generatedVideo ? (
            <video src={generatedVideo} controls className="h-full w-full object-contain" />
          ) : (
            <p className="text-muted-foreground text-center">Generated video will appear here</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VideoGenerator;
