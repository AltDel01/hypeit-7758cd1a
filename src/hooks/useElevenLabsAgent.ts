
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
      
      if (message.type === 'final_transcript') {
        const messageText = message.text.toLowerCase();
        
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

  return {
    conversation,
    startConversation,
    endConversation,
    isSpeaking: conversation.isSpeaking,
    status: conversation.status,
    lastMessage,
    pendingPrompt,
    clearPendingPrompt
  };
};
