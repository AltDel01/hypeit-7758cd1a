
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
        throw new Error(error.message);
      }

      if (data.error) {
        setErrorMessage(data.error);
        toast.error(`Failed to generate post: ${data.error}`);
        return;
      }

      const generatedText = data.text;
      setGeneratedPost(generatedText);
      onGeneratePost(generatedText);
      toast.success("LinkedIn post generated successfully!");
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
      
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={!idea.trim() || isGenerating}
        onClick={handleGeneratePost}
      >
        {isGenerating ? "Generating LinkedIn Post..." : "Generate LinkedIn Post"}
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
    </div>
  );
};

export default LinkedInPostForm;
