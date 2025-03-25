
import React, { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// This component no longer renders a UI but can be used in the future for
// admin functionality if needed
const QwenKeyInput: React.FC = () => {
  useEffect(() => {
    // Run a check when the component mounts to verify if the API key is set
    const checkApiKeyStatus = async () => {
      try {
        const { error } = await supabase.functions.invoke('test-qwen-key', {
          body: { action: 'check' }
        });
        
        if (error) {
          console.error("API key might not be configured:", error);
        }
      } catch (err) {
        console.error("Error checking API key status:", err);
      }
    };
    
    checkApiKeyStatus();
  }, []);

  return null; // No visible UI
};

export default QwenKeyInput;
