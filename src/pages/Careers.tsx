import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Briefcase, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Position {
  title: string;
  description: string;
}

const folderGroup1: Position[] = [
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
];

const folderGroup2: Position[] = [
  {
    title: 'AI Engineer',
    description: 'As an AI Engineer, you\'ll be the architect behind our creative engine, bridging the gap between cutting-edge research and real-world production. You aren\'t just "running scripts"; you\'re building the infrastructure that empowers creators to do the impossible. Whether you\'re fine-tuning diffusion models, optimizing inference pipelines, or hacking together custom nodes for a new workflow, you thrive on the frontier of what\'s next. You\'ll bring a mix of technical rigor and a "hacker" mindset, with a deep desire to turn complex algorithms into seamless, magical experiences for our creative team.',
  },
  {
    title: 'Social Creative',
    description: 'As a Social Creative, you will concept social-first executions, as well as social extensions to larger brand campaigns. You\'ll live and breathe all aspects of social media, staying aware of current trends and conversations, with the ability to translate those trends into creative advertising in the B2B space. Whether your background is in copywriting, art direction, or filmmaking, you\'ll be able to utilize your obsession with social media, plus a thirst to learn more about our B2B audience.',
  },
  {
    title: 'Video Storyteller (AI Focus)',
    description: 'As a Video Storyteller, you\'ll become a mini film director, eager to get your hands dirty with creative maker. You\'ll bring brand stories, character, or news to life by blending strong narratives with AI tools, handling everything from the first prompt to the final master. Whether you\'re a filmmaker, editor, or motion pro, you\'ll be a visual artist who uses AI to create original work, not just edit. You\'ll embrace the experimentation of generating and posting peeking under the hood to bring fresh ideas to life across the brand\'s social media, from social campaigns to big brand moments.',
  },
];

const FolderCard: React.FC<{ positions: Position[] }> = ({ positions }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      {/* Folder Tabs */}
      <div className="flex">
        {positions.map((pos, i) => (
          <button
            key={pos.title}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "flex-1 px-3 py-3 md:py-4 text-xs md:text-sm font-semibold text-center transition-all duration-200 border border-b-0 relative",
              "rounded-t-xl",
              i === activeIndex
                ? "bg-primary text-primary-foreground border-primary z-10"
                : "bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted"
            )}
            style={{
              marginRight: i < positions.length - 1 ? '-1px' : '0',
            }}
          >
            {pos.title}
          </button>
        ))}
      </div>

      {/* Folder Body */}
      <div className="border border-border/40 rounded-b-2xl rounded-tr-none bg-card/80 backdrop-blur-sm p-6 md:p-8 min-h-[220px]">
        <div className="mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {positions[activeIndex].description}
        </p>
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

        {/* Open Positions - Folder Style */}
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Open Positions
          </h2>
          <div className="space-y-10">
            <FolderCard positions={folderGroup1} />
            <FolderCard positions={folderGroup2} />
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
          <p className="text-lg md:text-xl font-semibold text-foreground mb-8">
            Take Creative or Logical Interactive Test
          </p>
          <a
            href="#"
            className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-primary-foreground rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105"
          >
            {/* Animated metallic purple border */}
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-[hsl(270,80%,70%)] to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
            <span className="absolute inset-[3px] rounded-[13px] bg-primary" />
            <span className="relative z-10">Try Now</span>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
