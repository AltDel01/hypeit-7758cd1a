import React, { useState, useRef } from 'react';
import { Image, Video, Upload, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createGenerationRequest } from '@/services/generationRequestService';
import { supabase } from '@/integrations/supabase/client';

interface SimplifiedDashboardProps {
  onRequestCreated?: () => void;
}

const SimplifiedDashboard = ({ onRequestCreated }: SimplifiedDashboardProps) => {
  const [prompt, setPrompt] = useState('');
  const [requestType, setRequestType] = useState<'image' | 'video'>('image');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
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
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            What do you want to create?
          </h1>
          <p className="text-muted-foreground">
            Describe your vision and we'll bring it to life
          </p>
        </div>

        {/* Main Input Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4">
          {/* Prompt Textarea */}
          <Textarea
            placeholder="Describe your image or video in detail..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none bg-background/50 border-border focus:border-primary"
            disabled={isSubmitting}
          />

          {/* Reference Image Preview */}
          {referenceImage && (
            <div className="relative inline-block">
              <img
                src={referenceImage}
                alt="Reference"
                className="h-20 w-20 object-cover rounded-lg border border-border"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setRequestType('image')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  requestType === 'image'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                disabled={isSubmitting}
              >
                <Image className="h-4 w-4" />
                Image
              </button>
              <button
                onClick={() => setRequestType('video')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  requestType === 'video'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                disabled={isSubmitting}
              >
                <Video className="h-4 w-4" />
                Video
              </button>
            </div>

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Reference Image
            </Button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Generate Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !prompt.trim()}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Generate'}
            </Button>
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
