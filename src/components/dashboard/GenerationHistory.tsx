import React from 'react';
import { format } from 'date-fns';
import { Image, Video, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GenerationRequest } from '@/services/generationRequestService';

interface GenerationHistoryProps {
  requests: GenerationRequest[];
  selectedId: string | null;
  onSelect: (request: GenerationRequest) => void;
  isLoading?: boolean;
}

const statusConfig: Record<string, {
  label: string;
  icon: typeof Clock;
  className: string;
  animate?: boolean;
}> = {
  new: {
    label: 'Pending',
    icon: Clock,
    className: 'text-yellow-500 bg-yellow-500/10',
  },
  'in-progress': {
    label: 'Processing',
    icon: Loader2,
    className: 'text-blue-500 bg-blue-500/10',
    animate: true,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'text-green-500 bg-green-500/10',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'text-red-500 bg-red-500/10',
  },
};

const GenerationHistory = ({ 
  requests, 
  selectedId, 
  onSelect, 
  isLoading 
}: GenerationHistoryProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="bg-muted/50 rounded-full p-4 mb-3">
          <Image className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No requests yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your generation history will appear here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        {requests.map((request) => {
          const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.new;
          const StatusIcon = status.icon;
          const isSelected = selectedId === request.id;

          return (
            <button
              key={request.id}
              onClick={() => onSelect(request)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                "hover:bg-accent/50",
                isSelected
                  ? "bg-accent border-primary/50"
                  : "bg-card/50 border-border"
              )}
            >
              {/* Header Row */}
              <div className="flex items-center gap-2 mb-2">
                {request.request_type === 'video' ? (
                  <Video className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Image className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground capitalize">
                  {request.request_type}
                </span>
                <div className="flex-1" />
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                    status.className
                  )}
                >
                  <StatusIcon className={cn("h-3 w-3", status.animate && "animate-spin")} />
                  {status.label}
                </span>
              </div>

              {/* Prompt Preview */}
              <p className="text-sm text-foreground line-clamp-2 mb-2">
                {request.prompt}
              </p>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground">
                {format(new Date(request.created_at), 'MMM d, h:mm a')}
              </p>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default GenerationHistory;
