
import React, { useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface PromptFormProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

const PromptForm = ({ prompt, setPrompt, onSubmit }: PromptFormProps) => {
  const { isAuthorized, redirectToSignup } = useAuthRedirect(false);

  // Save prompt to localStorage when it changes
  useEffect(() => {
    if (prompt.trim()) {
      localStorage.setItem('savedPrompt', prompt);
    }
  }, [prompt]);

  // Restore prompt from localStorage on component mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem('savedPrompt');
    if (savedPrompt && !prompt) {
      setPrompt(savedPrompt);
    }
  }, []);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }
    
    // Store prompt before redirecting
    localStorage.setItem('savedPrompt', prompt);
    
    // Check if user is authenticated before submission
    if (!isAuthorized) {
      redirectToSignup();
      return;
    }
    
    onSubmit();
  };

  return (
    <form onSubmit={handlePromptSubmit} className="mb-4">
      <div className="flex flex-col space-y-3">
        <Textarea 
          placeholder="Describe what kind of image, color codes, and style you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[200px] bg-gray-800 border-gray-700 text-white"
        />
        <div className="flex justify-end">
          <Button type="submit" className="bg-[#8c52ff] hover:bg-[#7a45e6] h-6 px-2 py-0.5 text-xs">
            <Send className="mr-1 h-3 w-3" />
            Send
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PromptForm;
