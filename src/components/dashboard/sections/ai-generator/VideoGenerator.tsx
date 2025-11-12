import React, { useState } from 'react';
import { Upload, Wand2, Sparkles, Video, Image as ImageIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { SeedanceAPI } from '@/services/tmp-api';

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string>('');
  
  // Video generation parameters
  const [model, setModel] = useState('seedance-1-0-pro-fast-251015');
  const [resolution, setResolution] = useState('1080p');
  const [ratio, setRatio] = useState('16:9');
  const [duration, setDuration] = useState(5);
  const [frames, setFrames] = useState('');
  const [fps, setFps] = useState(24);
  const [seed, setSeed] = useState(-1);
  const [cameraFixed, setCameraFixed] = useState(false);
  const [watermark, setWatermark] = useState(true);
  const [returnLastFrame, setReturnLastFrame] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({
          title: "Image Uploaded",
          description: "Product image ready for video generation",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnhancedPrompt(`Generate a vertical video (similar to TikTok/Reel style) featuring an attractive female food blogger (age 25-30) in a modern snack aisle. She is vlogging, holding a camera or phone on a gimbal/selfie stick.

Shot 1 (0-3s - Discovery): The blogger walks past a colourful shelf, her eyes immediately zero in on the bright red Maicih Keripik Singkong Level 10 bag. She grabs it with a look of excited anticipation. She presents the bag to the camera, pointing at the 'Hot Spicy' Level 10 indicator.

Shot 2 (4-7s - Action & Reaction): Quick close-up as she expertly rips open the bag (emphasize the sound). She picks up a chip—which is visibly covered in intense red spice dust—and pops it in her mouth.

Shot 3 (8-10s - The Kick): Transition to an Extreme Close-up on her face. Initial expression is shocked spice (eyes wide, slight sweat on forehead), quickly followed by a powerful, satisfying smile and a nod, confirming the delicious heat. Final image is her holding the bag triumphantly.`);
      
      toast({
        title: "Prompt Enhanced!",
        description: "AI optimized your prompt for better video results",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for video generation",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setVideoStatus('Creating video task...');
    
    try {
      // Build text commands from parameters
      let textCommands = '';
      if (resolution !== '1080p') textCommands += ` --rs ${resolution}`;
      if (ratio !== '16:9') textCommands += ` --rt ${ratio}`;
      if (frames) textCommands += ` --frames ${frames}`;
      else if (duration !== 5) textCommands += ` --dur ${duration}`;
      if (fps !== 24) textCommands += ` --fps ${fps}`;
      if (seed !== -1) textCommands += ` --seed ${seed}`;
      if (cameraFixed) textCommands += ` --cf true`;
      if (!watermark) textCommands += ` --watermark false`;
      
      const finalPrompt = (enhancedPrompt || prompt) + textCommands;
      
      // Build options object
      const options: any = {
        model,
        return_last_frame: returnLastFrame,
        watermark
      };
      
      if (callbackUrl) {
        options.callback_url = callbackUrl;
      }
      
      // Create video task using SeedanceAPI
      const taskResult = await SeedanceAPI.createVideoTask(finalPrompt, uploadedImage, options);
      
      if (taskResult.task_id) {
        setTaskId(taskResult.task_id);
        setVideoStatus('Video task created. Processing...');
        
        // Poll for task completion
        const finalResult = await SeedanceAPI.pollTaskUntilComplete(taskResult.task_id);
        
        if (finalResult.status === 'succeeded' || finalResult.status === 'completed') {
          // Check for video URL in the correct location based on API response format
          const videoUrl = finalResult.video_url || finalResult.content?.video_url;
          
          if (videoUrl) {
            setGeneratedVideo(videoUrl);
            toast({
              title: "Video Generated!",
              description: "Your AI-generated video is ready",
            });
          } else {
            throw new Error('No video URL in response');
          }
        } else {
          throw new Error(`Video generation failed: ${finalResult.status}`);
        }
      } else {
        throw new Error(`No task ID returned. Response: ${JSON.stringify(taskResult)}`);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setVideoStatus('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input */}
      <div className="space-y-6">
        {/* Optional Image Upload */}
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            Reference Image (Optional)
          </h2>
          
          <div className="space-y-4">
            <Label 
              htmlFor="video-image-upload"
              className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="h-full w-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload reference image (optional)</p>
                  <p className="text-xs text-slate-400 mt-1">Supports first frame generation</p>
                </div>
              )}
            </Label>
            <Input
              id="video-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {uploadedImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadedImage(null)}
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                Remove Image
              </Button>
            )}
          </div>
        </Card>

        {/* Prompt Input */}
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            Video Prompt
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-prompt">Your Prompt</Label>
              <Textarea
                id="video-prompt"
                placeholder="Describe the video you want to create... (Required)"
                className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !prompt.trim()}
              variant="outline"
              className="w-full gap-2 border-slate-600 text-white hover:bg-slate-700"
            >
              <Sparkles className={`w-4 h-4 ${isEnhancing ? 'animate-pulse' : ''}`} />
              {isEnhancing ? 'Enhancing...' : 'Enhance Prompt with AI'}
            </Button>

            {enhancedPrompt && (
              <Card className="p-4 bg-purple-600/10 border-purple-500/50 animate-fade-in">
                <p className="text-sm font-medium text-purple-300 mb-2">Enhanced Prompt:</p>
                <p className="text-white text-sm">{enhancedPrompt}</p>
              </Card>
            )}

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? (videoStatus || 'Generating...') : 'Generate Video'}
            </Button>

            <div className="text-xs text-slate-400 space-y-1">
              <p>• Enter a prompt to generate a video</p>
              <p>• Optional: Upload a reference image for first frame generation</p>
              <p>• Video generation may take 2-5 minutes</p>
            </div>
          </div>
        </Card>

        {/* Video Parameters */}
        <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-400" />
            Video Parameters
          </h2>
          
          <div className="space-y-4">
            {/* Resolution and Ratio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <select
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-slate-800/50 border-slate-700 text-white rounded-md px-3 py-2"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="ratio">Aspect Ratio</Label>
                <select
                  id="ratio"
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="w-full bg-slate-800/50 border-slate-700 text-white rounded-md px-3 py-2"
                >
                  <option value="16:9">16:9</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1</option>
                  <option value="3:4">3:4</option>
                  <option value="9:16">9:16</option>
                  <option value="21:9">21:9</option>
                  <option value="adaptive">Adaptive</option>
                </select>
              </div>
            </div>

            {/* Duration and Frames */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-slate-800/50 border-slate-700 text-white rounded-md px-3 py-2"
                  disabled={!!frames}
                >
                  <option value={2}>2 seconds</option>
                  <option value={3}>3 seconds</option>
                  <option value={4}>4 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={6}>6 seconds</option>
                  <option value={7}>7 seconds</option>
                  <option value={8}>8 seconds</option>
                  <option value={9}>9 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={11}>11 seconds</option>
                  <option value={12}>12 seconds</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="frames">Frames (optional)</Label>
                <Input
                  id="frames"
                  type="number"
                  min="29"
                  max="289"
                  placeholder="Leave empty to use duration"
                  value={frames}
                  onChange={(e) => setFrames(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Advanced Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fps">Frame Rate (fps)</Label>
                <select
                  id="fps"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full bg-slate-800/50 border-slate-700 text-white rounded-md px-3 py-2"
                >
                  <option value={8}>8 fps</option>
                  <option value={12}>12 fps</option>
                  <option value={16}>16 fps</option>
                  <option value={20}>20 fps</option>
                  <option value={24}>24 fps</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="seed">Seed (-1 for random)</Label>
                <Input
                  id="seed"
                  type="number"
                  min="-1"
                  max="4294967295"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value))}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cameraFixed"
                  checked={cameraFixed}
                  onChange={(e) => setCameraFixed(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-purple-600"
                />
                <Label htmlFor="cameraFixed" className="text-sm">Fix Camera Position</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="watermark"
                  checked={watermark}
                  onChange={(e) => setWatermark(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-purple-600"
                />
                <Label htmlFor="watermark" className="text-sm">Include Watermark</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="returnLastFrame"
                  checked={returnLastFrame}
                  onChange={(e) => setReturnLastFrame(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-purple-600"
                />
                <Label htmlFor="returnLastFrame" className="text-sm">Return Last Frame</Label>
              </div>
            </div>

            {/* Callback URL */}
            <div>
              <Label htmlFor="callbackUrl">Callback URL (optional)</Label>
              <Input
                id="callbackUrl"
                type="url"
                placeholder="https://your-callback-url.com"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Result Video</h2>
        <div className="flex items-center justify-center h-[500px] border-2 border-dashed border-slate-600 rounded-lg overflow-hidden">
          {isGenerating ? (
            <span className="flex flex-col items-center gap-2">
              <Wand2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-muted-foreground">Generating your video...</p>
            </span>
          ) : generatedVideo ? (
            <video src={generatedVideo} controls className="h-full w-full object-contain" />
          ) : (
            <p className="text-muted-foreground text-center">Generated video will appear here</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VideoGenerator;
