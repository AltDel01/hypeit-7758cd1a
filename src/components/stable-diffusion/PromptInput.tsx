
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  id, 
  label, 
  placeholder, 
  value, 
  onChange,
  rows = 3
}) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="resize-none"
        rows={rows}
      />
    </div>
  );
};

export default PromptInput;
