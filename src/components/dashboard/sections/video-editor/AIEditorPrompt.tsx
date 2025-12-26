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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const editingFeatures = [
  { id: 'ai-edit', label: 'AI Edit', icon: Sparkles, description: 'Smart auto-edit with effects & transitions' },
  { id: 'iphone-quality', label: 'iPhone Quality', icon: Smartphone, description: 'Upscale to HD quality' },
  { id: 'trim', label: 'Trim', icon: Scissors, description: 'Cut and trim clips' },
  { id: 'caption', label: 'Caption', icon: Captions, description: 'Add AI captions' },
  { id: 'b-roll', label: 'B-roll', icon: Film, description: 'Add stock footage' },
  { id: 'transitions', label: 'Transitions', icon: Layers, description: 'Add smooth transitions' },
  { id: 'effects', label: 'Effects', icon: Wand2, description: 'Apply visual effects' },
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
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(selectedFeature === featureId ? null : featureId);
    const feature = editingFeatures.find(f => f.id === featureId);
    if (feature) {
      toast.info(`${feature.label} selected`, {
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
      toast.success('Video created successfully!', { id: 'processing' });
    }, 2000);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
        From Imagination to Creation
      </h1>

      {/* Editing Feature Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-4xl">
        {editingFeatures.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleFeatureClick(feature.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              selectedFeature === feature.id
                ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white shadow-lg shadow-[#b616d6]/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50"
            )}
          >
            <feature.icon className="w-4 h-4" />
            {feature.label}
          </button>
        ))}
      </div>

      {/* Example Prompts */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-4xl">
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

      {/* Prompt Box */}
      <div className="w-full max-w-3xl">
        <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
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
            className="min-h-[120px] bg-transparent border-none text-white placeholder:text-slate-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />

          {/* Bottom Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
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
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Upload className="w-5 h-5" />
              </Button>
              <span className="text-xs text-slate-500">Upload images or videos</span>
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
