
import React from 'react';
import { ToneOfVoice } from '@/hooks/useViralityStrategyForm';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface Step2ToneOfVoiceProps {
  toneOfVoice: ToneOfVoice;
  updateToneOfVoice: (tone: Partial<ToneOfVoice>) => void;
}

const Step2ToneOfVoice: React.FC<Step2ToneOfVoiceProps> = ({
  toneOfVoice,
  updateToneOfVoice
}) => {
  const handleSliderChange = (name: keyof ToneOfVoice, value: number[]) => {
    updateToneOfVoice({ [name]: value[0] });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Tone of Voice</h2>
      <p className="text-gray-400 mb-6">
        Drag each slider to position your brand's tone on the spectrum.
      </p>
      
      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-2">
            <Label>Casual</Label>
            <Label>Formal</Label>
          </div>
          <Slider 
            value={[toneOfVoice.casualFormal]} 
            min={0} 
            max={100} 
            step={1} 
            onValueChange={(value) => handleSliderChange('casualFormal', value)} 
            className="my-6"
          />
          <div className="flex justify-between items-center">
            <div className={`text-sm ${toneOfVoice.casualFormal < 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Friendly, conversational, relaxed
            </div>
            <div className={`text-sm ${toneOfVoice.casualFormal > 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Professional, structured, polished
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Playful</Label>
            <Label>Serious</Label>
          </div>
          <Slider 
            value={[toneOfVoice.playfulSerious]} 
            min={0} 
            max={100} 
            step={1} 
            onValueChange={(value) => handleSliderChange('playfulSerious', value)} 
            className="my-6"
          />
          <div className="flex justify-between items-center">
            <div className={`text-sm ${toneOfVoice.playfulSerious < 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Fun, witty, humorous
            </div>
            <div className={`text-sm ${toneOfVoice.playfulSerious > 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Straightforward, factual, business-like
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Energetic</Label>
            <Label>Relaxed</Label>
          </div>
          <Slider 
            value={[toneOfVoice.energeticRelaxed]} 
            min={0} 
            max={100} 
            step={1} 
            onValueChange={(value) => handleSliderChange('energeticRelaxed', value)} 
            className="my-6"
          />
          <div className="flex justify-between items-center">
            <div className={`text-sm ${toneOfVoice.energeticRelaxed < 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Dynamic, enthusiastic, bold
            </div>
            <div className={`text-sm ${toneOfVoice.energeticRelaxed > 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Calm, soothing, gentle
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Modern</Label>
            <Label>Traditional</Label>
          </div>
          <Slider 
            value={[toneOfVoice.modernTraditional]} 
            min={0} 
            max={100} 
            step={1} 
            onValueChange={(value) => handleSliderChange('modernTraditional', value)} 
            className="my-6"
          />
          <div className="flex justify-between items-center">
            <div className={`text-sm ${toneOfVoice.modernTraditional < 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Innovative, cutting-edge, trendy
            </div>
            <div className={`text-sm ${toneOfVoice.modernTraditional > 50 ? 'text-blue-400' : 'text-gray-500'}`}>
              Classic, time-honored, established
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2ToneOfVoice;
