
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from 'lucide-react';
import { toast } from "sonner";

interface XPostFormProps {
  apiKey: string;
  onGeneratePost: (post: string) => void;
}

const XPostForm: React.FC<XPostFormProps> = ({ apiKey, onGeneratePost }) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('conversational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  const handleGeneratePost = async () => {
    if (!apiKey) {
      toast.error("Please add your Qwen API key first");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter your prompt for the post");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Here we'd normally call the Qwen AI API
      // For now, let's simulate the API call
      setTimeout(() => {
        const simulatedPost = generateSimulatedPost(prompt, tone);
        setGeneratedPost(simulatedPost);
        onGeneratePost(simulatedPost);
        setIsGenerating(false);
        toast.success("X post generated successfully!");
      }, 1500);
      
      // Uncomment this code when ready to implement the actual API call
      /*
      const response = await fetch('https://api.qwen.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-max',
          messages: [
            {
              role: 'system',
              content: `You are a social media expert who creates engaging posts for X (Twitter). Write a concise post in a ${tone} tone that's under 280 characters.`
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      setGeneratedPost(generatedText);
      onGeneratePost(generatedText);
      */
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

  // Temporary function to simulate post generation
  const generateSimulatedPost = (prompt: string, tone: string) => {
    const hashtags = ["#Innovation", "#Growth", "#Leadership", "#Tech", "#Future"];
    const randomHashtags = hashtags.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    let post = '';
    
    switch (tone) {
      case 'conversational':
        post = `Just thinking about ${prompt}. What are your thoughts on this? ${randomHashtags.join(' ')}`;
        break;
      case 'professional':
        post = `I've been researching ${prompt} and the potential impact on our industry is significant. ${randomHashtags.join(' ')}`;
        break;
      case 'excited':
        post = `Thrilled to share my thoughts on ${prompt}! This is a game-changer! 🚀 ${randomHashtags.join(' ')}`;
        break;
      case 'thoughtful':
        post = `${prompt} raises important questions about how we approach problems. Worth considering... ${randomHashtags.join(' ')}`;
        break;
      default:
        post = `Some thoughts on ${prompt} - what do you think? ${randomHashtags.join(' ')}`;
    }
    
    return post;
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
