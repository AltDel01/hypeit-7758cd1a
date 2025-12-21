import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const fontStyles = [
  { id: 'hormozi', name: 'Hormozi', preview: 'Aa', font: 'font-bold tracking-tight' },
  { id: 'minimal', name: 'Minimal', preview: 'Aa', font: 'font-light tracking-wide' },
  { id: 'neon', name: 'Neon', preview: 'Aa', font: 'font-black italic' },
  { id: 'typewriter', name: 'Typewriter', preview: 'Aa', font: 'font-mono' },
];

const positions = ['Top', 'Center', 'Bottom'];

const activeWordColors = [
  '#b616d6', '#8c52ff', '#00d4ff', '#10b981', '#f59e0b', '#ef4444'
];

const CaptionsTab: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState('hormozi');
  const [selectedPosition, setSelectedPosition] = useState('Bottom');
  const [selectedColor, setSelectedColor] = useState('#b616d6');

  return (
    <div className="space-y-6">
      {/* Font Style Selector */}
      <div>
        <Label className="text-xs text-slate-400 mb-3 block">Caption Style</Label>
        <div className="grid grid-cols-2 gap-2">
          {fontStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 text-center",
                selectedStyle === style.id
                  ? "bg-[#b616d6]/20 border-[#b616d6] text-white"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
              )}
            >
              <span className={cn("text-lg block mb-1", style.font)}>{style.preview}</span>
              <span className="text-[10px]">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Position Toggle */}
      <div>
        <Label className="text-xs text-slate-400 mb-3 block">Position</Label>
        <div className="flex rounded-lg border border-slate-700/50 overflow-hidden">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-all duration-200",
                selectedPosition === pos
                  ? "bg-[#b616d6] text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              )}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Active Word Color */}
      <div>
        <Label className="text-xs text-slate-400 mb-3 block">Active Word Color</Label>
        <div className="flex gap-2">
          {activeWordColors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-200 border-2",
                selectedColor === color
                  ? "border-white scale-110"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
        <p className="text-xs text-slate-500 mb-2">Preview</p>
        <p className="text-white text-center">
          This is how your <span style={{ color: selectedColor }}>captions</span> look
        </p>
      </div>
    </div>
  );
};

export default CaptionsTab;
