import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ApiKeyPlaceholder from './ApiKeyPlaceholder';
import { AlertCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface XPostFormProps {
  onGeneratePost: (post: string) => void;
}

const XPostForm: React.FC<XPostFormProps> = ({ onGeneratePost }) => {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState('conversational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(true);
  const [showQuotaError, setShowQuotaError] = useState(false);

  useEffect(() => {
    // Check API key status on component mount
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-qwen-key', {
        body: { action: 'check' }
      });
      
      if (error || !data.success) {
        setIsApiKeyConfigured(false);
      } else {
        setIsApiKeyConfigured(true);
      }
    } catch (err) {
      console.error("Error checking API key status:", err);
      setIsApiKeyConfigured(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!idea.trim()) {
      toast.error("Please enter your idea for the post");
      return;
    }

    // Clear previous error and post
    setErrorMessage(null);
    setIsGenerating(true);
    
    const prompt = `Create a short X (Twitter) post about ${idea} with 1-2 relevant hashtags.`;
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: {
          prompt,
          tone,
          platform: 'x',
          length: 'short'
        }
      });

      if (error) {
        console.error("Error invoking function:", error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error("API returned error:", data.error);
        // Check if it's a quota exceeded error
        if (data.error.includes('quota') || data.error.includes('exceeded')) {
          setShowQuotaError(true);
          toast.error("OpenAI quota exceeded");
        } else {
          setErrorMessage(data.error);
          toast.error(`Failed to generate post: ${data.error}`);
        }
        return;
      }

      const generatedText = data.text;
      setGeneratedPost(generatedText);
      onGeneratePost(generatedText);
      toast.success("X post generated successfully!");
    } catch (error) {
      console.error('Error generating post:', error);
      setErrorMessage("Server error. Please try again later.");
      toast.error("Failed to generate post. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    toast.success("Post copied to clipboard!");
  };

  // Since we've removed the API functionality, we'll set this to false by default
  if (!isApiKeyConfigured) {
    return <ApiKeyPlaceholder service="OpenAI" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="idea" className="font-medium">Your Idea</Label>
        <Textarea 
          id="idea"
          placeholder="What's your post about? E.g., 'New product launch', 'Industry tips'..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="xTone" className="font-medium">Tone</Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger id="xTone">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conversational">Conversational</SelectItem>
            <SelectItem value="funny">Funny</SelectItem>
            <SelectItem value="serious">Serious</SelectItem>
            <SelectItem value="informative">Informative</SelectItem>
            <SelectItem value="provocative">Provocative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={!idea.trim() || isGenerating}
        onClick={handleGeneratePost}
      >
        {isGenerating ? "Generating X Post..." : "Generate X Post"}
      </Button>
      
      {generatedPost && (
        <div className="mt-6 bg-gray-800 p-4 rounded-md relative border border-gray-700">
          <p className="text-sm text-white whitespace-pre-line">{generatedPost}</p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-white"
            onClick={copyToClipboard}
          >
            <Copy size={16} />
          </Button>
        </div>
      )}
      
      {/* Quota Exceeded Dialog */}
      <Dialog open={showQuotaError} onOpenChange={setShowQuotaError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              OpenAI API Quota Exceeded
            </DialogTitle>
            <DialogDescription>
              <p className="mt-2">
                Your OpenAI API key has exceeded its usage quota. This typically happens when:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>You're using a free tier key with limited credits</li>
                <li>Your billing cycle has ended and payment is needed</li>
                <li>You've reached your defined usage limits</li>
              </ul>
              <p className="mt-4">
                To resolve this issue, please visit your OpenAI account dashboard to check your usage
                status and billing information.
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button variant="outline" asChild>
                  <a 
                    href="https://platform.openai.com/account/billing/overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    OpenAI Billing Dashboard
                  </a>
                </Button>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default XPostForm;
