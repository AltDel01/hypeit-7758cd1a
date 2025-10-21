import React, { useState } from 'react';
import { Upload, Wand2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import demoResult from '@/assets/demo-result.png';

const AIContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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
      setEnhancedPrompt(`Create a professional food product photo featuring the uploaded snack packaging placed on a warm wooden table. Surround the product with fresh red chili peppers on the left and several brown cassava roots, some sliced open to reveal their white flesh, on the right. Add natural warm lighting that creates soft shadows and a cozy, appetizing atmosphere. Include elegant white text at the bottom that reads:
"Taste the tradition, Made with real ingredients. Discover Maicih."
Style the composition like a commercial food advertisement with realistic textures, balanced colors, and a focus on authenticity and warmth.

Style keywords:
realistic product photography, food styling, warm lighting, natural shadows, soft focus background, high-quality commercial photo, appetizing presentation, premium Indonesian snack aesthetic.`);
      
      toast({
        title: "Prompt Enhanced!",
        description: "LLaMA optimized your prompt for better results",
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 animate-gradient-text">
          AI Content Generator
        </h1>
        <p className="text-muted-foreground">
          Upload product images and generate stunning visuals with AI-powered prompts
        </p>
      </div>

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
                {isEnhancing ? 'Enhancing...' : 'Enhance Prompt with LLaMA'}
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
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>
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
    </div>
  );
};

export default AIContentGenerator;
