
import { useConversation } from "@11labs/react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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
      toast.error("Error connecting to Ava");
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
  const startConversation = async () => {
    console.log("Starting conversation attempt:", connectionAttempts + 1);
    
    try {
      setConnectionAttempts(prev => prev + 1);
      
      // Make sure conversation is properly configured
      const result = await conversation.startSession({
        agentId: "default" // Using the default agent ID
      });
      
      console.log("Conversation started successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      
      // Provide more specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes("WebSocket")) {
          toast.error("Network issue connecting to Ava. Check your internet connection.");
        } else if (error.message.includes("permission")) {
          toast.error("Microphone permission needed to talk with Ava.");
        } else {
          toast.error("Failed to connect with Ava. Please try again.");
        }
      } else {
        toast.error("Failed to connect with Ava. Please try again.");
      }
      
      throw error;
    }
  };

  const endConversation = async () => {
    console.log("Ending conversation");
    try {
      return await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
      return null;
    }
  };

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
    connectionAttempts
  };
};
