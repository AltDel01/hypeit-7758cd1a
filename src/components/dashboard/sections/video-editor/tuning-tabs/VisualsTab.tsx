import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const VisualsTab: React.FC = () => {
  const [zoomIntensity, setZoomIntensity] = useState([50]);
  const [faceTracking, setFaceTracking] = useState(true);
  const [bRollFrequency, setBRollFrequency] = useState([25]);
  const [aiUpscale, setAiUpscale] = useState(false);
  const [aiSmooth, setAiSmooth] = useState(false);

  return (
    <div className="space-y-6">
      {/* Zoom Intensity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs text-slate-400">Auto-Zoom Aggression</Label>
          <span className="text-xs text-[#b616d6] font-medium">
            {zoomIntensity[0] < 33 ? 'Low' : zoomIntensity[0] < 66 ? 'Medium' : 'High'}
          </span>
        </div>
        <Slider
          value={zoomIntensity}
          onValueChange={setZoomIntensity}
          max={100}
          step={1}
          className="cursor-pointer"
        />
      </div>

      {/* Face Tracking */}
      <div className="flex items-center justify-between py-3 border-t border-slate-700/30">
        <div>
          <Label className="text-sm text-slate-200">Keep Face Centered</Label>
          <p className="text-[10px] text-slate-500 mt-0.5">AI tracks speaker's face</p>
        </div>
        <Switch
          checked={faceTracking}
          onCheckedChange={setFaceTracking}
          className="data-[state=checked]:bg-[#b616d6]"
        />
      </div>

      {/* B-Roll Frequency */}
      <div className="py-3 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs text-slate-400">AI Stock Footage</Label>
          <span className="text-xs text-[#b616d6] font-medium">
            {bRollFrequency[0] === 0 ? 'None' : bRollFrequency[0] < 50 ? 'Occasional' : 'Frequent'}
          </span>
        </div>
        <Slider
          value={bRollFrequency}
          onValueChange={setBRollFrequency}
          max={100}
          step={1}
          className="cursor-pointer"
        />
      </div>

      {/* Enhancements */}
      <div className="space-y-3 pt-3 border-t border-slate-700/30">
        <Label className="text-xs text-slate-400">Enhancements</Label>
        
        {/* AI Upscale */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-slate-200">AI Upscale (4K)</Label>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#b616d6] text-[#b616d6]">
              Pro
            </Badge>
          </div>
          <Switch
            checked={aiUpscale}
            onCheckedChange={setAiUpscale}
            className="data-[state=checked]:bg-[#b616d6]"
          />
        </div>

        {/* AI Smooth */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-slate-200">AI Smooth (60fps)</Label>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#b616d6] text-[#b616d6]">
              Pro
            </Badge>
          </div>
          <Switch
            checked={aiSmooth}
            onCheckedChange={setAiSmooth}
            className="data-[state=checked]:bg-[#b616d6]"
          />
        </div>
      </div>
    </div>
  );
};

export default VisualsTab;
