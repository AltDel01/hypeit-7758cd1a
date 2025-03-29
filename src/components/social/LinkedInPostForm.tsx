
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QwenKeyInput from "@/components/api/QwenKeyInput";
import { AlertCircle, Info } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface LinkedInPostFormProps {
  onGeneratePost: (post: string) => void;
}

const LinkedInPostForm: React.FC<LinkedInPostFormProps> = ({ onGeneratePost }) => {
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(true);
  const [showQuotaError, setShowQuotaError] = useState(false);
  const [isFallbackContent, setIsFallbackContent] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

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
    setIsFallbackContent(false);
    setFallbackWarning(null);
    setIsGenerating(true);
    
    const prompt = industry 
      ? `Create a LinkedIn post about ${idea} for the ${industry} industry.` 
      : `Create a LinkedIn post about ${idea}.`;
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: {
          prompt,
          tone,
          length,
          platform: 'linkedin'
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

      // Check if this is fallback content
      if (data.isFallback) {
        setIsFallbackContent(true);
        if (data.warning) {
          setFallbackWarning(data.warning);
          toast.warning("Using fallback content generator due to API limitations");
        }
      }

      const generatedText = data.text;
      setGeneratedPost(generatedText);
      onGeneratePost(generatedText);
      
      if (!data.isFallback) {
        toast.success("LinkedIn post generated successfully!");
      } else {
        toast.info("Post generated using fallback system");
      }
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

  if (!isApiKeyConfigured) {
    return <QwenKeyInput />;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="idea" className="font-medium">Your Idea</Label>
        <Textarea 
          id="idea"
          placeholder="What's your post about? E.g., 'Our new product launch', 'Recent industry trends'..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="resize-none min-h-[100px]"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="industry" className="font-medium">Industry (Optional)</Label>
        <Input 
          id="industry"
          placeholder="E.g., Technology, Healthcare, Finance..."
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedinTone" className="font-medium">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="linkedinTone">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="inspiring">Inspiring</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="authoritative">Authoritative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="length" className="font-medium">Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger id="length">
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {isFallbackContent && fallbackWarning && (
        <Alert>
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            {fallbackWarning}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={!idea.trim() || isGenerating}
        onClick={handleGeneratePost}
      >
        {isGenerating ? "Generating LinkedIn Post..." : "Generate LinkedIn Post"}
      </Button>
      
      {generatedPost && (
        <div className="mt-6 bg-gray-800 p-4 rounded-md relative border border-gray-700">
          {isFallbackContent && (
            <div className="mb-2 text-xs text-amber-400 italic">
              Note: This content was generated using a fallback system due to API limitations.
            </div>
          )}
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

export default LinkedInPostForm;
