
import React from 'react';
import PromptInput from '../PromptInput';
import SliderControl from '../SliderControl';

interface PromptSectionProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  numInferenceSteps: number;
  setNumInferenceSteps: (steps: number) => void;
  guidanceScale: number;
  setGuidanceScale: (scale: number) => void;
}

const PromptSection: React.FC<PromptSectionProps> = ({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  numInferenceSteps,
  setNumInferenceSteps,
  guidanceScale,
  setGuidanceScale
}) => {
  return (
    <div className="space-y-4">
      <PromptInput
        id="prompt"
        label="Prompt"
        placeholder="Describe what you want to add to the masked area..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      
      <PromptInput
        id="negative-prompt"
        label="Negative Prompt (Optional)"
        placeholder="What you don't want to see..."
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
        rows={2}
      />
      
      <SliderControl
        id="inference-steps"
        label="Inference Steps"
        min={10}
        max={50}
        step={1}
        value={numInferenceSteps}
        onChange={(value) => setNumInferenceSteps(value[0])}
      />
      
      <SliderControl
        id="guidance-scale"
        label="Guidance Scale"
        min={1}
        max={15}
        step={0.1}
        value={guidanceScale}
        onChange={(value) => setGuidanceScale(value[0])}
        displayValue={guidanceScale.toFixed(1)}
      />
    </div>
  );
};

export default PromptSection;
