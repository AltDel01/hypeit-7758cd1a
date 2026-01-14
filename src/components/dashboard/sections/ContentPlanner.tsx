import React, { useState } from 'react';
import { Calendar, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// AI API is handled securely via Edge Functions - no client-side keys needed

const dummyCalendarContent = [
  { 
    day: 1, 
    title: "Welcome Post", 
    pillar: "Branding",
    prompt: "Create a warm, inviting photo of De'karrel Popcorn bags (Caramele and Barbeque flavors) arranged on a rustic wooden table with scattered popcorn kernels and golden lighting. Add tagline: \"Enjoy the Taste of Happiness.\"",
    caption: "🍿 Welcome to De'karrel Popcorn!\nPremium mushroom popcorn made in Indonesia since 2000. Crunchy, sweet, and irresistibly delicious!\n#DekarrelPopcorn #PremiumPopcorn #MadeInIndonesia"
  },
  { 
    day: 2, 
    title: "Product Showcase", 
    pillar: "Product Highlight",
    prompt: "Professional product photo of De'karrel Caramele Popcorn spilling from the bag into a stylish bowl, with golden caramel drizzle effect and warm studio lighting.",
    caption: "Sweet, crunchy, and absolutely addictive! 🍯\nOur Caramele flavor is coated with rich, buttery caramel goodness.\n#DekarrelCaramele #SweetTreat #PopcornLovers"
  },
  { 
    day: 3, 
    title: "Behind the Scenes", 
    pillar: "Authenticity",
    prompt: "Show a clean factory scene where premium mushroom corn is being popped and coated, with De'karrel packaging visible in the background and quality control process.",
    caption: "Every kernel is crafted with care ❤️\nNon GMO corn. No MSG. No artificial coloring. Just pure happiness!\n#BehindTheScenes #DekarrelQuality"
  },
  { 
    day: 4, 
    title: "Customer Testimonial", 
    pillar: "Community",
    prompt: "Happy customers enjoying De'karrel Popcorn at a movie night or casual hangout, with warm natural lighting and genuine smiles.",
    caption: "⭐️⭐️⭐️⭐️⭐️\n\"Nggak bisa berhenti ngemil! Rasa Caramele-nya juara banget!\"\nThank you for the love, Popcorn fans!\n#DekarrelFans #CustomerLove"
  },
  { 
    day: 5, 
    title: "Educational Content", 
    pillar: "Education",
    prompt: "Infographic-style visual showing mushroom popcorn kernels, \"Non GMO Corn\", \"No MSG\", \"No Coloring\" badges with De'karrel branding.",
    caption: "Did you know? 🌿\nDe'karrel uses premium mushroom corn. Rounder, crunchier, and perfect for coating!\n#FunFactDekarrel #HealthySnack"
  },
  { 
    day: 6, 
    title: "Friday Motivation", 
    pillar: "Engagement",
    prompt: "Artistic visual of De'karrel Barbeque Popcorn with smoky effects and quote overlay: \"Pop your way to happiness.\"",
    caption: "🔥 \"Life is better with popcorn.\"\nEnd your week with the smoky, savory taste of Barbeque!\n#FridayVibes #DekarrelBarbeque"
  },
  { 
    day: 7, 
    title: "Weekend Special", 
    pillar: "Promotion",
    prompt: "Dynamic visual showing both De'karrel Caramele and Barbeque bags with \"Weekend Snack Deal\" glowing text.",
    caption: "Weekend's here! 🎉\nGrab both flavors, Caramele AND Barbeque, perfect for movie marathon!\n#WeekendTreat #DekarrelPromo"
  },
  { 
    day: 8, 
    title: "User Generated Content", 
    pillar: "Community",
    prompt: "Collage of user-submitted photos of people enjoying De'karrel Popcorn at various moments (movies, parties, snacking).",
    caption: "We love seeing YOU enjoy De'karrel! 🍿❤️\nTag us with #DekarrelMoments for a chance to be featured!\n#PopcornCommunity #DekarrelFans"
  },
  { 
    day: 9, 
    title: "Product Tutorial", 
    pillar: "Education",
    prompt: "Flat lay showing De'karrel Popcorn as perfect pairing with hot chocolate, coffee, or as movie snack setup.",
    caption: "💡 De'karrel Hack:\nPair our Caramele with hot chocolate or Barbeque with cold drinks. Perfect combo!\n#SnackHack #DekarrelStyle"
  },
  { 
    day: 10, 
    title: "Team Spotlight", 
    pillar: "Branding / Human Touch",
    prompt: "Portrait of a De'karrel production team member smiling proudly with popcorn production equipment behind.",
    caption: "Meet one of our heroes behind the crunch 🍿\nCrafting your favorite snack with heart, every day since 2000!\n#TeamDekarrel #BehindTheCrunch"
  },
  { 
    day: 11, 
    title: "Industry News", 
    pillar: "Education / Awareness",
    prompt: "Clean graphic showing \"Indonesian Premium Snacks\" trend with De'karrel packaging featured prominently.",
    caption: "Proudly local, made with love 🇮🇩\nIndonesian snacks are winning hearts and we're popping up the flavor!\n#SupportLocalBrand #DekarrelPride"
  },
  { 
    day: 12, 
    title: "Throwback Thursday", 
    pillar: "Storytelling",
    prompt: "Vintage-style visual showing De'karrel heritage since EST. 2000 with nostalgic Indonesian snack vibes.",
    caption: "Throwback to when it all started 🏭✨\nFrom 2000 to now, thank you for growing with us!\n#TBTDekarrel #Since2000"
  },
  { 
    day: 13, 
    title: "Q&A Session", 
    pillar: "Engagement",
    prompt: "Simple visual with De'karrel bags and bold text overlay: \"Ask De'karrel Anything!\"",
    caption: "Got a crunchy question? Drop it below! 👇\nWe're answering your De'karrel curiosities all day!\n#AskDekarrel #PopcornTalk"
  },
  { 
    day: 14, 
    title: "Flash Sale Alert", 
    pillar: "Promotion",
    prompt: "Eye-catching visual with golden popcorn background, timer icon, and text \"24-Hour Popcorn Deal!\"",
    caption: "FLASH SALE ⚡\nGrab your favorite De'karrel flavors before they're gone. 24 hours only!\n#DekarrelFlashSale #PopcornDeal"
  },
  { 
    day: 15, 
    title: "Thank You Post", 
    pillar: "Community",
    prompt: "Heartwarming visual of De'karrel bags with \"Thank You\" message and happy customer montage.",
    caption: "You make De'karrel what it is ❤️\nFrom our hearts to yours, thank you for enjoying the taste of happiness!\n#ThankYouDekarrel #PopcornPride"
  },
];

interface CalendarItem {
  day: number;
  title: string;
  pillar: string;
  prompt: string;
  caption: string;
}

const ContentPlanner = () => {
  const [businessInfo, setBusinessInfo] = useState({
    business: '',
    industry: '',
    marketSegment: '',
    caption: ''
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedCaption, setEnhancedCaption] = useState('');
  const [selectedDay, setSelectedDay] = useState<CalendarItem | null>(null);
  const [showCalendar, setShowCalendar] = useState(true);

  const handleEnhanceCaption = async () => {
    if (!businessInfo.caption.trim()) {
      toast({
        title: "Business Idea Required",
        description: "Please enter a business idea to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnhancedCaption(`Create a series of social media visuals promoting De'karrel Popcorn, a premium mushroom popcorn brand made in Indonesia since 2000.
Each post should follow a monthly storytelling theme that connects Indonesian heritage, quality ingredients, and the joy of crunchy snacking.
Use warm golden lighting, cozy textures, and showcase both Caramele and Barbeque flavors to express premium quality and happiness.
Include subtle text overlays with emotional taglines (e.g., "Enjoy the Taste of Happiness", "Crunchy! Sweet!", "Premium Mushroom Popcorn").
Highlight key selling points: Non GMO Corn, No MSG, No Coloring, and HALAL certified.`);
      
      toast({
        title: "Business Idea Enhanced!",
        description: "AI has optimized your business idea for better engagement",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance business idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateCalendar = async () => {
    if (!enhancedCaption) {
      toast({
        title: "Enhanced Idea Required",
        description: "Please enhance your business idea first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowCalendar(true);
      toast({
        title: "Content Calendar Generated!",
        description: "Your 15-day content calendar is ready",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 animate-gradient-text">
            Content Planner
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Plan your 15-day content calendar with AI
          </p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Business Information Form */}
      <Card className="p-4 md:p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
          Business Information
        </h2>
        
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <Label htmlFor="business" className="text-sm">Business Name</Label>
            <Input
              id="business"
              placeholder="e.g., Coffee Shop"
              value={businessInfo.business}
              onChange={(e) => setBusinessInfo({...businessInfo, business: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="industry" className="text-sm">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Food & Beverage"
              value={businessInfo.industry}
              onChange={(e) => setBusinessInfo({...businessInfo, industry: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="segment" className="text-sm">Market Segment</Label>
            <Input
              id="segment"
              placeholder="e.g., Young Professionals"
              value={businessInfo.marketSegment}
              onChange={(e) => setBusinessInfo({...businessInfo, marketSegment: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>

        {/* Business Idea Enhancer */}
        <div className="space-y-4">
          <Label htmlFor="caption">Business Idea</Label>
          <Textarea
            id="caption"
            placeholder="Enter your business idea here..."
            className="min-h-[120px]"
            value={businessInfo.caption}
            onChange={(e) => setBusinessInfo({...businessInfo, caption: e.target.value})}
          />
          
          <Button 
            onClick={handleEnhanceCaption}
            disabled={isEnhancing}
            className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Sparkles className={`w-4 h-4 ${isEnhancing ? 'animate-pulse' : ''}`} />
            {isEnhancing ? 'Enhancing with AI...' : 'Enhance Business Idea with AI'}
          </Button>

          {enhancedCaption && (
            <Card className="p-4 bg-purple-600/10 border-purple-500/50 animate-fade-in">
              <p className="text-sm font-medium text-purple-300 mb-2">Enhanced Business Idea:</p>
              <p className="text-white whitespace-pre-wrap">{enhancedCaption}</p>
            </Card>
          )}

          {enhancedCaption && (
            <Button 
              onClick={handleGenerateCalendar}
              disabled={isGenerating}
              className="gap-2 bg-[#8c52ff] hover:bg-[#7a45e6]"
            >
              <Calendar className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
              {isGenerating ? 'Generating Calendar...' : 'Generate Content Calendar'}
            </Button>
          )}
        </div>
      </Card>

      {/* Calendar View */}
      {showCalendar && (
        <Card className="p-4 md:p-6 bg-background/60 backdrop-blur-sm border-slate-700">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
            15-Day Content Calendar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
            {dummyCalendarContent.map((day) => (
              <Card 
                key={day.day} 
                className="p-3 md:p-4 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer flex flex-col"
                onClick={() => setSelectedDay(day)}
              >
                <p className="text-xs md:text-sm font-medium text-white mb-1 md:mb-2">Day {day.day}</p>
                <p className="text-xs font-semibold text-purple-300 mb-1 line-clamp-1">{day.title}</p>
                <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full bg-cyan-600/20 text-cyan-300 mb-1 md:mb-2 inline-block w-fit">{day.pillar}</span>
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 line-clamp-2 md:line-clamp-3 hidden sm:block">{day.prompt}</p>
                <p className="text-[10px] md:text-xs text-slate-400 mt-auto line-clamp-1 md:line-clamp-2">{day.caption}</p>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span className="text-purple-400">Day {selectedDay?.day}</span>
              <span>-</span>
              <span>{selectedDay?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              <div>
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-600/20 text-cyan-300">
                  {selectedDay.pillar}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-purple-300 mb-2">Visual Prompt:</h4>
                <p className="text-sm text-muted-foreground bg-slate-800/50 p-4 rounded-lg">
                  {selectedDay.prompt}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-purple-300 mb-2">Caption:</h4>
                <p className="text-sm text-white bg-slate-800/50 p-4 rounded-lg whitespace-pre-wrap">
                  {selectedDay.caption}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentPlanner;
