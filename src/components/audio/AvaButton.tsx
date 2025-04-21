
import React, { useState, useRef, useEffect } from 'react';
import { Power, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MicrophoneVisualizer from './MicrophoneVisualizer';
import { useAuth } from '@/contexts/AuthContext';
import { usePrompt } from '@/contexts/PromptContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useElevenLabsAgent } from '@/hooks/useElevenLabsAgent';

const AvaButton: React.FC = () => {
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setGlobalPrompt } = usePrompt();
  const { 
    startConversation, 
    endConversation, 
    isSpeaking, 
    status, 
    conversation, 
    lastMessage, 
    pendingPrompt,
    clearPendingPrompt 
  } = useElevenLabsAgent();

  useEffect(() => {
    if (pendingPrompt) {
      setGlobalPrompt(pendingPrompt);
      toast.success("Image generation prompt detected and set!");
      clearPendingPrompt();
    }
  }, [pendingPrompt, setGlobalPrompt, clearPendingPrompt]);

  useEffect(() => {
    return () => {
      if (isVisualizerActive) {
        endConversation();
      }
    };
  }, [isVisualizerActive, endConversation]);

  useEffect(() => {
    if (lastMessage && typeof lastMessage === 'object' && 'message' in lastMessage) {
      const messageText = lastMessage.message.toLowerCase();
      
      if (messageText.includes('generate') || 
          messageText.includes('create an image') ||
          messageText.includes('make an image')) {
        
        const prompt = lastMessage.message.replace(/^(generate|create an image|make an image)(\s+of|\s+with|\s+showing)?/i, '').trim();
        
        if (prompt) {
          setGlobalPrompt(prompt);
          toast.success("Prompt has been set! You can now upload an image if needed.");
        }
      }
    }
  }, [lastMessage, setGlobalPrompt]);

  const handleButtonClick = async () => {
    if (!user) {
      toast.error('Please sign in to talk with Ava');
      navigate('/login');
      return;
    }
    
    if (!isVisualizerActive) {
      await startConversation();
    } else {
      await endConversation();
    }
    toggleVisualizer();
  };

  const toggleVisualizer = () => {
    setIsVisualizerActive(prev => !prev);
    console.log("Toggled visualizer to:", !isVisualizerActive);
  };

  return (
    <div ref={buttonRef} className="fixed bottom-10 right-1/2 translate-x-1/2 z-50">
      {!isVisualizerActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/40 via-[#8c52ff]/30 to-[#1EAEDB]/20 animate-outer-pulse"></div>
          <div className="absolute inset-0 rounded-full animate-wave-circle"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FEF7CD]/20 via-[#8c52ff]/10 to-[#1EAEDB]/5 animate-pulse-ring" style={{animationDelay: "0.3s"}}></div>
        </>
      )}
      
      {!isVisualizerActive && (
        <Button
          onClick={handleButtonClick}
          className="rounded-full w-28 h-28 p-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] hover:from-[#FFF9D8] hover:via-[#9b87f5] hover:to-[#33C3F0] animate-glow-pulse shadow-lg relative z-10"
          size="icon"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB]/50 flex flex-col items-center justify-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] flex flex-col items-center justify-center gap-1">
              {status === "connected" ? (
                <MicOff className="h-8 w-8 text-white animate-pulse" />
              ) : (
                <Power className="h-8 w-8 text-white" />
              )}
              <span className="text-white text-sm font-medium">
                {status === "connected" ? "Stop Ava" : "Activate Ava"}
              </span>
            </div>
          </div>
        </Button>
      )}

      <MicrophoneVisualizer 
        isActive={isVisualizerActive} 
        onClose={() => {
          console.log("Closing visualizer");
          endConversation();
          setIsVisualizerActive(false);
        }}
        containerRef={buttonRef}
      />
    </div>
  );
};

export default AvaButton;
