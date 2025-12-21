import React, { useState } from 'react';
import ViralClipsList from './video-editor/ViralClipsList';
import AssetsGrid from './video-editor/AssetsGrid';
import VideoCanvas from './video-editor/VideoCanvas';
import BlockTimeline from './video-editor/BlockTimeline';
import TuningDeck from './video-editor/TuningDeck';

const AIVideoEditor: React.FC = () => {
  const [isTextEditMode, setIsTextEditMode] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div className="h-[calc(100vh-80px)] flex gap-4 p-2">
      {/* LEFT SIDEBAR - Viral Clips & Assets */}
      <div className="w-[280px] shrink-0 flex flex-col gap-4 overflow-hidden">
        <ViralClipsList 
          selectedClipId={selectedClipId}
          onSelectClip={setSelectedClipId}
        />
        <AssetsGrid />
      </div>

      {/* CENTER STAGE - Canvas & Timeline */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <VideoCanvas 
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          currentTime={currentTime}
        />
        <BlockTimeline 
          isTextEditMode={isTextEditMode}
          onToggleTextEdit={() => setIsTextEditMode(!isTextEditMode)}
          currentTime={currentTime}
          onSeek={setCurrentTime}
        />
      </div>

      {/* RIGHT SIDEBAR - Tuning Deck */}
      <div className="w-[300px] shrink-0">
        <TuningDeck />
      </div>
    </div>
  );
};

export default AIVideoEditor;
