
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";

interface QwenKeyInputProps {
  onApiKeyChange: (key: string) => void;
}

const QwenKeyInput: React.FC<QwenKeyInputProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('qwen_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    localStorage.setItem('qwen_api_key', apiKey);
    onApiKeyChange(apiKey);
    setIsVisible(false);
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
          {apiKey ? 'Change Qwen API Key' : 'Add Qwen API Key'}
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
            <Button onClick={handleSaveKey} disabled={!apiKey}>Save</Button>
            <Button variant="ghost" onClick={() => setIsVisible(false)}>Cancel</Button>
          </div>
          <p className="text-xs text-gray-400">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
      )}
    </div>
  );
};

export default QwenKeyInput;
