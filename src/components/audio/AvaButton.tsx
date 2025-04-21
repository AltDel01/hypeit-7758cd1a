
import React, { useState, useRef, useEffect } from 'react';
import { Power, MicOff, Mic, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MicrophoneVisualizer from './MicrophoneVisualizer';
import { useAuth } from '@/contexts/AuthContext';
import { usePrompt } from '@/contexts/PromptContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useElevenLabsAgent } from '@/hooks/useElevenLabsAgent';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AvaButton: React.FC = () => {
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
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
    clearPendingPrompt,
    connectionAttempts,
    connectionError,
    isInitializing
  } = useElevenLabsAgent();

  // Check for microphone permission
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermissionError(false))
      .catch(() => setHasPermissionError(true));
  }, []);

  // Show retry button if connection attempts exceed threshold
  useEffect(() => {
    if (connectionAttempts >= 2) {
      setShowRetryButton(true);
    }
  }, [connectionAttempts]);

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

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermissionError(false);
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      setHasPermissionError(true);
      toast.error("Please grant microphone access to talk with Ava");
      return false;
    }
  };

  const handleButtonClick = async () => {
    if (!user) {
      toast.error('Please sign in to talk with Ava');
      navigate('/login');
      return;
    }
    
    if (!isVisualizerActive) {
      setIsConnecting(true);
      
      try {
        // Request microphone permission early
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          setIsConnecting(false);
          return;
        }
        
        await startConversation();
        setIsVisualizerActive(true);
        toast.success("Connected to Ava successfully!");
        setShowRetryButton(false);
      } catch (error) {
        console.error("Failed to start conversation:", error);
        setIsVisualizerActive(false);
        // Error toast is already shown in the hook
      } finally {
        setIsConnecting(false);
      }
    } else {
      try {
        await endConversation();
      } finally {
        setIsVisualizerActive(false);
      }
    }
  };

  const handleRetry = async () => {
    setShowRetryButton(false);
    await handleButtonClick();
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
        <div className="flex flex-col items-center">
          <Button
            onClick={handleButtonClick}
            disabled={isConnecting || isInitializing}
            className={`rounded-full w-28 h-28 p-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] hover:from-[#FFF9D8] hover:via-[#9b87f5] hover:to-[#33C3F0] ${(isConnecting || isInitializing) ? 'opacity-80' : 'animate-glow-pulse'} shadow-lg relative z-10`}
            size="icon"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB]/50 flex flex-col items-center justify-center animate-pulse">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FEF7CD] via-[#8c52ff] to-[#1EAEDB] flex flex-col items-center justify-center gap-1">
                {(isConnecting || isInitializing) ? (
                  <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : hasPermissionError ? (
                  <MicOff className="h-8 w-8 text-white" />
                ) : status === "connected" ? (
                  <MicOff className="h-8 w-8 text-white animate-pulse" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
                <span className="text-white text-sm font-medium">
                  {(isConnecting || isInitializing) ? "Connecting..." : hasPermissionError ? "Grant Access" : status === "connected" ? "Stop Ava" : "Activate Ava"}
                </span>
              </div>
            </div>
          </Button>
          
          {showRetryButton && !isConnecting && !isVisualizerActive && (
            <Button 
              onClick={handleRetry} 
              className="mt-4 bg-white text-[#8c52ff] hover:bg-white/90 flex items-center gap-2 shadow-md"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
          )}
          
          {connectionError && !isConnecting && !isVisualizerActive && (
            <div className="mt-4 px-4 py-2 bg-white/90 rounded-md shadow-md text-red-500 text-sm max-w-xs text-center">
              Failed to connect to Ava. Please try again.
            </div>
          )}
        </div>
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
