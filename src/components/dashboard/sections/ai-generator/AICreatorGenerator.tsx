import React, { useState, useRef } from 'react';
import { 
  ImagePlus, 
  Lightbulb, 
  RefreshCw, 
  Info, 
  Sparkles, 
  Clock, 
  Hand, 
  Mic, 
  MicOff, 
  Play, 
  Settings, 
  Ban,
  ChevronDown,
  Upload
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Asian character placeholder avatars
const sampleAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face',
];

// Avatar selection grid - more diverse Asian avatars
const avatarSelectionGrid = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face',
];

const AICreatorGenerator = () => {
  const [voiceSource, setVoiceSource] = useState<'script' | 'audio'>('script');
  const [script, setScript] = useState('');
  const [micEnabled, setMicEnabled] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [guidanceScale, setGuidanceScale] = useState([1]);
  const [autoEnhancement, setAutoEnhancement] = useState(false);
  const [resolution1080, setResolution1080] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [uploadedAudioVideo, setUploadedAudioVideo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioVideoInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAudioVideoUploadClick = () => {
    audioVideoInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhoto(event.target?.result as string);
        setSelectedAvatar(null);
        setShowAvatarSelection(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedAudioVideo(file);
    }
  };

  const handleSelectAvatar = () => {
    setShowAvatarSelection(!showAvatarSelection);
  };

  const handleAvatarGridSelect = (avatarUrl: string) => {
    setUploadedPhoto(avatarUrl);
    setShowAvatarSelection(false);
    setSelectedAvatar(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Hidden File Input for Photo */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hidden File Input for Audio/Video */}
      <Input
        ref={audioVideoInputRef}
        type="file"
        accept="audio/*,video/*,.mp3,.mp4,.wav,.webm,.ogg,.m4a,.avi,.mov,.mkv"
        className="hidden"
        onChange={handleAudioVideoChange}
      />

      {/* Left Panel - Avatar Selection */}
      <Card className="p-8 bg-background/60 backdrop-blur-sm border-dashed border-2 border-muted-foreground/30">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Upload Icon or Uploaded Photo */}
          <div className="w-32 h-32 flex items-center justify-center rounded-lg overflow-hidden">
            {uploadedPhoto ? (
              <img 
                src={uploadedPhoto} 
                alt="Uploaded avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlus className="w-12 h-12 text-muted-foreground" />
            )}
          </div>

          {/* Title with Tips */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-foreground font-medium">Upload a photo or select an avatar</span>
              <span className="flex items-center gap-1 text-yellow-500 text-sm">
                <Lightbulb className="w-4 h-4" />
                Tips
              </span>
            </div>
            <p className="text-muted-foreground text-sm">Max 50MB for uploaded photo</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="bg-muted/50 border-muted-foreground/30 hover:bg-muted gap-2"
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4" />
              Upload photo
            </Button>
            <Button 
              variant="outline" 
              className={`bg-muted/50 border-muted-foreground/30 hover:bg-muted ${showAvatarSelection ? 'ring-2 ring-purple-500' : ''}`}
              onClick={handleSelectAvatar}
            >
              Select avatar
            </Button>
          </div>

          {/* Avatar Selection Grid */}
          {showAvatarSelection && (
            <div className="w-full p-4 bg-muted/30 rounded-lg border border-muted-foreground/20">
              <p className="text-sm text-muted-foreground mb-3">Choose an avatar</p>
              <div className="grid grid-cols-4 gap-3">
                {avatarSelectionGrid.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleAvatarGridSelect(avatar)}
                    className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                  >
                    <img 
                      src={avatar} 
                      alt={`Avatar option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="w-full flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-muted-foreground/20" />
            <span className="text-muted-foreground text-sm">Try these</span>
            <div className="flex-1 h-px bg-muted-foreground/20" />
          </div>

          {/* Sample Avatars */}
          <div className="flex items-center gap-3">
            {sampleAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedAvatar(index);
                  setUploadedPhoto(avatar);
                  setShowAvatarSelection(false);
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  selectedAvatar === index 
                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background' 
                    : 'hover:opacity-80'
                }`}
              >
                <img 
                  src={avatar} 
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            <Button 
              variant="outline" 
              size="icon"
              className="w-16 h-16 bg-muted/30 border-muted-foreground/30 hover:bg-muted"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Prompt Section - Moved below avatars */}
          <div className="w-full space-y-3 pt-4">
            <span className="text-foreground font-medium">Prompt</span>
            <Textarea 
              placeholder="Cinematic shoulders-up shot with teal gradient, soft lighting, natural pose, hyper-real clarity."
              className="min-h-[140px] bg-muted/20 border-muted-foreground/20 resize-none text-sm w-full"
            />
          </div>
        </div>
      </Card>

      {/* Right Panel - Voice & Script Settings */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-muted-foreground/20 space-y-6">
        {/* Voice Source Header */}
        <div className="space-y-4">
          <h3 className="text-foreground font-medium">Choose a voice source for your avatar</h3>
          
          <Tabs value={voiceSource} onValueChange={(v) => setVoiceSource(v as 'script' | 'audio')}>
            <TabsList className="w-full bg-muted/30">
              <TabsTrigger value="script" className="flex-1 data-[state=active]:bg-muted">
                Add Script
              </TabsTrigger>
              <TabsTrigger 
                value="audio" 
                className="flex-1 data-[state=active]:bg-muted"
                onClick={handleAudioVideoUploadClick}
              >
                Upload Audio/Video
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Uploaded Audio/Video Display */}
          {uploadedAudioVideo && (
            <div className="p-3 bg-muted/30 rounded-lg border border-muted-foreground/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium truncate max-w-[200px]">
                    {uploadedAudioVideo.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {(uploadedAudioVideo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setUploadedAudioVideo(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Script Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">Script</span>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Try a sample
              </button>
              <button className="flex items-center gap-1 text-purple-400 text-sm hover:text-purple-300 transition-colors">
                <Sparkles className="w-4 h-4" />
                Script writer
              </button>
            </div>
          </div>

          <div className="relative">
            <Textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your script, pick an avatar, and bring your video to life in minutes."
              className="min-h-[120px] bg-muted/20 border-muted-foreground/20 resize-none pr-16"
              maxLength={1200}
            />
            <span className="absolute bottom-3 right-3 text-muted-foreground text-xs">
              {script.length}/1200
            </span>
          </div>

          {/* Script Controls */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Clock className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Hand className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMicEnabled(!micEnabled)}
              className={`gap-2 h-8 ${micEnabled ? 'bg-purple-500/20 border-purple-500' : 'bg-muted/30 border-muted-foreground/30'}`}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {micEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-8 bg-muted/30 border-muted-foreground/30">
              <span className="text-purple-400">A</span>
              Voice emotion
            </Button>
            <div className="flex-1" />
            <Button size="icon" className="h-8 w-8 bg-purple-600 hover:bg-purple-700 rounded-full">
              <Play className="w-4 h-4 fill-current" />
            </Button>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="flex items-center justify-between">
          <span className="text-foreground font-medium">Voice</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-muted/30 border-muted-foreground/30">
              Select voice
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-muted/30 border-muted-foreground/30">
              Voice model V3
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Caption Style */}
        <div className="space-y-3">
          <span className="text-foreground font-medium">Caption style</span>
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-muted-foreground/20">
            <div className="text-center space-y-2">
              <Ban className="w-8 h-8 text-muted-foreground mx-auto" />
              <span className="text-muted-foreground text-sm">No caption</span>
            </div>
          </div>
        </div>

        {/* Prompt Guidance Scale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium">Prompt Guidance Scale</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{guidanceScale[0].toFixed(1)}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-xs">0</span>
            <Slider
              value={guidanceScale}
              onValueChange={setGuidanceScale}
              max={10}
              step={0.1}
              className="flex-1"
            />
            <span className="text-muted-foreground text-xs">10</span>
          </div>
        </div>

        {/* Bottom Toggles */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <span className="text-foreground text-sm">Auto enhancement</span>
            <Info className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline" className="text-purple-400 border-purple-400/50 text-xs">PRO</Badge>
            <Switch checked={autoEnhancement} onCheckedChange={setAutoEnhancement} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-foreground text-sm">1080p</span>
            <Switch checked={resolution1080} onCheckedChange={setResolution1080} />
            <span className="text-muted-foreground text-xs">OFF</span>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center pt-6">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
            size="lg"
          >
            Generate AI Creator
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AICreatorGenerator;
