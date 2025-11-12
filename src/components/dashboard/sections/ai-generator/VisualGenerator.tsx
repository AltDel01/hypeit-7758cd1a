import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, Play, Image as ImageIcon, Type, Grid3X3, Edit3, Expand, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import demoResult from '@/assets/demo-result.png';

// Import the Seedream API
import { SeedreamAPI } from '@/services/tmp-api.js';

type GenerationMode = 'text-to-image' | 'text-to-x4' | 'image-edit' | 'image-to-image' | 'image-to-x4' | 'image-reference';

const VisualGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a generation prompt",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    
    try {
      let response;
      
      // Call the actual Seedream 4.0 API based on generation mode
      switch (generationMode) {
        case 'text-to-image':
          response = await SeedreamAPI.generateSingleImage(prompt, {
            size: '2K',
            watermark: false
          });
          break;
        case 'text-to-x4':
          response = await SeedreamAPI.generateMultipleImages(prompt, 4, {
            size: '2K',
            watermark: false
          });
          break;
        case 'image-edit':
          if (referenceImages.length === 0) {
            toast({
              title: "Missing Reference Image",
              description: "Please upload a reference image for editing",
              variant: "destructive"
            });
            setIsGenerating(false);
            return;
          }
          response = await SeedreamAPI.editImage(prompt, referenceImages[0], {
            size: '2K',
            watermark: false
          });
          break;
        case 'image-to-image':
          if (referenceImages.length === 0) {
            toast({
              title: "Missing Reference Image",
              description: "Please upload a reference image for image-to-image generation",
              variant: "destructive"
            });
            setIsGenerating(false);
            return;
          }
          response = await SeedreamAPI.editImage(prompt, referenceImages[0], {
            size: '2K',
            watermark: false
          });
          break;
        case 'image-to-x4':
          if (referenceImages.length === 0) {
            toast({
              title: "Missing Reference Image",
              description: "Please upload a reference image for expansion",
              variant: "destructive"
            });
            setIsGenerating(false);
            return;
          }
          response = await SeedreamAPI.expandImageToMultiples(prompt, referenceImages[0], 4, {
            size: '2K',
            watermark: false
          });
          break;
        case 'image-reference':
          if (referenceImages.length === 0) {
            toast({
              title: "Missing Reference Images",
              description: "Please upload at least one reference image (up to 10 supported)",
              variant: "destructive"
            });
            setIsGenerating(false);
            return;
          }
          response = await SeedreamAPI.generateWithReferenceImages(prompt, referenceImages, {
            size: '2K',
            watermark: false
          });
          break;
        default:
          response = await SeedreamAPI.generateSingleImage(prompt, {
            size: '2K',
            watermark: false
          });
      }
      
      // Extract images from response
      if (response && response.data) {
        const imageUrls = response.data.map((item: any) => item.url || item);
        setGeneratedImages(imageUrls);
        
        toast({
          title: "Content Generated!",
          description: `Generated ${imageUrls.length} image(s) successfully`,
        });
      } else {
        throw new Error('Invalid response from API');
      }
      
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Remove mock simulation functions - now using real API

  const handleRegenerate = () => {
    setGeneratedImages([]);
    handleGenerate();
  };

  const handleModeChange = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setGeneratedImages([]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Validate maximum 10 images
      if (referenceImages.length + files.length > 10) {
        toast({
          title: "Maximum Images Reached",
          description: "You can upload a maximum of 10 reference images",
          variant: "destructive"
        });
        return;
      }

      const newImages: string[] = [];
      let processedCount = 0;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            processedCount++;
            
            // When all files are processed, update state
            if (processedCount === files.length) {
              setReferenceImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Generation Mode Selection */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <div className="space-y-4">
          <div>
            <Label className="text-white font-medium mb-2 block">Generation Mode</Label>
            <Select value={generationMode} onValueChange={handleModeChange}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="text-to-image" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text to Image
                  </div>
                </SelectItem>
                <SelectItem value="text-to-x4" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    Text to x4 Images
                  </div>
                </SelectItem>
                <SelectItem value="image-edit" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Image Editing
                  </div>
                </SelectItem>
                <SelectItem value="image-to-image" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    Image to Image Edit
                  </div>
                </SelectItem>
                <SelectItem value="image-to-x4" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Expand className="w-4 h-4" />
                    Image to x4 Expand
                  </div>
                </SelectItem>
                <SelectItem value="image-reference" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image with Reference
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div>
            <Label htmlFor="prompt" className="text-white font-medium mb-2 block">
              {generationMode.includes('image') && !generationMode.includes('text') ? 'Edit Prompt' : 'Generation Prompt'}
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Enter your ${generationMode.replace('-', ' ')} prompt...`}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
            />
          </div>

          {/* Reference Image Upload for Image-based modes */}
          {(generationMode.includes('image') && !generationMode.includes('text-to')) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white font-medium">
                  {generationMode === 'image-reference' ? 'Reference Images' : 'Reference Image'}
                </Label>
                {generationMode === 'image-reference' && (
                  <span className="text-xs text-slate-400">
                    {referenceImages.length}/10 images
                  </span>
                )}
              </div>
              
              {/* Multiple Reference Images Grid */}
              {generationMode === 'image-reference' && referenceImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-3 auto-rows-fr">
                  {referenceImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Reference ${index + 1}`} 
                        className="w-full h-full object-contain rounded-md border border-slate-600 hover:border-slate-500 transition-colors bg-slate-900/30"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => removeReferenceImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Single Reference Image for non-multiple modes */}
              {(generationMode !== 'image-reference' && referenceImages.length > 0) && (
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-3">
                  <div className="relative inline-block">
                    <img 
                      src={referenceImages[0]} 
                      alt="Reference" 
                      className="max-h-32 w-auto object-contain rounded-md border border-slate-600 hover:border-slate-500 transition-colors bg-slate-900/30"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setReferenceImages([])}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 shadow-lg hover:scale-110 transition-all duration-200"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                <FileImage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <Label className="cursor-pointer text-slate-400 hover:text-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple={generationMode === 'image-reference'}
                    disabled={generationMode === 'image-reference' && referenceImages.length >= 10}
                  />
                  {generationMode === 'image-reference' 
                    ? `Click to upload reference images (${referenceImages.length}/10)`
                    : 'Click to upload reference image'
                  }
                </Label>
                {generationMode === 'image-reference' && referenceImages.length >= 10 && (
                  <p className="text-xs text-red-400 mt-1">Maximum 10 images reached</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* Result Gallery */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            Result Gallery
          </h2>
          {generatedImages.length > 0 && (
            <Button 
              onClick={handleRegenerate}
              variant="outline" 
              size="sm"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Variation
            </Button>
          )}
        </div>
        
        <div className="min-h-[500px] border-2 border-dashed border-slate-600 rounded-lg overflow-hidden relative bg-gradient-to-br from-slate-900/50 to-slate-800/50">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Wand2 className="w-16 h-16 text-purple-400 animate-spin" />
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-cyan-400/10 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center space-y-3">
                  <p className="text-white font-semibold text-lg">Creating your content</p>
                  <p className="text-muted-foreground">AI is working its magic...</p>
                  <div className="w-64 h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 animate-[progress_3s_ease-in-out_infinite] rounded-full"></div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : generatedImages.length > 0 ? (
            <div className={`p-6 ${generatedImages.length > 1 ? 'grid grid-cols-2 gap-4' : 'flex items-center justify-center'}`}>
              {generatedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image} 
                    alt={`Generated result ${index + 1}`} 
                    className="w-full h-auto max-h-80 object-contain rounded-lg border border-slate-600"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  {generatedImages.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Variant {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">Your generated content will appear here</p>
                  <p className="text-muted-foreground text-sm mt-2">Select a generation mode and click "Generate" to create amazing visuals with AI</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VisualGenerator;
