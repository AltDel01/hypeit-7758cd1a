import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone, Square } from 'lucide-react';

const resolutions = [
  { id: '1080p', label: '1080p', desc: 'Full HD' },
  { id: '4k', label: '4K', desc: 'Ultra HD', pro: true },
];

const aspectRatios = [
  { id: '9:16', label: '9:16', desc: 'TikTok/Reels', icon: Smartphone },
  { id: '16:9', label: '16:9', desc: 'YouTube', icon: Monitor },
  { id: '1:1', label: '1:1', desc: 'Instagram', icon: Square },
];

const formats = [
  { id: 'mp4', label: 'MP4', desc: 'Most compatible' },
  { id: 'mov', label: 'MOV', desc: 'Apple devices' },
  { id: 'webm', label: 'WebM', desc: 'Web optimized' },
];

const ExportTab: React.FC = () => {
  const [selectedResolution, setSelectedResolution] = useState('1080p');
  const [selectedAspect, setSelectedAspect] = useState('9:16');
  const [selectedFormat, setSelectedFormat] = useState('mp4');

  return (
    <div className="space-y-6">
      {/* Resolution */}
      <div>
        <Label className="text-xs text-slate-400 mb-3 block">Resolution</Label>
        <div className="flex gap-2">
          {resolutions.map((res) => (
            <button
              key={res.id}
              onClick={() => setSelectedResolution(res.id)}
              className={cn(
                "flex-1 p-3 rounded-lg border transition-all duration-200 text-center relative",
                selectedResolution === res.id
                  ? "bg-[#b616d6]/20 border-[#b616d6] text-white"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
              )}
            >
              {res.pro && (
                <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 rounded bg-[#b616d6] text-white">
                  PRO
                </span>
              )}
              <span className="text-sm font-medium block">{res.label}</span>
              <span className="text-[10px] text-slate-500">{res.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <Label className="text-xs text-slate-400 mb-3 block">Aspect Ratio</Label>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((aspect) => (
            <button
              key={aspect.id}
              onClick={() => setSelectedAspect(aspect.id)}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 text-center",
                selectedAspect === aspect.id
                  ? "bg-[#b616d6]/20 border-[#b616d6] text-white"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
              )}
            >
              <aspect.icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium block">{aspect.label}</span>
              <span className="text-[9px] text-slate-500">{aspect.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div>
        <Label className="text-xs text-slate-400 mb-3 block">Format</Label>
        <div className="space-y-2">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={cn(
                "w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-center justify-between",
                selectedFormat === format.id
                  ? "bg-[#b616d6]/20 border-[#b616d6] text-white"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
              )}
            >
              <span className="text-sm font-medium">{format.label}</span>
              <span className="text-xs text-slate-500">{format.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Size */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Estimated file size</span>
          <span className="text-sm font-medium text-white">~24 MB</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">Export time</span>
          <span className="text-sm font-medium text-white">~2 min</span>
        </div>
      </div>
    </div>
  );
};

export default ExportTab;
