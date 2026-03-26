import React, { useEffect, useState } from 'react';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { Paperclip } from 'lucide-react';

interface ResolvedAttachmentProps {
  url: string;
  className?: string;
  size?: 'sm' | 'md';
}

const isVideoUrl = (url: string) =>
  /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url) || url.includes('/video');

export const ResolvedAttachment: React.FC<ResolvedAttachmentProps> = ({
  url,
  className = '',
  size = 'sm',
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    resolveResultUrl(url).then((resolved) => {
      if (active) {
        setResolvedUrl(resolved);
        setError(!resolved);
      }
    });
    return () => { active = false; };
  }, [url]);

  if (!resolvedUrl) {
    if (error) {
      return (
        <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
          <Paperclip className="w-3 h-3" />
          <span className="text-[10px]">Expired</span>
        </div>
      );
    }
    return <div className={`animate-pulse bg-muted rounded ${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} ${className}`} />;
  }

  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  if (isVideoUrl(url) || isVideoUrl(resolvedUrl)) {
    return (
      <video
        src={resolvedUrl}
        className={`${sizeClasses} rounded object-cover border border-border ${className}`}
        muted
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt="Attachment"
      className={`${sizeClasses} rounded object-cover border border-border ${className}`}
      loading="lazy"
    />
  );
};
