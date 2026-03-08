import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Clock, Monitor, Timer, Maximize, Film, UserCheck, UserX } from 'lucide-react';
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
  onUnassign?: (id: string) => void;
  onClaimRequest?: (id: string) => void;
  currentUserId?: string;
}

export const RequestDetails = ({
  request,
  isUploading,
  uploadProgress,
  resultImage,
  onUpdateStatus,
  onUploadResult,
  setResultImage,
  onUnassign,
  currentUserId
}: RequestDetailsProps) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
  const parsed = parsePromptString(request.prompt);
  const isClaimedByMe = request.assigned_to === currentUserId;
  const isClaimed = !!request.assigned_to;

  const getFeatureConfig = (featureLabel: string) => {
    return Object.values(FEATURE_MODE_MAP).find(
      c => c.label.toLowerCase() === featureLabel.toLowerCase()
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 text-foreground">Request Details</h2>
      <div className="mb-4">
        <StatusBadge status={request.status} />
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {formatDate(request.updated_at)}</p>
      </div>
      
      <div className="space-y-4">
        {/* Assigned Editor */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Assigned Editor</h3>
            {isClaimed ? (
              <div className="flex items-center gap-1.5 mt-1">
                <UserCheck className="w-4 h-4 text-green-500" />
                <span className="text-foreground font-medium">
                  {isClaimedByMe ? 'You' : request.assigned_to_name}
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mt-1">Unassigned</p>
            )}
          </div>
          {isClaimed && onUnassign && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUnassign(request.id)}
              className="text-destructive hover:text-destructive gap-1"
            >
              <UserX className="w-3.5 h-3.5" />
              Unassign
            </Button>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">User</h3>
          <p className="text-foreground font-mono text-sm">
            USR-{request.user_id.substring(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground">User #{request.user_id.substring(0, 6).toUpperCase()}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
          <p className="text-foreground capitalize">{request.request_type}</p>
        </div>

        {parsed.features.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Features Selected</h3>
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
          <h3 className="text-sm font-medium text-muted-foreground">Prompt</h3>
          <p className="text-foreground bg-muted/50 p-3 rounded-md">{parsed.prompt}</p>
        </div>

        {(parsed.aspectRatio || parsed.resolution || parsed.duration || parsed.timeline) && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Settings</h3>
            <div className="grid grid-cols-2 gap-2">
              {parsed.aspectRatio && (
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                  <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Aspect</p>
                    <p className="text-foreground text-sm font-medium">{parsed.aspectRatio}</p>
                  </div>
                </div>
              )}
              {parsed.resolution && (
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                  <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Resolution</p>
                    <p className="text-foreground text-sm font-medium">{parsed.resolution}</p>
                  </div>
                </div>
              )}
              {parsed.duration && (
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                  <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Duration</p>
                    <p className="text-foreground text-sm font-medium">{parsed.duration}</p>
                  </div>
                </div>
              )}
              {parsed.timeline && (
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                  <Film className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Timeline</p>
                    <p className="text-foreground text-sm font-medium">{parsed.timeline}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {request.reference_image_url && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Reference / Attachment</h3>
            <div className="mt-1 h-40 bg-muted/50 rounded-md overflow-hidden">
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
            {/* Only show upload section if claimed by current editor */}
            {isClaimedByMe ? (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Upload Result</h3>
                <ImageUploader 
                  productImage={resultImage} 
                  setProductImage={setResultImage} 
                  className="h-40"
                />
                <div className="flex space-x-2 mt-4">
                  {isUploading ? (
                    <div className="w-full flex flex-col items-center justify-center p-4">
                      <CircularProgressIndicator 
                        progress={uploadProgress} 
                        size="medium"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
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
              </>
            ) : isClaimed ? (
              <div className="bg-muted/30 rounded-md p-4 text-center">
                <UserCheck className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Assigned to <span className="font-medium">{request.assigned_to_name}</span>
                </p>
              </div>
            ) : (
            <div className="bg-muted/30 rounded-md p-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Claim this request to start working on it
                </p>
                <Button
                  variant="newPurple"
                  onClick={() => onClaimRequest?.(request.id)}
                  className="gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  Claim Request
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Result</h3>
            {request.result_url ? (
              <div className="mt-1 h-40 bg-muted/50 rounded-md overflow-hidden">
                <img 
                  src={request.result_url} 
                  alt="Result" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No result uploaded</p>
            )}
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed {request.completed_at && `at ${formatDate(request.completed_at)}`}
              {request.assigned_to_name && ` by ${request.assigned_to_name}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
