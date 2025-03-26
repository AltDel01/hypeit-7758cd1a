
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

// This component helps users verify their OpenAI API key
const QwenKeyInput: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);

  useEffect(() => {
    // Check if the API key is already configured
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-qwen-key', {
        body: { action: 'check' }
      });
      
      if (error) {
        console.error("Error checking API key status:", error);
        toast.error("Could not verify API key status.");
        setIsKeyConfigured(false);
      } else {
        setIsKeyConfigured(data.success);
      }
    } catch (err) {
      console.error("Error checking API key status:", err);
      setIsKeyConfigured(false);
    } finally {
      setIsChecking(false);
    }
  };

  const testAndSetApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsTestingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-qwen-key', {
        body: { key: apiKey, action: 'test' }
      });
      
      if (error || !data.success) {
        console.error("Error testing API key:", error || data.error);
        toast.error(data?.error || "Invalid API key");
      } else {
        toast.success("Valid OpenAI API key! Contact the site administrator to configure it in Supabase.");
        setShowKeyForm(false);
      }
    } catch (err) {
      console.error("Error testing API key:", err);
      toast.error("Could not test API key");
    } finally {
      setIsTestingKey(false);
    }
  };

  if (isChecking) {
    return null; // Don't render anything while checking
  }

  if (isKeyConfigured) {
    return null; // Don't render if key is already configured
  }

  if (showKeyForm) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm max-w-md mx-auto my-4">
        <h2 className="text-lg font-semibold mb-2">Test Your OpenAI API Key</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is for testing purposes only. To properly configure the API key, 
          the site administrator must set it in the Supabase Environment Variables.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key should start with 'sk-'
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowKeyForm(false)}
              disabled={isTestingKey}
            >
              Cancel
            </Button>
            <Button 
              onClick={testAndSetApiKey}
              disabled={!apiKey.trim() || isTestingKey}
            >
              {isTestingKey ? "Testing..." : "Test Key"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert variant="destructive" className="max-w-md mx-auto my-4">
      <Info className="h-4 w-4" />
      <AlertTitle>OpenAI API Key Not Configured</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          The social post generation feature requires an OpenAI API key to be configured.
          Please contact the site administrator to set up the API key in Supabase.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowKeyForm(true)}
        >
          Test Your API Key
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default QwenKeyInput;
