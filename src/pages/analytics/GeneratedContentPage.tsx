
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';
import { Calendar, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { imageRequestService } from '@/services/requests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { addImageGeneratedListener } from '@/utils/image/imageEvents';
import { Progress } from '@/components/ui/progress';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  status: 'loading' | 'complete' | 'failed';
  progress: number;
}

const GeneratedContentPage = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    // Load existing requests
    if (user) {
      const requests = imageRequestService.getRequestsByUser(user.id);
      const loadedImages = requests.map(req => ({
        id: req.id,
        imageUrl: req.resultImage || '',
        prompt: req.prompt,
        status: req.status === 'completed' ? 'complete' : req.status === 'failed' ? 'failed' : 'loading',
        progress: req.status === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10,
      }));
      
      setImages(loadedImages);
    }
    
    // Set up listener for newly generated images
    const removeListener = addImageGeneratedListener((event) => {
      const { imageUrl, prompt, requestId } = event.detail;
      
      setImages(prev => {
        // Check if the image is already in the list
        const exists = prev.some(img => img.id === requestId);
        
        if (exists) {
          // Update the existing image
          return prev.map(img => 
            img.id === requestId 
              ? { ...img, imageUrl, status: 'complete', progress: 100 } 
              : img
          );
        } else {
          // Add the new image
          return [...prev, {
            id: requestId || `gen-${Date.now()}`,
            imageUrl,
            prompt: prompt || 'AI generated image',
            status: 'complete',
            progress: 100
          }];
        }
      });
    });
    
    // Listen for progress updates
    const handleProgress = (event: CustomEvent) => {
      const { requestId, progress } = event.detail;
      
      if (!requestId) return;
      
      setImages(prev => 
        prev.map(img => 
          img.id === requestId ? { ...img, progress } : img
        )
      );
    };
    
    window.addEventListener('imageGenerationProgress', handleProgress as EventListener);
    
    return () => {
      removeListener();
      window.removeEventListener('imageGenerationProgress', handleProgress as EventListener);
    };
  }, [user]);
  
  const handleShare = (image: GeneratedImage) => {
    setSelectedImage(image);
    setShowSocialModal(true);
  };
  
  const handleSchedule = (image: GeneratedImage) => {
    setSelectedImage(image);
    setShowScheduleModal(true);
  };
  
  const handlePostToSocial = (platform: string) => {
    toast.success(`Posting to ${platform}...`);
    setShowSocialModal(false);
  };
  
  const handleSchedulePost = (date: string) => {
    toast.success(`Post scheduled for ${date}`);
    setShowScheduleModal(false);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Generated Content</h1>
      
      {images.length === 0 ? (
        <div className="text-center p-12 bg-gray-900/50 rounded-lg">
          <p className="text-gray-400">No generated images yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Select 15 or 25 images per batch in the image generator to see results here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden bg-gray-900/50 border-gray-800">
              <CardHeader className="p-4">
                <CardTitle className="text-sm truncate">
                  {image.prompt}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative aspect-square">
                {image.status === 'loading' ? (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-800">
                    <CircularProgressIndicator progress={image.progress} size="medium" />
                    <div className="mt-4 w-4/5">
                      <Progress value={image.progress} className="h-1" />
                      <p className="text-xs text-center mt-2 text-gray-400">
                        Generating image... {Math.round(image.progress)}%
                      </p>
                    </div>
                  </div>
                ) : image.status === 'failed' ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-800">
                    <p className="text-red-500">Generation failed</p>
                  </div>
                ) : (
                  <img 
                    src={image.imageUrl} 
                    alt={image.prompt}
                    className="h-full w-full object-cover"
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between p-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleShare(image)}
                  disabled={image.status !== 'complete'}
                  className="text-xs"
                >
                  <Share className="h-4 w-4 mr-1" /> Share
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleSchedule(image)}
                  disabled={image.status !== 'complete'}
                  className="text-xs"
                >
                  <Calendar className="h-4 w-4 mr-1" /> Schedule
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Social Media Sharing Modal */}
      {showSocialModal && selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Share to Social Media</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Button 
                onClick={() => handlePostToSocial('Instagram')}
                variant="outline"
                className="flex flex-col h-auto py-4"
              >
                <span className="text-2xl mb-2">📸</span>
                <span>Instagram</span>
              </Button>
              <Button 
                onClick={() => handlePostToSocial('Facebook')}
                variant="outline"
                className="flex flex-col h-auto py-4"
              >
                <span className="text-2xl mb-2">👍</span>
                <span>Facebook</span>
              </Button>
              <Button 
                onClick={() => handlePostToSocial('Twitter')}
                variant="outline"
                className="flex flex-col h-auto py-4"
              >
                <span className="text-2xl mb-2">🐦</span>
                <span>Twitter</span>
              </Button>
            </div>
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setShowSocialModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Modal */}
      {showScheduleModal && selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Schedule Post</h2>
            <div className="mb-4">
              <label className="block text-sm mb-2">Date and Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Caption</label>
              <textarea 
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 h-24"
                placeholder="Write a caption for your post..."
              />
            </div>
            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleSchedulePost(new Date().toLocaleDateString())}
              >
                Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedContentPage;
