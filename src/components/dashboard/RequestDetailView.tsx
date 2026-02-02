import React from 'react';
import { format } from 'date-fns';
import { Image, Video, Clock, CheckCircle, XCircle, Loader2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GenerationRequest } from '@/services/generationRequestService';

interface RequestDetailViewProps {
  request: GenerationRequest;
  onClose?: () => void;
}

const statusConfig: Record<string, {
  label: string;
  description: string;
  icon: typeof Clock;
  className: string;
  animate?: boolean;
}> = {
  new: {
    label: 'Pending',
    description: 'Your request is in the queue',
    icon: Clock,
    className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  },
  'in-progress': {
    label: 'Processing',
    description: 'Our team is working on your request',
    icon: Loader2,
    className: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
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

const RequestDetailView = ({ request, onClose }: RequestDetailViewProps) => {
  const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.new;
  const StatusIcon = status.icon;

  const handleDownload = async () => {
    if (!request.result_url) return;
    
    try {
      const response = await fetch(request.result_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `viralin-${request.request_type}-${request.id.slice(0, 8)}.${request.request_type === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Prompt</h3>
          <p className="text-foreground bg-background/50 rounded-lg p-3 border border-border">
            {request.prompt}
          </p>
        </div>

        {/* Reference Image */}
        {request.reference_image_url && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Reference Image</h3>
            <img
              src={request.reference_image_url}
              alt="Reference"
              className="max-h-40 rounded-lg border border-border object-contain"
            />
          </div>
        )}

        {/* Result */}
        {request.status === 'completed' && request.result_url && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Result</h3>
            <div className="relative group">
              {request.request_type === 'video' ? (
                <video
                  src={request.result_url}
                  controls
                  className="w-full max-h-80 rounded-lg border border-border"
                />
              ) : (
                <img
                  src={request.result_url}
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
                  onClick={() => window.open(request.result_url!, '_blank')}
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
      </div>
    </div>
  );
};

export default RequestDetailView;
