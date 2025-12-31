import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Scissors, 
  Captions, 
  Film, 
  Layers, 
  Wand2, 
  Image,
  Upload,
  Video,
  X,
  ZoomIn,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import demoVideo from '@/assets/jake-paul-demo.mp4';

const editingFeatures = [
  { id: 'ai-edit', label: 'AI Edit', icon: Sparkles, description: 'Smart auto-edit with effects & transitions' },
  { id: 'iphone-quality', label: 'iPhone Quality', icon: Smartphone, description: 'Upscale to HD quality' },
  { id: 'trim', label: 'Trim', icon: Scissors, description: 'Cut and trim clips' },
  { id: 'caption', label: 'Caption', icon: Captions, description: 'Add AI captions' },
  { id: 'b-roll', label: 'B-roll', icon: Film, description: 'Add stock footage' },
  { id: 'transitions', label: 'Transitions', icon: Layers, description: 'Add smooth transitions' },
  { id: 'effects', label: 'Effects', icon: Wand2, description: 'Apply visual effects' },
  { id: 'zoom', label: 'Zoom', icon: ZoomIn, description: 'Add dynamic zoom effects' },
  { id: 'thumbnail', label: 'Thumbnail Generator', icon: Image, description: 'Create eye-catching thumbnails' },
];

const examplePrompts = [
  'Add captions with trending font style',
  'Create smooth transitions between scenes',
  'Enhance colors and add cinematic look',
  'Add upbeat background music',
  'Generate viral short from this video',
  'Add zoom effects on key moments',
];

const AIEditorPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
    const feature = editingFeatures.find(f => f.id === featureId);
    if (feature) {
      const isSelected = !selectedFeatures.includes(featureId);
      toast.info(`${feature.label} ${isSelected ? 'added' : 'removed'}`, {
        description: feature.description
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!prompt.trim() && uploadedFiles.length === 0) {
      toast.error('Please enter a prompt or upload media');
      return;
    }
    
    setIsProcessing(true);
    toast.loading('Processing your video...', { id: 'processing' });
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsGenerated(true);
      toast.success('Video created successfully!', { id: 'processing' });
    }, 2000);
  };

  const handleBackToEditor = () => {
    setIsGenerated(false);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  // Generated video result view
  if (isGenerated) {
    return (
      <div className="animate-fade-in space-y-6 px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToEditor}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Button>
          <h2 className="text-xl font-semibold text-foreground">Generated AI Video</h2>
        </div>
        
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-muted-foreground/20">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Video Player */}
            <div className="flex-1">
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video 
                  src={demoVideo}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Actions Sidebar */}
            <div className="lg:w-64 space-y-4">
              <h3 className="text-foreground font-medium">Export Options</h3>
              <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4" />
                Download Video
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <div className="pt-4 border-t border-muted-foreground/20">
                <p className="text-sm text-muted-foreground mb-2">Video Details</p>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">Format: MP4</p>
                  <p className="text-foreground">Features: {selectedFeatures.length > 0 ? selectedFeatures.map(id => editingFeatures.find(f => f.id === id)?.label).join(', ') : 'AI Edit'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Title */}
      <h1 className="relative z-10 inline-block text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 leading-tight py-1 px-4 bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent shadow-glow">
        Create Stop Scrolling Video
      </h1>

      {/* Editing Feature Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-4xl">
        {editingFeatures.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleFeatureClick(feature.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              selectedFeatures.includes(feature.id)
                ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-[#b616d6]/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50"
            )}
          >
            <feature.icon className="w-4 h-4" />
            {feature.label}
          </button>
        ))}
      </div>

      {/* Prompt Box */}
      <div className="w-full max-w-4xl">
        <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm"
                >
                  {file.type.startsWith('video/') ? (
                    <Video className="w-4 h-4 text-[#b616d6]" />
                  ) : (
                    <Image className="w-4 h-4 text-[#8c52ff]" />
                  )}
                  <span className="text-slate-300 max-w-[150px] truncate">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want to edit your video, or what video you want to create..."
            className="min-h-[160px] bg-transparent border-none text-white placeholder:text-slate-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />

          {/* Example Prompts inside box */}
          <div className="flex flex-wrap gap-2 mb-4 mt-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 rounded-full text-sm bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50 transition-all duration-200"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <Button
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
              >
                <Film className="w-5 h-5" />
                <span className="text-sm">Upload Images or Videos</span>
              </Button>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              disabled={isProcessing}
              className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow-lg shadow-[#b616d6]/30 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isProcessing ? 'Creating...' : 'Create Video'}
            </Button>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-slate-500 text-sm mt-4 text-center">
        Upload your media and describe your vision — our AI handles the rest
      </p>
    </div>
  );
};

export default AIEditorPrompt;
