import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Clock, Monitor, Timer, Maximize, Film } from 'lucide-react';
import ImageUploader from '@/components/tabs/ImageUploader';
import CircularProgressIndicator from '@/components/ui/loading/CircularProgressIndicator';
import { StatusBadge } from './StatusBadge';
import { parsePromptString } from '@/utils/promptParser';
import { FEATURE_MODE_MAP } from '@/config/featureModes';
import type { GenerationRequest } from '@/services/generationRequestService';

interface RequestDetailsProps {
  request: GenerationRequest;
  isUploading: boolean;
  uploadProgress: number;
  resultImage: File | null;
  onUpdateStatus: (id: string, status: 'in-progress') => void;
  onUploadResult: () => void;
  setResultImage: (file: File | null) => void;
}

export const RequestDetails = ({
  request,
  isUploading,
  uploadProgress,
  resultImage,
  onUpdateStatus,
  onUploadResult,
  setResultImage
}: RequestDetailsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const parsed = parsePromptString(request.prompt);

  // Find matching feature config for color styling
  const getFeatureConfig = (featureLabel: string) => {
    return Object.values(FEATURE_MODE_MAP).find(
      c => c.label.toLowerCase() === featureLabel.toLowerCase()
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 text-white">Request Details</h2>
      <div className="mb-4">
        <StatusBadge status={request.status} />
        <p className="mt-2 text-sm text-gray-400">Last updated: {formatDate(request.updated_at)}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400">User</h3>
          <p className="text-white">{request.user_name || request.user_email}</p>
          <p className="text-xs text-gray-500">{request.user_email}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400">Type</h3>
          <p className="text-white capitalize">{request.request_type}</p>
        </div>

        {/* Feature Tags */}
        {parsed.features.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Features Selected</h3>
            <div className="flex flex-wrap gap-2">
              {parsed.features.map((feature) => {
                const config = getFeatureConfig(feature);
                const Icon = config?.icon;
                return (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: config
                        ? `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})`
                        : 'linear-gradient(135deg, #8c52ff, #b616d6)',
                    }}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {feature}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-gray-400">Prompt</h3>
          <p className="text-white bg-gray-800/50 p-3 rounded-md">{parsed.prompt}</p>
        </div>

        {/* Settings Row */}
        {(parsed.aspectRatio || parsed.resolution || parsed.duration || parsed.timeline) && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Settings</h3>
            <div className="grid grid-cols-2 gap-2">
              {parsed.aspectRatio && (
                <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-md">
                  <Maximize className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Aspect</p>
                    <p className="text-white text-sm font-medium">{parsed.aspectRatio}</p>
                  </div>
                </div>
              )}
              {parsed.resolution && (
                <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-md">
                  <Monitor className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Resolution</p>
                    <p className="text-white text-sm font-medium">{parsed.resolution}</p>
                  </div>
                </div>
              )}
              {parsed.duration && (
                <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-md">
                  <Timer className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Duration</p>
                    <p className="text-white text-sm font-medium">{parsed.duration}</p>
                  </div>
                </div>
              )}
              {parsed.timeline && (
                <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-md">
                  <Film className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Timeline</p>
                    <p className="text-white text-sm font-medium">{parsed.timeline}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {request.reference_image_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-400">Reference / Attachment</h3>
            <div className="mt-1 h-40 bg-gray-800/50 rounded-md overflow-hidden">
              <img 
                src={request.reference_image_url} 
                alt="Reference" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        
        {request.status !== 'completed' ? (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Upload Result</h3>
            <ImageUploader 
              productImage={resultImage} 
              setProductImage={setResultImage} 
              className="h-40"
            />
            
            {request.status === 'new' ? (
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => onUpdateStatus(request.id, 'in-progress')}
                  className="flex-1"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Mark In Progress
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2 mt-4">
                {isUploading ? (
                  <div className="w-full flex flex-col items-center justify-center p-4">
                    <CircularProgressIndicator 
                      progress={uploadProgress} 
                      size="medium"
                    />
                    <p className="mt-2 text-sm text-gray-400">Uploading...</p>
                  </div>
                ) : (
                  <Button 
                    variant="newPurple"
                    disabled={!resultImage}
                    onClick={onUploadResult}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Complete
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium text-gray-400">Result</h3>
            {request.result_url ? (
              <div className="mt-1 h-40 bg-gray-800/50 rounded-md overflow-hidden">
                <img 
                  src={request.result_url} 
                  alt="Result" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No result uploaded</p>
            )}
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed {request.completed_at && `at ${formatDate(request.completed_at)}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
