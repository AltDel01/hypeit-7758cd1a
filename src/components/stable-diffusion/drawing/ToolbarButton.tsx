
import React from 'react';
import { Button } from "@/components/ui/button";
import { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
  title: string;
  variant?: 'default' | 'outline' | 'destructive';
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  active = false,
  onClick,
  title,
  variant = 'outline',
  disabled = false
}) => {
  const buttonVariant = active ? 'default' : variant;
  
  return (
    <Button
      type="button"
      variant={buttonVariant}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};

export default ToolbarButton;
