
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface XPostFormProps {
  onGeneratePost: (post: string) => void;
}

const XPostForm: React.FC<XPostFormProps> = ({ onGeneratePost }) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('conversational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  const handleGeneratePost = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter your prompt for the post");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: {
          prompt,
          tone,
          platform: 'x'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const generatedText = data.text;
      setGeneratedPost(generatedText);
      onGeneratePost(generatedText);
      toast.success("X post generated successfully!");
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error("Failed to generate post. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    toast.success("Post copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prompt" className="font-medium">Your Prompt</Label>
        <Textarea 
          id="prompt"
          placeholder="Enter details about your product or idea for X post generation..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="resize-none min-h-[100px]"
          rows={3}
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
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="excited">Excited</SelectItem>
            <SelectItem value="thoughtful">Thoughtful</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={!prompt.trim() || isGenerating}
        onClick={handleGeneratePost}
      >
        {isGenerating ? "Generating X Post..." : "Generate X Post"}
      </Button>
      
      {generatedPost && (
        <div className="mt-4 bg-gray-800 p-4 rounded-md relative border border-gray-700">
          <p className="text-sm text-white">{generatedPost}</p>
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

export default XPostForm;
