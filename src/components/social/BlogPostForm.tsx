
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BlogPostFormProps {
  onGeneratePost: (text: string) => void;
}

const BlogPostForm = ({ onGeneratePost }: BlogPostFormProps) => {
  const [topic, setTopic] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast.error('Please enter a topic for your blog post');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: {
          prompt: topic,
          platform: 'blog',
          tone: 'professional',
          length: 'long'
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onGeneratePost(data.text);
      toast.success('Blog post generated successfully!');
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast.error('Failed to generate blog post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          What topic would you like to write about?
        </label>
        <Textarea
          placeholder="Enter your blog topic or product description for SEO-optimized content..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-32 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Target Platform
        </label>
        <select
          value={targetPlatform}
          onChange={(e) => setTargetPlatform(e.target.value)}
          className="w-full rounded-md bg-gray-800 border border-gray-700 text-white px-3 py-2"
        >
          <option value="medium">Medium</option>
          <option value="wordpress">WordPress</option>
          <option value="local">Local News</option>
        </select>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-[#8c52ff] hover:bg-[#7a45e6]"
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate SEO-Optimized Blog Post'}
      </Button>
    </form>
  );
};

export default BlogPostForm;
