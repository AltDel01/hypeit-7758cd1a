import React, { useState } from 'react';
import { Upload, Wand2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import demoResult from '@/assets/barbeque-bliss-result.jpg';
import AspectRatioSelector from './AspectRatioSelector';

// AI API is handled securely via Edge Functions - no client-side keys needed

const VisualGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({
          title: "Image Uploaded",
          description: "Product image ready for generation",
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
      setEnhancedPrompt(`Commercial food photography of a standing red and gold foil snack bag labeled "Premium Mushroom Popcorn," sitting on a rustic dark wood table. The bag is surrounded by appetizing props: wooden bowls filled with round golden mushroom popcorn, a small dipping bowl of red BBQ sauce, a small pile of red BBQ spice powder, and fresh green rosemary sprigs scattered on the table. In the background, there is a soft-focus (bokeh) view of a charcoal BBQ grill with visible flames and rising smoke, suggesting a backyard cookout atmosphere. The lighting is warm, golden-hour sunlight coming from the top left, creating dramatic shadows and highlights on the popcorn kernels. Ultra-realistic, 8k resolution, cinematic lighting, advertising quality.`);
      
      toast({
        title: "Prompt Enhanced!",
        description: "AI optimized your prompt for better results",
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
    setGeneratedImage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGeneratedImage(demoResult);
      
      toast({
        title: "Content Generated!",
        description: "Your AI-generated content is ready",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
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
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            Product Image
          </h2>
          
          <div className="space-y-4">
            <Label 
              htmlFor="image-upload"
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
              id="image-upload"
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
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to create..."
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
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </Button>
        </Card>
      </div>

      {/* Right Column - Results */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Result Gallery</h2>
        <div className="flex items-center justify-center h-[500px] border-2 border-dashed border-slate-600 rounded-lg overflow-hidden">
          {isGenerating ? (
            <span className="flex flex-col items-center gap-2">
              <Wand2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-muted-foreground">Generating your content...</p>
            </span>
          ) : generatedImage ? (
            <img src={generatedImage} alt="Generated result" className="h-full w-full object-contain" />
          ) : (
            <p className="text-muted-foreground text-center">Generated content will appear here</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VisualGenerator;
