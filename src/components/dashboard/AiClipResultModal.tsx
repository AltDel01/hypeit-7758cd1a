import React, { useState } from 'react';
import { X, Scissors, Sparkles, Download, ExternalLink, Play, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AiClipResultModalProps {
  open: boolean;
  onClose: () => void;
}

const dummyClips = [
  {
    id: '1PmzQse11xv4HV1O4iEUh02OMvoOJ7IPh',
    title: '9-to-9 Startup Life vs. 9-to-5 Jobs',
    subtitle: 'The REAL Difference',
    duration: '1:24',
    views: '24.3K',
    score: 98,
    tags: ['viral', 'trending'],
  },
  {
    id: '1B4mBNaUUtC1-LaAU4ERGXKF3SW2hUQle',
    title: 'Startup Frustration',
    subtitle: 'Turn Anger into Lasting Impulse',
    duration: '0:58',
    views: '18.1K',
    score: 94,
    tags: ['emotional', 'motivational'],
  },
  {
    id: '12Tz8beJ6mM3ubO3DasR2RLqKX7m4qFLG',
    title: 'Startup Grind',
    subtitle: 'Mastering Essential Skills Quickly',
    duration: '1:12',
    views: '31.7K',
    score: 96,
    tags: ['educational', 'trending'],
  },
  {
    id: '1nCKqOnNr9jqYf1FdQFiljSquHF-es-zP',
    title: 'Startup Longevity',
    subtitle: 'Can You Stay Fun Through Hard Times?',
    duration: '1:05',
    views: '15.8K',
    score: 91,
    tags: ['mindset', 'resilience'],
  },
];

const AiClipResultModal: React.FC<AiClipResultModalProps> = ({ open, onClose }) => {
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  if (!open) return null;

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getEmbedUrl = (id: string) =>
    `https://drive.google.com/file/d/${id}/preview`;

  const getViewUrl = (id: string) =>
    `https://drive.google.com/file/d/${id}/view?usp=sharing`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gray-950 border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a259ff]/20 border border-[#a259ff]/40">
              <Scissors className="w-4 h-4 text-[#d966ff]" />
              <Sparkles className="w-3 h-3 text-[#a259ff]" />
              <span className="text-sm font-bold bg-gradient-to-r from-[#a259ff] to-[#d966ff] bg-clip-text text-transparent">
                AI Clip
              </span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">Generated Clips</h2>
              <p className="text-gray-400 text-xs">4 viral clips extracted from your video</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dummyClips.map((clip) => (
              <div
                key={clip.id}
                className={cn(
                  "group relative rounded-xl overflow-hidden border transition-all duration-200",
                  selected.includes(clip.id)
                    ? "border-[#a259ff] shadow-lg shadow-[#a259ff]/20"
                    : "border-gray-700/50 hover:border-gray-600"
                )}
              >
                {/* Video / Thumbnail area */}
                <div className="relative bg-black aspect-video">
                  {activeClip === clip.id ? (
                    <iframe
                      src={getEmbedUrl(clip.id)}
                      className="w-full h-full"
                      allow="autoplay"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      {/* Placeholder thumbnail */}
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full bg-gradient-to-br from-[#a259ff]/10 via-transparent to-[#d966ff]/10" />
                        </div>
                        <button
                          onClick={() => setActiveClip(clip.id)}
                          className="relative z-10 flex flex-col items-center gap-2 group/play"
                        >
                          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center group-hover/play:bg-white/20 group-hover/play:scale-110 transition-all duration-200">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          </div>
                          <span className="text-xs text-gray-300 opacity-0 group-hover/play:opacity-100 transition-opacity">
                            Click to play
                          </span>
                        </button>
                      </div>

                      {/* Duration badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white font-mono">
                        {clip.duration}
                      </div>

                      {/* Viral score badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#a259ff]/80 rounded-full text-xs text-white font-semibold">
                        <Sparkles className="w-3 h-3" />
                        {clip.score}% viral
                      </div>
                    </>
                  )}
                </div>

                {/* Info row */}
                <div className="px-3 py-3 bg-gray-900 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{clip.title}</p>
                    <p className="text-gray-400 text-xs truncate">{clip.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {clip.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[10px] border border-gray-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="text-gray-500 text-[10px]">{clip.views} views avg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => window.open(getViewUrl(clip.id), '_blank')}
                      className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                      title="Open in Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleSelect(clip.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        selected.includes(clip.id)
                          ? "bg-[#a259ff]/20 text-[#d966ff]"
                          : "hover:bg-gray-800 text-gray-400 hover:text-white"
                      )}
                      title="Select clip"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800 bg-gray-950 flex-shrink-0">
          <p className="text-gray-400 text-sm">
            {selected.length > 0
              ? `${selected.length} clip${selected.length > 1 ? 's' : ''} selected`
              : 'Select clips to export'}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:text-white">
              Close
            </Button>
            <Button
              disabled={selected.length === 0}
              className="gap-2 bg-gradient-to-r from-[#a259ff] to-[#d966ff] text-white hover:opacity-90 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              Export {selected.length > 0 ? `(${selected.length})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiClipResultModal;
