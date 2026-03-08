import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText, Film, Image, Music, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
  className?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-8 w-8 text-primary" />;
  if (type.startsWith('video/')) return <Film className="h-8 w-8 text-primary" />;
  if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-primary" />;
  if (type.includes('pdf') || type.includes('document') || type.includes('text'))
    return <FileText className="h-8 w-8 text-primary" />;
  return <File className="h-8 w-8 text-primary" />;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUploader = ({ file, setFile, className }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isImage = file?.type.startsWith('image/');
  const isVideo = file?.type.startsWith('video/');

  return (
    <div
      className={cn(
        'flex items-center justify-center border-2 border-dashed border-border rounded-md transition-colors hover:border-primary/50',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {!file ? (
        <div className="text-center py-8">
          <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Drop your file here or</p>
          <Button
            variant="newPurple"
            className="mt-2 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Images, videos, documents, and more
          </p>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 gap-2">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="max-h-[200px] max-w-full object-contain rounded"
            />
          ) : isVideo ? (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="max-h-[200px] max-w-full rounded"
            />
          ) : (
            getFileIcon(file.type)
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground truncate max-w-[240px]">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-6 w-6"
            onClick={() => setFile(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
