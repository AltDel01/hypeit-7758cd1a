
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface XPostFormProps {
  onGeneratePost: (post: string) => void;
}

const XPostForm: React.FC<XPostFormProps> = ({ onGeneratePost }) => {
  const [idea, setIdea] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [tone, setTone] = useState('conversational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  const handleGeneratePost = async () => {
    if (!idea.trim()) {
      toast.error("Please enter your idea for the post");
      return;
    }

    setIsGenerating(true);
    
    const prompt = hashtags 
      ? `Create a short X (Twitter) post about ${idea} with these hashtags: ${hashtags}.` 
      : `Create a short X (Twitter) post about ${idea} with 1-2 relevant hashtags.`;
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: {
          prompt,
          tone,
          platform: 'x',
          length: 'short' // X posts are always short
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
      toast.error("Failed to generate post. API key may not be configured correctly.");
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
        <Label htmlFor="idea" className="font-medium">Your Idea</Label>
        <Textarea 
          id="idea"
          placeholder="What's your post about? Keep it concise for X."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="hashtags" className="font-medium">Hashtags (Optional)</Label>
        <Input 
          id="hashtags"
          placeholder="E.g., #marketing #social"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">Leave empty for AI-generated hashtags</p>
      </div>
      
      <div>
        <Label htmlFor="tone" className="font-medium">Tone</Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger id="tone">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conversational">Conversational</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="humorous">Humorous</SelectItem>
            <SelectItem value="informative">Informative</SelectItem>
            <SelectItem value="persuasive">Persuasive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
    </div>
  );
};

export default XPostForm;
