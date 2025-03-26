
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const handleGeneratePost = async () => {
    if (!idea.trim()) {
      toast.error("Please enter your idea for the post");
      return;
    }

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
        throw new Error(data.error);
      }

      const generatedText = data.text;
      setGeneratedPost(generatedText);
      onGeneratePost(generatedText);
      toast.success("LinkedIn post generated successfully!");
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error("Failed to generate post. OpenAI API key may not be configured correctly.");
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
