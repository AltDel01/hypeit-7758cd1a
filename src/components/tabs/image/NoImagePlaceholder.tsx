
import React from 'react';

const NoImagePlaceholder = () => {
  return (
    <div className="text-gray-400 text-center p-8">
      <p>No generated image yet</p>
      <p className="text-xs mt-2">Fill out the form and click Generate to create an image</p>
    </div>
  );
};

export default NoImagePlaceholder;
