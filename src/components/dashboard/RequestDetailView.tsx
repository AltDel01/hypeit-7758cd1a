import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Image, Video, Clock, CheckCircle, XCircle, Loader2, Download, ExternalLink, FileText, Music2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GenerationRequest } from '@/services/generationRequestService';
import { parsePromptString } from '@/utils/promptParser';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { FEATURE_MODE_MAP } from '@/config/featureModes';
import ReviewFeedbackBox from '@/components/dashboard/ReviewFeedbackBox';
import { supabase } from '@/integrations/supabase/client';
import { getMediaFileName, MediaKind, resolveMediaKind, splitStoredAttachmentUrls } from '@/utils/requestMedia';

interface RequestDetailViewProps {
  request: GenerationRequest;
  onClose?: () => void;
  onFeedbackSubmitted?: () => void;
}

interface ResolvedAttachmentItem {
  rawUrl: string;
  resolvedUrl: string | null;
  mediaKind: MediaKind;
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

const getFileName = (url: string) => {
  return decodeURIComponent(getMediaFileName(url));
};

const RequestDetailView = ({ request, onClose, onFeedbackSubmitted }: RequestDetailViewProps) => {
  const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.new;
  const StatusIcon = status.icon;
  const parsed = parsePromptString(request.prompt);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [resolvedImages, setResolvedImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<ResolvedAttachmentItem[]>([]);
  const [resultMediaKind, setResultMediaKind] = useState<MediaKind>('file');

  useEffect(() => {
    let active = true;

    const resolveResult = async () => {
      if (!request.result_url) {
        if (active) {
          setResolvedUrl(null);
          setResultMediaKind('file');
        }
        return;
      }

      const nextResolvedUrl = await resolveResultUrl(request.result_url);
      if (!active) return;

      setResolvedUrl(nextResolvedUrl);
      const nextMediaKind = await resolveMediaKind(request.result_url, nextResolvedUrl);
      if (active) setResultMediaKind(nextMediaKind);
    };

    resolveResult();

    return () => {
      active = false;
    };
  }, [request.result_url]);

  useEffect(() => {
    let active = true;

    const resolveImages = async () => {
      const images = Array.isArray(request.result_images) ? request.result_images : [];
      if (images.length === 0) {
        if (active) setResolvedImages([]);
        return;
      }
      const resolved = await Promise.all(images.map((url) => resolveResultUrl(url)));
      if (active) setResolvedImages(resolved.filter((u): u is string => Boolean(u)));
    };

    resolveImages();

    return () => {
      active = false;
    };
  }, [request.result_images]);

  useEffect(() => {
    const resolveAttachments = async () => {
      if (!request.reference_image_url) {
        setAttachments([]);
        return;
      }

      const rawUrls = splitStoredAttachmentUrls(request.reference_image_url);

      const resolvedUrls = await Promise.all(rawUrls.map((url) => resolveResultUrl(url)));
      const mediaKinds = await Promise.all(
        rawUrls.map((rawUrl, index) => resolveMediaKind(rawUrl, resolvedUrls[index] ?? null))
      );

      setAttachments(
        rawUrls.map((rawUrl, index) => ({
          rawUrl,
          resolvedUrl: resolvedUrls[index] ?? null,
          mediaKind: mediaKinds[index],
        }))
      );
    };

    resolveAttachments();
  }, [request.reference_image_url]);

  const getFeatureConfig = (featureLabel: string) => {
    return Object.values(FEATURE_MODE_MAP).find(
      c => c.label.toLowerCase() === featureLabel.toLowerCase()
    );
  };

  const handleVideoPlay = async () => {
    if (resultMediaKind !== 'video') return;
    try {
      await supabase
        .from('generation_requests')
        .update({ video_played_at: new Date().toISOString() })
        .eq('id', request.id)
        .is('video_played_at', null);
    } catch (error) {
      console.error('Error tracking video play:', error);
    }
  };

  const handleDownload = async (overrideUrl?: string, index?: number) => {
    const url = overrideUrl || resolvedUrl;
    if (!url) return;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const mediaKind = resultMediaKind || 'image';
      const extension = mediaKind === 'video' ? 'mp4' : mediaKind === 'audio' ? 'mp3' : mediaKind === 'file' ? 'bin' : 'png';
      a.download = `viralin-${request.request_type}-${request.id.slice(0, 8)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      if (resultMediaKind === 'video') {
        await supabase
          .from('generation_requests')
          .update({ video_downloaded_at: new Date().toISOString() })
          .eq('id', request.id)
          .is('video_downloaded_at', null);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-lg border',
        status.className
      )}>
        <StatusIcon className={cn('h-5 w-5', status.animate && 'animate-spin')} />
        <div>
          <p className="font-medium">{status.label}</p>
          <p className="text-sm opacity-80">{status.description}</p>
        </div>
      </div>

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

        {attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">References ({attachments.length})</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {attachments.map((attachment, idx) => {
                const displayUrl = attachment.resolvedUrl;
                const mediaKind = attachment.mediaKind;

                if (!displayUrl) {
                  return (
                    <div key={idx} className="rounded-lg border border-border bg-background/50 p-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="truncate">{getFileName(attachment.rawUrl)}</span>
                      </div>
                      <p className="mt-2 text-xs">Attachment unavailable</p>
                    </div>
                  );
                }

                 if (mediaKind === 'video') {
                  return (
                    <div key={idx} className="rounded-lg border border-border overflow-hidden bg-background/50">
                      <video src={displayUrl} controls className="w-full max-h-52 object-contain bg-black" />
                      <div className="flex items-center justify-between gap-2 p-3 border-t border-border">
                        <span className="truncate text-xs text-muted-foreground">{getFileName(attachment.rawUrl)}</span>
                        <Button variant="outline" size="sm" onClick={() => window.open(displayUrl, '_blank')} className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </Button>
                      </div>
                    </div>
                  );
                }

                 if (mediaKind === 'audio') {
                  return (
                    <div key={idx} className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Music2 className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{getFileName(attachment.rawUrl)}</span>
                      </div>
                      <audio src={displayUrl} controls className="w-full" />
                    </div>
                  );
                }

                 if (mediaKind === 'image') {
                  return (
                    <div key={idx} className="rounded-lg border border-border overflow-hidden bg-background/50">
                      <img
                        src={displayUrl}
                        alt={`Reference ${idx + 1}`}
                        className="w-full max-h-52 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center gap-2 p-4 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{getFileName(attachment.rawUrl)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-3 border-t border-border">
                        <span className="truncate text-xs text-muted-foreground">{getFileName(attachment.rawUrl)}</span>
                        <Button variant="outline" size="sm" onClick={() => window.open(displayUrl, '_blank')} className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="rounded-lg border border-border bg-background/50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{getFileName(attachment.rawUrl)}</span>
                    </div>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={() => window.open(displayUrl, '_blank')} className="gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Open attachment
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {request.status === 'completed' && resolvedUrl && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Result</h3>
            <div className="relative group">
               {resultMediaKind === 'video' ? (
                <video
                  src={resolvedUrl}
                  controls
                  onPlay={handleVideoPlay}
                  className="w-full max-h-80 rounded-lg border border-border"
                />
              ) : (
                <img
                  src={resolvedUrl}
                  alt="Result"
                  className="w-full max-h-80 rounded-lg border border-border object-contain"
                />
              )}

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
            key={request.id}
            requestId={request.id}
            prompt={parsed.prompt}
            resultUrl={resolvedUrl || undefined}
            requestType={request.request_type}
            onSubmitted={onFeedbackSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default RequestDetailView;
