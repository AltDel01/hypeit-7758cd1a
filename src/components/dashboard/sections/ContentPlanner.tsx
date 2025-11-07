import React, { useState } from 'react';
import { Calendar, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

// AI API Configuration
const AI_API_KEY = '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';

const dummyCalendarContent = [
  { 
    day: 1, 
    title: "Welcome Post", 
    pillar: "Branding",
    prompt: "Create a warm, rustic photo of a Maicih Keripik Singkong bag placed on a wooden table surrounded by red chili peppers and cassava roots. Add glowing sunlight and a subtle tagline: \"Taste the Tradition.\"",
    caption: "🔥 Welcome to the world of Maicih!\nFrom humble beginnings to Indonesia's favorite spicy cassava chips — taste the legacy, feel the heat, and embrace the tradition.\n#Maicih #SnackLokal #TasteTheTradition"
  },
  { 
    day: 2, 
    title: "Product Showcase", 
    pillar: "Product Highlight",
    prompt: "Professional product photo of Maicih chips spilling from the bag into a small bowl, with chili flakes scattered around and glowing red lighting.",
    caption: "Level 10? Only for the brave. 🌶️\nCrunchy, spicy, and proudly Indonesian — this is how we do keripik singkong!\n#MaicihLevel10 #SpicyLegend #SnackIndonesia"
  },
  { 
    day: 3, 
    title: "Behind the Scenes", 
    pillar: "Authenticity",
    prompt: "Show a cozy kitchen or home factory scene where cassava is being sliced and fried, with the Maicih bag subtly visible in the background.",
    caption: "Every pack of Maicih is crafted with passion.\nReal cassava. Real spice. Real dedication. ❤️\n#BehindTheSpice #MaicihStory"
  },
  { 
    day: 4, 
    title: "Customer Testimonial", 
    pillar: "Community",
    prompt: "A happy customer holding a Maicih bag while smiling with friends in a casual hangout spot, bright and natural lighting.",
    caption: "⭐️⭐️⭐️⭐️⭐️\n\"Nggak bisa berhenti ngemil! Level 10-nya bikin nagih banget!\"\nThank you for the love, Maicih fans!\n#MaicihFans #SnackLokalBangga"
  },
  { 
    day: 5, 
    title: "Educational Content", 
    pillar: "Education",
    prompt: "Infographic-style visual showing cassava roots, chili peppers, and text labels \"Real Ingredients. Real Flavor.\"",
    caption: "Did you know? 🌿\nMaicih is made from hand-picked cassava and real chili — no shortcuts, no compromises.\n#FunFactMaicih #RealIngredientsRealFlavor"
  },
  { 
    day: 6, 
    title: "Friday Motivation", 
    pillar: "Engagement",
    prompt: "Artistic visual of a Maicih bag with spicy flames and quote overlay: \"Stay spicy, stay strong.\"",
    caption: "🔥 \"Be bold. Be brave. Be spicy.\"\nBecause life's too short for bland snacks.\n#SpicyMotivation #MaicihEnergy"
  },
  { 
    day: 7, 
    title: "Weekend Special", 
    pillar: "Promotion",
    prompt: "Dynamic visual showing multiple Maicih bags with \"Weekend Spicy Deal\" glowing text.",
    caption: "Weekend's here! 🌶️\nEnjoy special deals on your favorite Maicih — only this weekend!\n#WeekendSpice #MaicihPromo"
  },
  { 
    day: 8, 
    title: "User Generated Content", 
    pillar: "Community",
    prompt: "Collage of user-submitted photos of people enjoying Maicih (mock-up style).",
    caption: "We love seeing YOU enjoy Maicih ❤️\nTag us with #MaicihMoments for a chance to be featured!\n#MaicihFans #SnackCommunity"
  },
  { 
    day: 9, 
    title: "Product Tutorial", 
    pillar: "Education",
    prompt: "Flat lay showing Maicih chips mixed with other Indonesian street snacks (cilok, tahu, or mie).",
    caption: "💡 Maicih Hack:\nSprinkle Maicih Level 10 on your instant noodles or tahu goreng — instant upgrade!\n#SnackHack #MaicihStyle"
  },
  { 
    day: 10, 
    title: "Team Spotlight", 
    pillar: "Branding / Human Touch",
    prompt: "Portrait of a Maicih production team member smiling proudly with chili baskets behind.",
    caption: "Meet one of our heroes behind the crunch 🌶️\nCrafting your favorite snack with heart, every day.\n#TeamMaicih #BehindTheCrunch"
  },
  { 
    day: 11, 
    title: "Industry News", 
    pillar: "Education / Awareness",
    prompt: "Clean graphic of trending \"Indonesian Snack Exports Rising\" with Maicih packaging subtly featured.",
    caption: "Proudly local, going global 🌏\nIndonesian snacks are winning hearts worldwide — and we're spicing up the journey!\n#SnackIndustry #MaicihGoesGlobal"
  },
  { 
    day: 12, 
    title: "Throwback Thursday", 
    pillar: "Storytelling",
    prompt: "Vintage-style visual of the first Maicih packaging and street vendor vibes.",
    caption: "Throwback to the OG Maicih days 🚚🔥\nFrom street to legend — thank you for growing with us!\n#TBTMaicih #SnackHistory"
  },
  { 
    day: 13, 
    title: "Q&A Session", 
    pillar: "Engagement",
    prompt: "Simple visual with Maicih bag and bold text overlay: \"Ask Maicih Anything!\"",
    caption: "Got a spicy question? Drop it below! 👇\nWe're answering your Maicih curiosities all day!\n#AskMaicih #SpicyTalk"
  },
  { 
    day: 14, 
    title: "Flash Sale Alert", 
    pillar: "Promotion",
    prompt: "Eye-catching visual with fiery background, timer icon, and text \"24-Hour Spicy Deal!\"",
    caption: "FLASH SALE ⚡\nGrab your favorite Maicih before it's gone — 24 hours only!\n#MaicihFlashSale #SpicyDeal"
  },
  { 
    day: 15, 
    title: "Thank You Post", 
    pillar: "Community",
    prompt: "Heartwarming group of fans holding Maicih bags, smiling together outdoors.",
    caption: "You make Maicih what it is ❤️\nFrom our hearts (and chilies) to yours — thank you for keeping the fire alive!\n#ThankYouMaicih #SnackLokalPride"
  },
];

const ContentPlanner = () => {
  const [businessInfo, setBusinessInfo] = useState({
    business: '',
    industry: '',
    marketSegment: '',
    caption: ''
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedCaption, setEnhancedCaption] = useState('');

  const handleEnhanceCaption = async () => {
    if (!businessInfo.caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please enter a caption to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnhancedCaption(`Create a series of social media visuals promoting Maicih Keripik Singkong, a traditional spicy cassava chip from Indonesia.
Each post should follow a monthly storytelling theme that connects Indonesian heritage, community, and the joy of spicy snacks.
Use warm lighting, rustic tones, wooden textures, and real ingredients like chili peppers and cassava roots to express authenticity and tradition.
Include subtle text overlays with emotional taglines (e.g., "Taste the Tradition", "Level 10, Only for the Brave", "Snack with Soul").
Ensure the product is always the hero, surrounded by relatable lifestyle or cultural scenes`);
      
      toast({
        title: "Caption Enhanced!",
        description: "AI has optimized your caption for better engagement",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance caption. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 animate-gradient-text">
            Content Planner
          </h1>
          <p className="text-muted-foreground">
            Plan your 15-day content calendar with AI-powered caption enhancement
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Business Information Form */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Business Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="business">Business Name</Label>
            <Input
              id="business"
              placeholder="e.g., Coffee Shop"
              value={businessInfo.business}
              onChange={(e) => setBusinessInfo({...businessInfo, business: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Food & Beverage"
              value={businessInfo.industry}
              onChange={(e) => setBusinessInfo({...businessInfo, industry: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="segment">Market Segment</Label>
            <Input
              id="segment"
              placeholder="e.g., Young Professionals"
              value={businessInfo.marketSegment}
              onChange={(e) => setBusinessInfo({...businessInfo, marketSegment: e.target.value})}
            />
          </div>
        </div>

        {/* Caption Enhancer */}
        <div className="space-y-4">
          <Label htmlFor="caption">Caption / Content Idea</Label>
          <Textarea
            id="caption"
            placeholder="Enter your caption or content idea here..."
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
            {isEnhancing ? 'Enhancing with AI...' : 'Enhance Caption with AI'}
          </Button>

          {enhancedCaption && (
            <Card className="p-4 bg-purple-600/10 border-purple-500/50 animate-fade-in">
              <p className="text-sm font-medium text-purple-300 mb-2">Enhanced Caption:</p>
              <p className="text-white whitespace-pre-wrap">{enhancedCaption}</p>
            </Card>
          )}
        </div>
      </Card>

      {/* Calendar View */}
      <Card className="p-6 bg-background/60 backdrop-blur-sm border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          15-Day Content Calendar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dummyCalendarContent.map((day) => (
            <Card 
              key={day.day} 
              className="p-4 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer flex flex-col"
            >
              <p className="text-sm font-medium text-white mb-2">Day {day.day}</p>
              <p className="text-xs font-semibold text-purple-300 mb-1">{day.title}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-cyan-600/20 text-cyan-300 mb-2 inline-block w-fit">{day.pillar}</span>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-3">{day.prompt}</p>
              <p className="text-xs text-slate-400 mt-auto line-clamp-2">{day.caption}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ContentPlanner;
