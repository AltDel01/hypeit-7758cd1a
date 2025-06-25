import { useState, useCallback } from "react";
import { useConversation as useElevenLabsConversation } from "@11labs/react";
import { toast } from "sonner";

export const useElevenLabsAgent = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  const conversation = useElevenLabsConversation({
    onConnect: () => {
      console.log("ElevenLabs conversation connected successfully");
      toast.success("Connected to Ava");
      setIsInitialized(true);
    },
    onDisconnect: (reason) => {
      console.log("ElevenLabs conversation disconnected. Reason:", reason);
      // Don't automatically set isInitialized to false unless it's a manual disconnect
      // Only show errors for actual technical problems
      console.log("Disconnect reason type:", typeof reason);
      console.log("Disconnect reason details:", JSON.stringify(reason, null, 2));
    },
    onError: (error) => {
      console.error("ElevenLabs error details:", error);
      toast.error("Error connecting to Ava - Please check your API key and internet connection");
      setIsInitialized(false);
    },
    onMessage: (message) => {
      console.log("Received message from Ava:", message);
      // Handle different message types based on the actual structure from ElevenLabs
      if (message && typeof message === 'object' && 'message' in message) {
        console.log("Ava message:", message.message);
        if (message.source === 'ai') {
          console.log("Ava responded:", message.message);
        }
      }
    },
    clientTools: {
      // Add client tools to allow Ava to perform actions
      showMessage: (parameters: { message: string }) => {
        console.log("Ava says:", parameters.message);
        toast.info(`Ava: ${parameters.message}`);
        return "Message displayed to user";
      },
      getCurrentTime: () => {
        const now = new Date();
        return `Current time is ${now.toLocaleTimeString()}`;
      },
      getCurrentDate: () => {
        const now = new Date();
        return `Today's date is ${now.toLocaleDateString()}`;
      },
      getWeather: (parameters: { location: string }) => {
        // Placeholder for weather information
        return `I don't have access to real-time weather data for ${parameters.location}, but I can help you with other things!`;
      },
      helpWithSocialMedia: (parameters: { platform?: string; task?: string }) => {
        const platform = parameters.platform || "social media";
        return `I can help you with ${platform} content creation, strategy, and optimization. What specific help do you need?`;
      }
    }
  });

  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      console.log("Microphone permission granted");
      toast.success("Microphone access granted");
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      toast.error("Microphone access is required to talk with Ava");
      setHasPermission(false);
      return false;
    }
  }, []);

  const startConversation = useCallback(async () => {
    try {
      console.log("Starting conversation with agent ID: hELBJiIy7Zdh6wJPxqFW");
      
      // Check microphone permission first
      if (!hasPermission) {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) {
          return;
        }
      }

      // Check if already connected
      if (conversation?.status === "connected") {
        console.log("Already connected to conversation");
        setIsInitialized(true);
        return;
      }

      // Always try to start the session
      console.log("Starting ElevenLabs conversation...");
      await conversation.startSession({
        agentId: "hELBJiIy7Zdh6wJPxqFW"
      });
      console.log("Conversation session started");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast.error("Failed to connect to Ava. Please check your ElevenLabs API key and try again.");
      setIsInitialized(false);
    }
  }, [conversation, hasPermission, requestMicrophonePermission]);

  const endConversation = useCallback(async () => {
    try {
      if (isInitialized || conversation?.status === "connected") {
        console.log("Ending conversation manually...");
        setIsInitialized(false);
        await conversation.endSession();
        toast.info("Conversation ended");
      }
    } catch (error) {
      console.error("Failed to end conversation:", error);
      toast.error("Error ending conversation");
    }
  }, [conversation, isInitialized]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      if (conversation?.setVolume) {
        await conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
        console.log("Volume set to:", volume);
      }
    } catch (error) {
      console.error("Failed to set volume:", error);
    }
  }, [conversation]);

  return {
    conversation,
    startConversation,
    endConversation,
    setVolume,
    requestMicrophonePermission,
    isSpeaking: conversation?.isSpeaking || false,
    status: conversation?.status || "disconnected",
    hasPermission,
    isInitialized
  };
};
