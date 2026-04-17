import React, { useEffect, useState } from 'react';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { Music2, Paperclip } from 'lucide-react';
import { getMediaKind } from '@/utils/requestMedia';

interface ResolvedAttachmentProps {
  url: string;
  className?: string;
  size?: 'sm' | 'md';
}

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
  const mediaKind = getMediaKind(url);

  if (mediaKind === 'video') {
    return (
      <video
        src={resolvedUrl}
        className={`${sizeClasses} rounded object-cover border border-border ${className}`}
        muted
        preload="metadata"
      />
    );
  }

  if (mediaKind === 'audio') {
    return (
      <div className={`${sizeClasses} rounded border border-border bg-muted/50 text-muted-foreground flex items-center justify-center ${className}`}>
        <Music2 className="w-4 h-4" />
      </div>
    );
  }

  if (mediaKind === 'file') {
    return (
      <div className={`${sizeClasses} rounded border border-border bg-muted/50 text-muted-foreground flex items-center justify-center ${className}`}>
        <Paperclip className="w-4 h-4" />
      </div>
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
