
import React from 'react';

interface ModelLoaderProps {
  loadingStatus: string;
  loadingProgress: number;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({ loadingStatus, loadingProgress }) => {
  return (
    <div className="p-6 border rounded-md">
      <h3 className="font-medium mb-2">Loading Stable Diffusion Model...</h3>
      <p className="mb-2 text-sm text-gray-500">{loadingStatus}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${loadingProgress}%` }}
        ></div>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        This may take a few minutes on the first run
      </p>
    </div>
  );
};

export default ModelLoader;
