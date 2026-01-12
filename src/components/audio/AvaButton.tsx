
import React, { useState, useRef, useEffect } from 'react';
import { Power, MicOff, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MicrophoneVisualizer from './MicrophoneVisualizer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useElevenLabsAgent } from '@/hooks/useElevenLabsAgent';

const AvaButton: React.FC = () => {
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    startConversation, 
    endConversation, 
    isSpeaking, 
    status, 
    hasPermission,
    isInitialized,
    requestMicrophonePermission 
  } = useElevenLabsAgent();

  // Remove the auto-cleanup effect that was causing disconnects
  // useEffect(() => {
  //   return () => {
  //     if (isVisualizerActive) {
  //       endConversation();
  //     }
  //   };
  // }, [isVisualizerActive, endConversation]);

  const handleButtonClick = async () => {
    if (!user) {
      toast.error('Please sign in to talk with Ava');
      navigate('/login');
      return;
    }

    // If microphone permission is not granted, request it first
    if (!hasPermission) {
      toast.info('Requesting microphone permission...');
      const granted = await requestMicrophonePermission();
      if (!granted) {
        return;
      }
    }
    
    if (!isVisualizerActive) {
      console.log("Starting Ava conversation - AUTO DISCONNECT DISABLED");
      await startConversation();
      setIsVisualizerActive(true);
    } else {
      console.log("Ending Ava conversation manually...");
      await endConversation();
      setIsVisualizerActive(false);
    }
  };

  const handleVisualizerClose = () => {
    console.log("Manual close from visualizer - AUTO DISCONNECT DISABLED");
    endConversation();
    setIsVisualizerActive(false);
  };

  const getButtonIcon = () => {
    if (status === "connected" && isVisualizerActive) {
      return <MicOff className="h-8 w-8 text-white animate-pulse" />;
    } else if (status === "connecting") {
      return <Mic className="h-8 w-8 text-white animate-spin" />;
    } else {
      return <Power className="h-8 w-8 text-white" />;
    }
  };

  const getButtonText = () => {
    if (status === "connected" && isVisualizerActive) {
      return "Stop Ava";
    } else if (status === "connecting") {
      return "Connecting...";
    } else if (!hasPermission) {
      return "Enable Mic";
    } else {
      return "Activate Ava";
    }
  };

  return (
    <div ref={buttonRef} className="fixed bottom-6 right-6 z-50">
      {/* Only show button animations when not listening */}
      {!isVisualizerActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/40 via-[#8c52ff]/30 to-[#1EAEDB]/20 animate-outer-pulse"></div>
          <div className="absolute inset-0 rounded-full animate-wave-circle"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/20 via-[#8c52ff]/10 to-[#1EAEDB]/5 animate-pulse-ring" style={{animationDelay: "0.3s"}}></div>
        </>
      )}
      
      {/* Increase the button size when not listening */}
      {!isVisualizerActive && (
        <Button
          onClick={handleButtonClick}
          className="rounded-full w-28 h-28 p-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] hover:from-[#FFF9D8] hover:via-[#9b87f5] hover:to-[#33C3F0] animate-glow-pulse shadow-lg relative z-10"
          size="icon"
          disabled={status === "connecting"}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB]/50 flex flex-col items-center justify-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] flex flex-col items-center justify-center gap-1">
              {getButtonIcon()}
              <span className="text-white text-sm font-medium">
                {getButtonText()}
              </span>
            </div>
          </div>
        </Button>
      )}

      {/* Always render the visualizer component, its visibility is controlled internally */}
      <MicrophoneVisualizer 
        isActive={isVisualizerActive} 
        onClose={handleVisualizerClose}
        containerRef={buttonRef}
      />
    </div>
  );
};

export default AvaButton;
