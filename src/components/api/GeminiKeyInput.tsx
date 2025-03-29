
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GeminiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error("Please enter a valid Gemini API key");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-gemini-key', {
        body: { 
          action: 'set',
          key: apiKey 
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.success) {
        toast.success("Gemini API key configured successfully!");
        window.location.reload(); // Refresh to apply changes
      } else {
        throw new Error(data?.message || "Failed to configure API key");
      }
    } catch (error) {
      console.error("Error setting API key:", error);
      toast.error(`Failed to configure API key: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Configure Gemini API Key</h2>
      
      <div className="space-y-4">
        <p className="text-gray-300">
          To use AI image generation features, you need to provide a Google AI Studio Gemini API key.
        </p>
        
        <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-4">
          <li>Visit the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a> to get your API key</li>
          <li>Create an API key if you don't have one</li>
          <li>Copy the API key and paste it below</li>
        </ol>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || !apiKey.trim()}
          >
            {isSubmitting ? "Configuring..." : "Configure API Key"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GeminiKeyInput;
