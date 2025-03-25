
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from 'lucide-react';
import { toast } from "sonner";

interface LinkedInPostFormProps {
  apiKey: string;
  onGeneratePost: (post: string) => void;
}

const LinkedInPostForm: React.FC<LinkedInPostFormProps> = ({ apiKey, onGeneratePost }) => {
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState('professional');
  const [postLength, setPostLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  const handleGeneratePost = async () => {
    if (!apiKey) {
      toast.error("Please add your Qwen API key first");
      return;
    }

    if (!idea.trim()) {
      toast.error("Please enter your idea for the post");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Here we'd normally call the Qwen AI API
      // For now, let's simulate the API call
      setTimeout(() => {
        const simulatedPost = generateSimulatedPost(idea, industry, tone, postLength);
        setGeneratedPost(simulatedPost);
        onGeneratePost(simulatedPost);
        setIsGenerating(false);
        toast.success("LinkedIn post generated successfully!");
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
              content: `You are a professional LinkedIn post writer. Create a ${postLength} length post in a ${tone} tone${industry ? ' for the ' + industry + ' industry' : ''}.`
            },
            {
              role: 'user',
              content: idea
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
  const generateSimulatedPost = (idea: string, industry: string, tone: string, length: string) => {
    const industrySuffix = industry ? ` in the ${industry} industry` : '';
    const lengthMultiplier = length === 'short' ? 1 : length === 'medium' ? 2 : 3;
    
    let post = `I'm excited to share some thoughts about ${idea}${industrySuffix}!\n\n`;
    
    if (lengthMultiplier >= 2) {
      post += `Over the past few weeks, I've been deeply exploring this topic and wanted to share some key insights with my network.\n\n`;
    }
    
    post += `Here are 3 important takeaways:\n\n`;
    post += `1️⃣ Innovation is key to staying ahead in today's rapidly evolving landscape\n`;
    post += `2️⃣ Building strong relationships with partners and customers creates long-term value\n`;
    post += `3️⃣ Continuous learning and adaptation are essential for success\n\n`;
    
    if (lengthMultiplier >= 3) {
      post += `I've seen firsthand how these principles can transform organizations and drive meaningful outcomes. The companies that embrace these ideas consistently outperform their competitors.\n\n`;
    }
    
    post += `What are your thoughts on ${idea}? I'd love to hear your perspectives in the comments!\n\n`;
    post += `#ProfessionalDevelopment #Innovation #Leadership`;
    
    return post;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="idea" className="font-medium">Your Idea</Label>
        <Textarea 
          id="idea"
          placeholder="Enter your idea or topic for a LinkedIn post..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="resize-none min-h-[120px]"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tone" className="font-medium">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="inspirational">Inspirational</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="authoritative">Authoritative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="industry" className="font-medium">Industry (Optional)</Label>
          <Input 
            id="industry"
            placeholder="e.g. Tech, Finance, Healthcare"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="postLength" className="font-medium">Post Length</Label>
        <Select value={postLength} onValueChange={setPostLength}>
          <SelectTrigger id="postLength">
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="long">Long</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white py-6"
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
