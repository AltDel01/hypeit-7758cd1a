import React, { useState } from 'react';
import { Upload, Wand2, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

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
      setEnhancedPrompt(`Generate a vertical video (similar to TikTok/Reel style) featuring an attractive female food blogger (age 25-30) in a modern snack aisle. She is vlogging, holding a camera or phone on a gimbal/selfie stick.

Shot 1 (0-3s - Discovery): The blogger walks past a colourful shelf, her eyes immediately zero in on the bright red Maicih Keripik Singkong Level 10 bag. She grabs it with a look of excited anticipation. She presents the bag to the camera, pointing at the 'Hot Spicy' Level 10 indicator.

Shot 2 (4-7s - Action & Reaction): Quick close-up as she expertly rips open the bag (emphasize the sound). She picks up a chip—which is visibly covered in intense red spice dust—and pops it in her mouth.

Shot 3 (8-10s - The Kick): Transition to an Extreme Close-up on her face. Initial expression is shocked spice (eyes wide, slight sweat on forehead), quickly followed by a powerful, satisfying smile and a nod, confirming the delicious heat. Final image is her holding the bag triumphantly.`);
      
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
      setGeneratedVideo('/videos/demo-food-blogger.mp4');
      
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

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !uploadedImage}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </Button>
          </div>
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
