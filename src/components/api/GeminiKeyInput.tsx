
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GeminiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutoKey, setShowAutoKey] = useState(false);

  useEffect(() => {
    // When component mounts, check if default key should be visible
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoKey') === 'true') {
      setShowAutoKey(true);
    }
  }, []);

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

  const useDefaultKey = async () => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-gemini-key', {
        body: { 
          action: 'set',
          key: "AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.success) {
        toast.success("Default Gemini API key configured successfully!");
        window.location.reload(); // Refresh to apply changes
      } else {
        throw new Error(data?.message || "Failed to configure default API key");
      }
    } catch (error) {
      console.error("Error setting default API key:", error);
      toast.error(`Failed to configure default API key: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAutoKeyDialog = () => {
    setShowAutoKey(false);
  };

  return (
    <>
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
          
          <div className="pt-2 border-t border-gray-700">
            <Button 
              onClick={useDefaultKey}
              className="w-full mt-2 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Configuring..." : "Use Default Key (AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA)"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showAutoKey} onOpenChange={setShowAutoKey}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle>Use Default API Key?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Would you like to use the default Gemini API key:</p>
            <p className="font-mono bg-gray-800 p-2 rounded">AIzaSyByaR6_jgZFigOSe9lu1g2e-Pr8YCnhhZA</p>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={useDefaultKey}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Configuring..." : "Use Default Key"}
              </Button>
              <Button
                onClick={closeAutoKeyDialog}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GeminiKeyInput;
