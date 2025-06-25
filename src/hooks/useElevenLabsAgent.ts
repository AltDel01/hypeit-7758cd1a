
import { useState, useCallback } from "react";
import { useConversation as useElevenLabsConversation } from "@11labs/react";
import { toast } from "sonner";

export const useElevenLabsAgent = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  const conversation = useElevenLabsConversation({
    onConnect: () => {
      console.log("ElevenLabs conversation connected");
      toast.success("Connected to Ava");
    },
    onDisconnect: () => {
      console.log("ElevenLabs conversation disconnected");
      setIsInitialized(false);
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      toast.error("Error connecting to Ava - Please check your internet connection");
    },
    onMessage: (message) => {
      console.log("Received message:", message);
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
    },
    overrides: {
      agent: {
        prompt: {
          prompt: `You are Ava, a helpful AI assistant for HYPEIT, a social media content creation platform. 
          
          Your role is to:
          - Help users with social media strategy and content creation
          - Answer questions about the platform features
          - Provide marketing advice and tips
          - Be conversational, friendly, and engaging
          - Always respond to user questions and engage in meaningful dialogue
          - Use the available client tools to provide interactive experiences
          
          Important guidelines:
          - Always respond to user questions with helpful, detailed answers
          - Ask follow-up questions to better understand user needs
          - Be proactive in offering suggestions and tips
          - Use a friendly, conversational tone
          - Don't just greet - engage meaningfully with every user input
          
          Platform features you can help with:
          - Image generation for social media posts
          - Content strategy development
          - Analytics and performance tracking
          - Brand identity creation
          - Virality strategies
          - Campaign optimization
          
          Available tools you can use:
          - showMessage: Display important information to users
          - getCurrentTime: Get current time
          - getCurrentDate: Get current date
          - getWeather: Get weather information (placeholder)
          - helpWithSocialMedia: Provide platform-specific guidance
          
          Be proactive in your responses and always try to provide value in every interaction.`
        },
        firstMessage: "Hi! I'm Ava, your AI assistant for HYPEIT. I'm here to help you create amazing social media content and grow your online presence. What can I help you with today? Feel free to ask me anything about social media strategy, content creation, or our platform features!",
        language: "en"
      },
      tts: {
        voiceId: "9BWtsMINqrJLrRacOk9x" // Aria voice
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
      // Check microphone permission first
      if (!hasPermission) {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) {
          return;
        }
      }

      if (!isInitialized) {
        console.log("Starting ElevenLabs conversation...");
        await conversation.startSession({
          agentId: "hELBJiIy7Zdh6wJPxqFW"
        });
        setIsInitialized(true);
        console.log("Conversation started successfully");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to connect to Ava. Please try again.");
      setIsInitialized(false);
    }
  }, [conversation, isInitialized, hasPermission, requestMicrophonePermission]);

  const endConversation = useCallback(async () => {
    try {
      if (isInitialized) {
        console.log("Ending conversation...");
        await conversation.endSession();
        setIsInitialized(false);
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
