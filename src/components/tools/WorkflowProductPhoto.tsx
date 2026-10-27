import { useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Props = {
  userId?: string;
  preview: string | null;
  uploading: boolean;
  setUploading: (value: boolean) => void;
  onChange: (ref: string | null, preview: string | null) => Promise<void>;
};

export default function WorkflowProductPhoto({ userId, preview, uploading, setUploading, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!userId) { toast.error('Please sign in to upload your product photo.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPG, PNG or WebP product photo.'); return;
    }
    if (file.size > 50 * 1024 * 1024 || file.size === 0) {
      toast.error('Choose a photo smaller than 50MB.'); return;
    }
    setUploading(true);
    try {
      const image = await createImageBitmap(file);
      const scale = Math.min(1536 / Math.max(image.width, image.height), Math.max(1, 384 / Math.min(image.width, image.height)));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) { image.close(); throw new Error('Photo could not be read'); }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Photo could not be read')), 'image/png'));
      const path = `${userId}/creative-products/${crypto.randomUUID()}.png`;
      const { error } = await supabase.storage.from('product-images').upload(path, blob, { contentType: 'image/png' });
      if (error) throw error;
      const { data, error: signError } = await supabase.storage.from('product-images').createSignedUrl(path, 3600);
      if (signError || !data?.signedUrl) throw new Error('Photo could not be opened');
      await onChange(`storage:product-images/${path}`, data.signedUrl);
    } catch {
      toast.error('Your product photo could not be saved. Please try again.');
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground" htmlFor="workflow-product-photo">Product Photo</label>
      <input ref={input} id="workflow-product-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} />
      <div className="flex min-h-20 items-center gap-3 rounded-md border border-border p-2">
        {preview && <img src={preview} alt="Product reference" className="h-16 w-16 shrink-0 rounded object-contain" />}
        <Button type="button" variant="outline" size="sm" disabled={uploading} className="min-w-0 gap-2" onClick={() => input.current?.click()}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? 'Uploading...' : preview ? 'Replace photo' : 'Upload photo'}
        </Button>
        {preview && <Button type="button" variant="ghost" size="icon" disabled={uploading} title="Remove product photo" aria-label="Remove product photo" onClick={() => void onChange(null, null).catch(() => toast.error('Your photo could not be removed. Please try again.'))}><X className="h-4 w-4" /></Button>}
      </div>
    </div>
  );
}