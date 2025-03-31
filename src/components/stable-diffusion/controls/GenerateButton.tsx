
import React from 'react';
import { Button } from "@/components/ui/button";
import { Wand2 } from 'lucide-react';

interface GenerateButtonProps {
  isGenerating: boolean;
  disabled: boolean;
  onClick: () => void;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  disabled,
  onClick
}) => {
  return (
    <Button
      className="w-full"
      disabled={isGenerating || disabled}
      onClick={onClick}
    >
      {isGenerating ? "Generating..." : "Generate"}
      <Wand2 className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default GenerateButton;
