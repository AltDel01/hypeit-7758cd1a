
import { useState, useCallback } from "react";
import { useConversation as useElevenLabsConversation } from "@11labs/react";
import { toast } from "sonner";

export const useElevenLabsAgent = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const conversation = useElevenLabsConversation({
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      toast.error("Error connecting to Ava");
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    }
  });

  const startConversation = useCallback(async () => {
    try {
      if (!isInitialized) {
        await conversation.startSession({
          agentId: "hELBJiIy7Zdh6wJPxqFW"
        });
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to connect to Ava");
    }
  }, [conversation, isInitialized]);

  const endConversation = useCallback(async () => {
    try {
      if (isInitialized) {
        await conversation.endSession();
        setIsInitialized(false);
      }
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  }, [conversation, isInitialized]);

  return {
    conversation,
    startConversation,
    endConversation,
    isSpeaking: conversation?.isSpeaking || false,
    status: conversation?.status || "disconnected"
  };
};
