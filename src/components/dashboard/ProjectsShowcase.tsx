import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
}

const projects: Project[] = [
  { id: '1', title: 'Velobank', category: 'Technology', videoUrl: '/projects/Velobank.mp4' },
  { id: '2', title: 'Gemini', category: 'Technology', videoUrl: '/projects/Gemini.mp4' },
  { id: '3', title: 'ChatGPT', category: 'Technology', videoUrl: '/projects/ChatGPT.mp4' },
  { id: '4', title: 'Cursor', category: 'Technology', videoUrl: '/projects/Cursor.mp4' },
  { id: '5', title: 'Hylix', category: 'Technology', videoUrl: '/projects/Hylix.mp4' },
  { id: '6', title: 'Zoro', category: 'Technology', videoUrl: '/projects/Zoro.mp4' },
  { id: '7', title: 'Glass Health', category: 'Technology', videoUrl: '/projects/Glass_Health.mp4' },
  { id: '8', title: 'Gemini 3', category: 'Technology', videoUrl: '/projects/Gemini_3.mp4' },
  { id: '9', title: 'Dub', category: 'Technology', videoUrl: '/projects/Dub.mp4' },
  { id: '10', title: 'Coinborn', category: 'Technology', videoUrl: '/projects/Coinborn.mp4' },
  { id: '11', title: 'Seger', category: 'Retail', videoUrl: '/projects/Seger.mp4' },
  { id: '12', title: 'Skingame', category: 'Retail', videoUrl: '/projects/Skingame.mp4' },
  { id: '13', title: 'Heaven Lights', category: 'Retail', videoUrl: '/projects/Heaven_Lights.mp4' },
  { id: '14', title: 'Millie Sambel', category: 'Retail', videoUrl: '/projects/Millie_Sambel.mp4' },
  { id: '15', title: 'Coconico', category: 'Retail', videoUrl: '/projects/Coconico.mp4' },
  { id: '16', title: 'Dear Me Beauty', category: 'Retail', videoUrl: '/projects/Dear_Me_Beauty.mp4' },
  { id: '17', title: 'ZAM2JK', category: 'Retail', videoUrl: '/projects/ZAM2JK.mp4' },
  { id: '18', title: 'Let People Understand Your Product', category: 'Text', videoUrl: '/projects/Let_People_Understand_Your_Product.mp4' },
  { id: '19', title: 'Ready To Grow', category: 'Text', videoUrl: '/projects/Ready_To_Grow.mp4' },
];

const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

const VideoCard: React.FC<{ project: Project }> = ({ project }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Prevent right-click context menu on video
  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (videoRef.current && isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }}
      onContextMenu={preventContextMenu}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-black/40">
        <video
          ref={videoRef}
          src={project.videoUrl}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onContextMenu={preventContextMenu}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        />

        {/* Overlay gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {/* Play button center */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
              <Play className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground ml-0.5" fill="currentColor" />
            </div>
          </button>
        )}

        {/* Controls overlay */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-white" fill="currentColor" />
              ) : (
                <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
          <button
            onClick={handleFullscreen}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-foreground text-sm md:text-base truncate">{project.title}</h3>
        <span className="inline-block mt-1.5 text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {project.category}
        </span>
      </div>
    </div>
  );
};

const ProjectsShowcase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="mt-16 md:mt-24 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Folder className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Projects</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Showcase of AI-generated content</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 border",
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "bg-card/60 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {filtered.map(project => (
          <VideoCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsShowcase;
