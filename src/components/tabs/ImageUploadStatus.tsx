
import React from 'react';

interface ImageUploadStatusProps {
  hasProductImage: boolean;
}

const ImageUploadStatus = ({ hasProductImage }: ImageUploadStatusProps) => {
  if (!hasProductImage) return null;
  
  return (
    <div className="mt-2 mb-3 text-xs text-green-400 text-center">
      Product image uploaded successfully
    </div>
  );
};

export default ImageUploadStatus;
