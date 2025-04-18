
import { useState } from 'react';

export const useTabs = () => {
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [selectedImagesPerBatch, setSelectedImagesPerBatch] = useState(1);
  const [selectedWriterOption, setSelectedWriterOption] = useState('x');
  const [visualMenuOpen, setVisualMenuOpen] = useState(false);
  const [writerMenuOpen, setWriterMenuOpen] = useState(false);

  const handleAspectRatioSelect = (ratio: string, setActiveTab: (tab: string) => void) => {
    setSelectedAspectRatio(ratio);
    setActiveTab(ratio === '1:1' ? 'feed' : 'story');
  };

  const handleWriterOptionSelect = (
    option: string,
    setActiveTab: (tab: string) => void
  ) => {
    setSelectedWriterOption(option);
    setActiveTab(option);
    setWriterMenuOpen(false);
  };

  return {
    selectedAspectRatio,
    selectedImagesPerBatch,
    setSelectedImagesPerBatch,
    visualMenuOpen,
    setVisualMenuOpen,
    writerMenuOpen,
    setWriterMenuOpen,
    handleAspectRatioSelect,
    handleWriterOptionSelect
  };
};
