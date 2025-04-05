import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageErrorState from './ImageErrorState'; // Assuming this component exists

// Optional: Define a simpler Loading state component or just use text
const SimpleLoadingIndicator = () => (
  <div className="p-4 text-center text-gray-400">
    Loading Image...
    {/* You could add a simple spinner here if desired */}
  </div>
);

interface ImagePreviewProps {
  // The URL of the image to display
  imageUrl: string | null;

  // Function to call when the user manually clicks retry.
  // This should typically trigger the image generation process again in the parent.
  onRetryRequest: () => void;

  // Optional flag from the parent component indicating if the overall
  // generation process is happening (before an imageUrl is even available).
  isGenerating?: boolean;
}

const ImagePreview = ({
  imageUrl,
  onRetryRequest,
  isGenerating = false // Default to false
}: ImagePreviewProps) => {
  // State specifically for tracking the loading/error status of the HTML <img> tag
  const [isImgTagLoading, setIsImgTagLoading] = useState<boolean>(false);
  const [isImgTagError, setIsImgTagError] = useState<boolean>(false);

  // State to force re-render/reload of the image tag on manual retry
  const [retryKey, setRetryKey] = useState<number>(Date.now()); // Initialize with timestamp

  // Effect runs when the imageUrl changes or when a retry is triggered
  useEffect(() => {
    if (imageUrl) {
      // If we get a new URL, reset error state and set image tag loading to true
      setIsImgTagError(false);
      setIsImgTagLoading(true);
      // Note: The actual loading happens via the <img> tag's src attribute
    } else {
      // If imageUrl is null (e.g., initial state), ensure loading/error are false
      setIsImgTagLoading(false);
      setIsImgTagError(false);
    }
  }, [imageUrl, retryKey]); // Depend on imageUrl and the retryKey

  // Handler for the <img> tag's onLoad event
  const handleImageLoadSuccess = () => {
    console.log("ImagePreview: <img> tag onLoad event fired.");
    setIsImgTagLoading(false);
    setIsImgTagError(false);
  };

  // Handler for the <img> tag's onError event
  const handleImageLoadError = () => {
    console.error("ImagePreview: <img> tag onError event fired.");
    setIsImgTagLoading(false);
    setIsImgTagError(true);
  };

  // Handler for the manual "Retry Load" button click
  const handleManualRetryClick = () => {
    if (imageUrl) {
      console.log("ImagePreview: Manual retry load clicked.");
      // Change the key, which forces the useEffect to run again and
      // implicitly causes React to treat the <img> tag as new, triggering a reload.
      setRetryKey(Date.now());
    } else {
      // If there's no URL, the retry should likely re-trigger generation
      console.log("ImagePreview: Manual retry clicked (no URL), calling onRetryRequest.");
      onRetryRequest();
    }
  };

  // Determine the final loading state to show to the user
  // Show loading if:
  // 1. The parent explicitly says it's generating (isGenerating is true)
  // OR
  // 2. We have an imageUrl, AND the image tag is currently trying to load, AND there's no error yet.
  const showOverallLoading = isGenerating || (imageUrl && isImgTagLoading && !isImgTagError);

  return (
    <div className="mt-6 mb-4 border border-[#8c52ff] rounded-md overflow-hidden">
      <div className="bg-[#8c52ff] px-2 py-1 text-white text-xs flex justify-between items-center">
        <span>Generated Image</span>
        {/* Show the retry button ONLY if the <img> tag specifically encountered an error */}
        {isImgTagError && (
          <Button
            onClick={handleManualRetryClick}
            variant="ghost"
            className="h-5 py-0 px-1 text-white text-xs hover:bg-[#7a45e6] flex items-center"
            aria-label="Retry loading image"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry Load
          </Button>
        )}
      </div>

      <div className="p-2 bg-gray-900 min-h-[200px] flex items-center justify-center relative">
        {/* 1. Show Loading State */}
        {showOverallLoading && <SimpleLoadingIndicator />}

        {/* 2. Show Error State (only if not loading and img tag specifically errored) */}
        {!showOverallLoading && isImgTagError && (
          <ImageErrorState onRetry={handleManualRetryClick} />
        )}

        {/* 3. Show Image (only if not loading, no error, and imageUrl exists) */}
        {!showOverallLoading && !isImgTagError && imageUrl && (
          <img
            key={retryKey} // Use key to force reload on retry
            src={imageUrl}
            alt="Generated content" // Consider adding more descriptive alt text if prompt is available
            className="max-w-full max-h-full object-contain rounded"
            onLoad={handleImageLoadSuccess}
            onError={handleImageLoadError}
            // Hide the image element itself while its specific loading is happening
            // to prevent browser's broken image icon from briefly showing.
            style={{ display: isImgTagLoading ? 'none' : 'block' }}
          />
        )}

         {/* 4. Show Placeholder (only if not loading, no error, and no imageUrl) */}
         {!showOverallLoading && !isImgTagError && !imageUrl && (
             <div className="text-center text-gray-500">Image will appear here</div>
         )}
      </div>
    </div>
  );
};

export default ImagePreview;