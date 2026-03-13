import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Image, Video, Clock, CheckCircle, XCircle, Loader2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GenerationRequest } from '@/services/generationRequestService';
import { parsePromptString } from '@/utils/promptParser';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { FEATURE_MODE_MAP } from '@/config/featureModes';
import ReviewFeedbackBox from '@/components/dashboard/ReviewFeedbackBox';
import { supabase } from '@/integrations/supabase/client';

interface RequestDetailViewProps {
  request: GenerationRequest;
  onClose?: () => void;
  onFeedbackSubmitted?: () => void;
}

const statusConfig: Record<string, {
  label: string;
  description: string;
  icon: typeof Clock;
  className: string;
  animate?: boolean;
}> = {
  new: {
    label: 'Processing',
    description: 'Your request is in the queue',
    icon: Loader2,
    className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    animate: true,
  },
  'in-progress': {
    label: 'Processing',
    description: 'Your request is in the queue',
    icon: Loader2,
    className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    animate: true,
  },
  completed: {
    label: 'Completed',
    description: 'Your content is ready!',
    icon: CheckCircle,
    className: 'text-green-500 bg-green-500/10 border-green-500/20',
  },
  failed: {
    label: 'Failed',
    description: 'Something went wrong. Please try again.',
    icon: XCircle,
    className: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
};

const RequestDetailView = ({ request, onClose, onFeedbackSubmitted }: RequestDetailViewProps) => {
  const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.new;
  const StatusIcon = status.icon;
  const parsed = parsePromptString(request.prompt);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (request.result_url) {
      resolveResultUrl(request.result_url).then(setResolvedUrl);
    } else {
      setResolvedUrl(null);
    }
  }, [request.result_url]);

  const getFeatureConfig = (featureLabel: string) => {
    return Object.values(FEATURE_MODE_MAP).find(
      c => c.label.toLowerCase() === featureLabel.toLowerCase()
    );
  };

  const handleDownload = async () => {
    const url = resolvedUrl;
    if (!url) return;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `viralin-${request.request_type}-${request.id.slice(0, 8)}.${request.request_type === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
      {/* Status Banner */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg border",
        status.className
      )}>
        <StatusIcon className={cn("h-5 w-5", status.animate && "animate-spin")} />
        <div>
          <p className="font-medium">{status.label}</p>
          <p className="text-sm opacity-80">{status.description}</p>
        </div>
      </div>

      {/* Request Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {request.request_type === 'video' ? (
            <Video className="h-4 w-4" />
          ) : (
            <Image className="h-4 w-4" />
          )}
          <span className="capitalize">{request.request_type} Generation</span>
          <span className="mx-2">•</span>
          <span>{format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}</span>
        </div>

        {/* Feature Tags */}
        {parsed.features.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Features</h3>
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
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Prompt</h3>
          <p className="text-foreground bg-background/50 rounded-lg p-3 border border-border">
            {parsed.prompt}
          </p>
        </div>

        {/* Settings */}
        {(parsed.aspectRatio || parsed.resolution || parsed.duration) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {parsed.aspectRatio && (
              <span className="bg-background/50 border border-border px-2.5 py-1 rounded-md">
                Aspect: {parsed.aspectRatio}
              </span>
            )}
            {parsed.resolution && (
              <span className="bg-background/50 border border-border px-2.5 py-1 rounded-md">
                Resolution: {parsed.resolution}
              </span>
            )}
            {parsed.duration && (
              <span className="bg-background/50 border border-border px-2.5 py-1 rounded-md">
                Duration: {parsed.duration}
              </span>
            )}
          </div>
        )}

        {/* Reference Image */}
        {request.reference_image_url && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Reference</h3>
            <img
              src={request.reference_image_url}
              alt="Reference"
              className="max-h-40 rounded-lg border border-border object-contain"
            />
          </div>
        )}

        {/* Result */}
        {request.status === 'completed' && resolvedUrl && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Result</h3>
            <div className="relative group">
              {request.request_type === 'video' ? (
                <video
                  src={resolvedUrl}
                  controls
                  className="w-full max-h-80 rounded-lg border border-border"
                />
              ) : (
                <img
                  src={resolvedUrl}
                  alt="Result"
                  className="w-full max-h-80 rounded-lg border border-border object-contain"
                />
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(resolvedUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Completed At */}
        {request.completed_at && (
          <p className="text-sm text-muted-foreground">
            Completed on {format(new Date(request.completed_at), 'MMM d, yyyy h:mm a')}
          </p>
        )}

        {/* Review Feedback */}
        {request.status === 'completed' && (
          <ReviewFeedbackBox
            requestId={request.id}
            prompt={parsed.prompt}
            resultUrl={resolvedUrl || undefined}
            requestType={request.request_type}
            initialRating={existingFeedback?.rating}
            initialFeedback={existingFeedback?.feedback}
            alreadySubmitted={!!existingFeedback}
            onSubmitted={onFeedbackSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default RequestDetailView;
