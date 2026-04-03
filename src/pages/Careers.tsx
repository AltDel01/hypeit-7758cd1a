import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ChevronDown, Briefcase, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Position {
  title: string;
  description: string;
}

const positions: Position[] = [
  {
    title: 'Producer',
    description: 'As a Producer in Brand Studio, you will be the organizational force behind big brand productions. You will look to grow your skills into multiple mediums (i.e., social, film, broadcast, interactive, print), and will manage all of the foundational elements necessary to bring world-class creative ideas to life. You will partner with Senior Producers and Creative teams, facilitating the execution of medium-to-large brand-critical projects, with a strong emphasis on social executions. Your work will involve developing and managing production schedules, facilitating pre-production, as well as managing dashboards, statuses, stakeholder feedback, and budgets.',
  },
  {
    title: 'Video Editor',
    description: 'As a Video Editor, you are the final architect of our narrative, responsible for turning raw assets and AI-generated content into high-impact visual stories. You have a rhythmic soul and a sharp eye for pacing, knowing exactly when to let a moment breathe and when to cut for maximum retention. You aren\'t afraid to break traditional post-production workflows, seamlessly blending classic editing techniques with AI-driven enhancements to define the "Viralin" aesthetic. Whether it\'s a 15-second viral hook or a cinematic brand piece, you\'ll ensure every frame is polished, purposeful, and impossible to scroll past.',
  },
  {
    title: 'Visual & Motion Designer',
    description: 'As a Motion Designer, you\'ll support the Google Doodles team, combining contemporary design aesthetics with technical expertise in motion, 3D, and traditional animation. You\'ll leverage a diverse toolkit to solve animation challenges across a broad spectrum of visual styles and illustration techniques, and you\'ll be comfortable experimenting with AI technology to support your process. Your projects will span independent contributions, such as GIF animations for Doodles, to collaborations with a larger team on short-form videos. You will approach projects conceptually and demonstrate the versatility to develop original artwork, animate within existing creative assets, and execute designs that cohere with established systems.',
  },
  {
    title: 'AI Engineer',
    description: 'As an AI Engineer, you\'ll be the architect behind our creative engine, bridging the gap between cutting-edge research and real-world production. You aren\'t just "running scripts"; you\'re building the infrastructure that empowers creators to do the impossible. Whether you\'re fine-tuning diffusion models, optimizing inference pipelines, or hacking together custom nodes for a new workflow, you thrive on the frontier of what\'s next. You\'ll bring a mix of technical rigor and a "hacker" mindset, with a deep desire to turn complex algorithms into seamless, magical experiences for our creative team.',
  },
  {
    title: 'Social Creative',
    description: 'As a Social Creative for Google Cloud Brand & Creative, you will concept social-first executions, as well as social extensions to larger brand campaigns. You\'ll live and breathe all aspects of social media, staying aware of current trends and conversations, with the ability to translate those trends into creative advertising in the B2B space. Whether your background is in copywriting, art direction, or filmmaking, you\'ll be able to utilize your obsession with social media, plus a thirst to learn more about our B2B audience.',
  },
  {
    title: 'Video Storyteller (AI Focus)',
    description: 'As a Video Storyteller, you\'ll become a mini film director, eager to get your hands dirty with creative maker. You\'ll bring brand stories, character, or news to life by blending strong narratives with AI tools, handling everything from the first prompt to the final master. Whether you\'re a filmmaker, editor, or motion pro, you\'ll be a visual artist who uses AI to create original work, not just edit. You\'ll embrace the experimentation of generating and posting peeking under the hood to bring fresh ideas to life across the brand\'s social media, from social campaigns to big brand moments.',
  },
];

const PositionCard: React.FC<{ position: Position }> = ({ position }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "border border-border/40 rounded-2xl overflow-hidden transition-all duration-300",
        "bg-card/50 backdrop-blur-sm hover:border-primary/40",
        isOpen && "border-primary/50 shadow-lg shadow-primary/5"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
      >
        <span className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {position.title}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-4",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
          <div className="h-px bg-border/40 mb-4" />
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {position.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Join Our Team
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us shape the future of AI-powered content creation.
          </p>
        </div>

        {/* Employment Type Cards */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full-Time Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center justify-center p-10 md:p-14 rounded-3xl bg-card/80 border border-border/40 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Full-Time</h2>
                <p className="text-muted-foreground mt-2 text-sm">Permanent positions</p>
              </div>
            </div>

            {/* Paid Interns Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/50 rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center justify-center p-10 md:p-14 rounded-3xl bg-card/80 border border-border/40 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Paid Interns</h2>
                <p className="text-muted-foreground mt-2 text-sm">Internship programs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Open Positions
          </h2>
          <div className="space-y-3">
            {positions.map((position) => (
              <PositionCard key={position.title} position={position} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
