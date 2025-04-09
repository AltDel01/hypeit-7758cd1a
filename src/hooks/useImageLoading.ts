
import { useState, useEffect, useRef } from 'react';
import { forceImageGenerationRetry } from '@/utils/image/imageEvents';

interface UseImageLoadingProps {
  imageUrl: string | null;
  prompt: string;
  onRetry: () => void;
}

export function useImageLoading({ imageUrl, prompt, onRetry }: UseImageLoadingProps) {
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const progressIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (imageUrl) {
      console.log("ImagePreview: New image URL received:", imageUrl?.substring(0, 50) + "...");
      setImageLoading(true);
      setImageError(false);
      
      // Start animated progress
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set a hard timeout for loading
      loadingTimeoutRef.current = window.setTimeout(() => {
        console.log("Hard loading timeout reached, triggering retry");
        handleImageRetry();
      }, 30000); // 30 seconds maximum total loading time
      
      // Realistic progress animation
      progressIntervalRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 20) return prev + 2;
          if (prev < 50) return prev + 1;
          if (prev < 80) return prev + 0.5;
          if (prev < 90) return prev + 0.2;
          // Force timeout if stuck at 90+ for too long
          if (prev >= 90 && timeoutRef.current === null) {
            console.log("Progress stuck at 90+%, setting timeout");
            timeoutRef.current = window.setTimeout(() => {
              console.log("Loading timeout reached, forcing retry");
              handleImageRetry();
            }, 10000); // 10 seconds timeout if stuck at high percentage
          }
          return prev < 98 ? prev + 0.1 : prev;
        });
      }, 200);
    } else {
      // Reset loading state when imageUrl is null
      setImageLoading(false);
      setLoadingProgress(0);
      
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [imageUrl]);

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setImageError(false);
    setImageLoading(false);
    setLoadingProgress(100);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const handleImageError = () => {
    console.log("Image failed to load, marking as error");
    setImageError(true);
    setImageLoading(false);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Auto-retry once for images
    if (retryCount === 0) {
      console.log("Auto-retrying image load");
      setTimeout(() => handleImageRetry(), 1000);
    }
  };

  const handleImageRetry = () => {
    console.log("Handling image retry");
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setRetryCount(prev => prev + 1);
    setLoadingProgress(0);
    setImageLoading(true);
    setImageError(false);
    
    // Call the onRetry callback
    onRetry();
    
    // Also trigger a retry through the event system to ensure all components are aware
    if (prompt) {
      forceImageGenerationRetry(prompt);
    }
  };

  return {
    imageError,
    imageLoading,
    loadingProgress,
    retryCount,
    handleImageLoad,
    handleImageError,
    handleImageRetry
  };
}
