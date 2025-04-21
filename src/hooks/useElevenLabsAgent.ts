
import { useConversation } from "@11labs/react";
import { toast } from "sonner";

export const useElevenLabsAgent = () => {
  const conversation = useConversation({
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      toast.error("Error connecting to Ava");
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    }
  });

  const startConversation = async () => {
    try {
      await conversation.startSession({
        agentId: "hELBJiIy7Zdh6wJPxqFW"
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to connect to Ava");
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  return {
    conversation,
    startConversation,
    endConversation,
    isSpeaking: conversation.isSpeaking,
    status: conversation.status
  };
};
