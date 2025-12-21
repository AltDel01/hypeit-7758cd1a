
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useIsMobile } from '@/hooks/use-mobile';

interface GenerateButtonProps {
  isGenerating: boolean;
  disabled: boolean;
  onClick: () => void;
}

const GenerateButton = ({ isGenerating, disabled, onClick }: GenerateButtonProps) => {
  const { isAuthorized, redirectToSignup } = useAuthRedirect(false);
  const isMobile = useIsMobile();

  const handleClick = () => {
    if (!isAuthorized) {
      // Save current path to know where to return after auth
      localStorage.setItem('authRedirectPath', window.location.pathname);
      redirectToSignup();
      return;
    }
    
    onClick();
  };

  return (
    <div className="flex justify-center mt-5">
      <Button 
        className={cn(
          "bg-gradient-to-r from-[#8c52ff] to-[#b616d6] hover:from-[#7a45e6] hover:to-[#a014c4] text-white text-sm transition-all", 
          isMobile ? "px-4 py-2 w-full" : "px-6 h-8"
        )}
        disabled={disabled || isGenerating}
        onClick={handleClick}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            {isMobile ? "Generating..." : "Generating..."}
          </>
        ) : (
          <>
            <ArrowUp className="mr-1 h-3.5 w-3.5" />
            {isMobile ? "Generate" : "Generate"}
          </>
        )}
      </Button>
    </div>
  );

  // Fix missing import for cn
  function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }
};

export default GenerateButton;
