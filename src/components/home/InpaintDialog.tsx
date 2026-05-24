import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MaskDrawingCanvas from '@/components/stable-diffusion/MaskDrawingCanvas';
import { Loader2, Eraser } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: File | null;
  onApply: (maskFile: File, prompt: string) => void;
}

const InpaintDialog: React.FC<Props> = ({ open, onOpenChange, image, onApply }) => {
  const [maskDataUrl, setMaskDataUrl] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('remove the masked area, fill with the surrounding background');
  const [converting, setConverting] = useState(false);

  const handleApply = async () => {
    if (!maskDataUrl) return;
    setConverting(true);
    try {
      const res = await fetch(maskDataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'mask.png', { type: 'image/png' });
      onApply(file, prompt.trim() || 'remove the masked area, fill with the surrounding background');
      onOpenChange(false);
      setMaskDataUrl('');
    } finally {
      setConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eraser className="w-4 h-4 text-[#8c52ff]" /> Paint area to erase / inpaint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Paint over the regions you want removed. Alibaba DashScope (wanx2.1-imageedit) will fill them based on the prompt and surrounding background.
          </p>

          <div className="rounded-lg bg-black/40 border border-gray-700/50 p-3">
            <MaskDrawingCanvas originalImage={image} onChange={setMaskDataUrl} />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">
              Inpaint instruction
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. remove colored boxes, keep gray calendar grid"
              className="bg-gray-800/60 border-gray-700/50 text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!maskDataUrl || converting}
            className="text-white"
            style={{ backgroundImage: 'linear-gradient(to right, #8c52ff, #b616d6)' }}
          >
            {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply & Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InpaintDialog;
