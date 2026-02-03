import React, { useState, useRef } from 'react';
import { Image, Video, Upload, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createGenerationRequest } from '@/services/generationRequestService';
import { supabase } from '@/integrations/supabase/client';

interface SimplifiedDashboardProps {
  onRequestCreated?: () => void;
}

const SUGGESTION_CHIPS = [
  "Create product showcase with modern aesthetic",
  "Generate viral short video clip",
  "Design eye-catching social media post",
  "Add cinematic color grading",
  "Create trending thumbnail design",
];

const SimplifiedDashboard = ({ onRequestCreated }: SimplifiedDashboardProps) => {
  const [prompt, setPrompt] = useState('');
  const [requestType, setRequestType] = useState<'image' | 'video'>('image');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload images');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('Product Images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('Product Images')
        .getPublicUrl(fileName);

      setReferenceImage(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChipClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createGenerationRequest({
        requestType,
        prompt: prompt.trim(),
        referenceImageUrl: referenceImage || undefined,
      });

      if (result) {
        toast.success('Request submitted! We\'ll notify you when it\'s ready.');
        setPrompt('');
        setReferenceImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onRequestCreated?.();
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            What do you want to create?
          </h1>
          <p className="text-muted-foreground">
            Describe your vision and we'll bring it to life
          </p>
        </div>

        {/* Main Input Card - Styled like homepage */}
        <div className="bg-[#1A1F2C] border border-[#8c52ff]/30 rounded-2xl overflow-hidden">
          {/* Textarea */}
          <div className="p-6 pb-4">
            <textarea
              placeholder="Describe what you want to create, generate, or edit..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-[140px] bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none text-base leading-relaxed"
              disabled={isSubmitting}
            />
          </div>

          {/* Reference Image Preview */}
          {referenceImage && (
            <div className="px-6 pb-4">
              <div className="relative inline-block">
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="h-20 w-20 object-cover rounded-lg border border-[#8c52ff]/30"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Suggestion Chips */}
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map((chip, index) => (
                <button
                  key={index}
                  onClick={() => handleChipClick(chip)}
                  className="px-4 py-2 text-sm text-gray-300 bg-[#252a38] border border-[#8c52ff]/20 rounded-full hover:border-[#8c52ff]/50 hover:bg-[#2a2f3d] transition-all"
                  disabled={isSubmitting}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="px-6 py-4 border-t border-[#8c52ff]/20 bg-[#151820]">
            <div className="flex flex-wrap items-center gap-3">
              {/* Upload Buttons */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 bg-[#252a38] border border-[#8c52ff]/20 rounded-lg hover:border-[#8c52ff]/50 hover:text-white transition-all"
              >
                <Upload className="h-4 w-4" />
                <span className="text-xs">Upload</span>
              </button>

              {/* Type Toggle */}
              <div className="flex items-center bg-[#252a38] border border-[#8c52ff]/20 rounded-lg p-1">
                <button
                  onClick={() => setRequestType('image')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    requestType === 'image'
                      ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                  disabled={isSubmitting}
                >
                  <Image className="h-4 w-4" />
                  Image
                </button>
                <button
                  onClick={() => setRequestType('video')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    requestType === 'video'
                      ? "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                  disabled={isSubmitting}
                >
                  <Video className="h-4 w-4" />
                  Video
                </button>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Generate Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !prompt.trim()}
                className="gap-2 px-6 py-2 bg-gradient-to-r from-[#8c52ff] to-[#b616d6] hover:from-[#7a45e6] hover:to-[#a014c4] text-white font-medium rounded-lg transition-all"
              >
                <Sparkles className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-sm text-muted-foreground">
          Your request will be processed by our team. You'll receive a notification when it's ready.
        </p>
      </div>
    </div>
  );
};

export default SimplifiedDashboard;
