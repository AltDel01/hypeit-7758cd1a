
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SliderControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number[]) => void;
  displayValue?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue
}) => {
  return (
    <div>
      <Label htmlFor={id}>
        {label}: {displayValue || value}
      </Label>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={onChange}
        className="mt-2"
      />
    </div>
  );
};

export default SliderControl;
