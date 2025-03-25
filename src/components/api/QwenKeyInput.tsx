
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const QwenKeyInput: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Qwen API key");
      return;
    }

    setIsLoading(true);
    
    try {
      // For development only - normally you'd set this in Supabase directly
      // This is a simplified way to test the functionality
      const { error } = await supabase.functions.invoke('test-qwen-key', {
        body: { key: apiKey }
      });
      
      if (error) {
        toast.error("Failed to verify API key");
        return;
      }
      
      toast.success("API key verified and ready to use");
      setIsVisible(false);
    } catch (error) {
      console.error("Error verifying API key:", error);
      toast.error("Failed to verify API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      {!isVisible ? (
        <Button 
          variant="outline" 
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 text-sm"
        >
          <Key size={16} /> 
          Configure Qwen API Key
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="password"
              placeholder="Enter your Qwen API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveKey} disabled={!apiKey || isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button variant="ghost" onClick={() => setIsVisible(false)}>Cancel</Button>
          </div>
          <p className="text-xs text-gray-400">
            This will securely add your API key to Supabase. Do not share your API key with others.
          </p>
        </div>
      )}
    </div>
  );
};

export default QwenKeyInput;
