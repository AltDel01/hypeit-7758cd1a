
import { useConversation } from "@11labs/react";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";

// Enum for conversation context states
enum ConversationContext {
  GENERAL,
  IMAGE_GENERATION_INTENT
}

export const useElevenLabsAgent = () => {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext>(ConversationContext.GENERAL);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const imageGenerationKeywords = [
    'generate image', 
    'create image', 
    'make an image', 
    'design visual', 
    'produce graphic', 
    'create content'
  ];

  const imageDescriptionIntentKeywords = [
    'about', 
    'like', 
    'showing', 
    'depicting', 
    'of a', 
    'with a', 
    'that looks like'
  ];

  const conversation = useConversation({
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      const errorMessage = typeof error === 'string' ? error : 
                          (error && typeof error === 'object' && 'message' in error) ? error.message : 
                          'Unknown error occurred';
      
      setConnectionError(errorMessage);
      toast.error("Error connecting to Ava");
      setIsInitializing(false);
    },
    onMessage: (message) => {
      console.log("Received message:", message);
      
      // We need to adapt to the actual message structure from ElevenLabs
      // The message structure has changed - let's handle it properly
      if (message && typeof message === 'object' && 'message' in message) {
        const messageText = message.message.toLowerCase();
        
        // Check for image generation intent
        const hasGenerationIntent = imageGenerationKeywords.some(keyword => 
          messageText.includes(keyword)
        );

        if (hasGenerationIntent) {
          setConversationContext(ConversationContext.IMAGE_GENERATION_INTENT);
          toast.info("Image generation mode activated!");
        }

        // If in image generation context, try to extract prompt
        if (conversationContext === ConversationContext.IMAGE_GENERATION_INTENT) {
          const promptDescriptor = imageDescriptionIntentKeywords.find(keyword => 
            messageText.includes(keyword)
          );

          if (promptDescriptor) {
            const prompt = messageText.split(promptDescriptor)[1].trim();
            if (prompt) {
              setPendingPrompt(prompt);
              toast.success("Image prompt detected!");
            }
          }
        }

        setLastMessage(message);
      }
    },
    onConnect: () => {
      console.log("Connected to Ava successfully!");
      setConnectionError(null);
      setIsInitializing(false);
    }
  });

  // Reset context after a period of inactivity or after prompt is used
  useEffect(() => {
    const timer = setTimeout(() => {
      setConversationContext(ConversationContext.GENERAL);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timer);
  }, [conversationContext]);

  const clearPendingPrompt = () => {
    setPendingPrompt(null);
    setConversationContext(ConversationContext.GENERAL);
  };

  // Create properly typed wrapper functions for conversation methods
  const startConversation = useCallback(async () => {
    console.log("Starting conversation attempt:", connectionAttempts + 1);
    
    try {
      setIsInitializing(true);
      setConnectionAttempts(prev => prev + 1);
      
      // First request microphone permission explicitly
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Make sure conversation is properly configured
      const result = await conversation.startSession({
        agentId: "default" // Using the default agent ID
      });
      
      console.log("Conversation started successfully:", result);
      setConnectionError(null);
      return result;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      
      // Provide more specific error messages based on the error
      let errorMessage = 'Failed to connect with Ava';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message as string;
        
        if (errorMessage.includes("WebSocket")) {
          toast.error("Network issue connecting to Ava. Check your internet connection.");
        } else if (errorMessage.includes("permission")) {
          toast.error("Microphone permission needed to talk with Ava.");
        } else if (errorMessage.includes("MediaDevices")) {
          toast.error("Browser doesn't support microphone access. Try a different browser.");
        } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
          toast.error("The Ava service couldn't be reached. Please try again later.");
        } else {
          toast.error("Failed to connect with Ava. Please try again.");
        }
      } else {
        toast.error("Failed to connect with Ava. Please try again.");
      }
      
      setConnectionError(errorMessage);
      setIsInitializing(false);
      throw error;
    }
  }, [conversation, connectionAttempts]);

  const endConversation = useCallback(async () => {
    console.log("Ending conversation");
    try {
      setIsInitializing(false);
      return await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
      return null;
    }
  }, [conversation]);

  // Return the correct methods from conversation object
  return {
    conversation,
    startConversation,
    endConversation,
    isSpeaking: conversation.isSpeaking,
    status: conversation.status,
    lastMessage,
    pendingPrompt,
    clearPendingPrompt,
    connectionAttempts,
    connectionError,
    isInitializing
  };
};
