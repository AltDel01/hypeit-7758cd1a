import React, { useEffect, useState, useRef } from 'react';
import { Play, Heart, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultSceneProps {
  active: boolean;
}

const ResultScene: React.FC<ResultSceneProps> = ({ active }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setShowPlayer(false);
      setShowStats(false);
      setViews(0);
      setLikes(0);
      setShowCTA(false);
      setShowSocials(false);
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const t1 = setTimeout(() => setShowPlayer(true), 300);
    const t2 = setTimeout(() => {
      setShowStats(true);
      // Animate counters
      const targetViews = 12400;
      const targetLikes = 843;
      const duration = 1500;
      const start = performance.now();

      const animate = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setViews(Math.round(targetViews * ease));
        setLikes(Math.round(targetLikes * ease));
        if (t < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }, 1000);
    const t3 = setTimeout(() => setShowSocials(true), 1800);
    const t4 = setTimeout(() => setShowCTA(true), 2200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); cancelAnimationFrame(rafRef.current); };
  }, [active]);

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  const socials = ['Instagram', 'TikTok', 'YouTube', 'X'];

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <p className={`text-sm uppercase tracking-widest text-muted-foreground mb-8 transition-all duration-500 ${showPlayer ? 'opacity-100' : 'opacity-0'}`}>
        Result — Ready to Go Viral
      </p>

      {/* Mock video player */}
      <div className={`relative w-80 md:w-[420px] aspect-video rounded-2xl overflow-hidden border border-border transition-all duration-700 ${showPlayer ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(262, 30%, 15%) 100%)',
        }}
      >
        {/* Fake video content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur border border-primary/30">
            <Play className="w-7 h-7 text-primary ml-1" />
          </div>
        </div>

        {/* Timeline bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
            <div className="h-full w-2/3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(262, 100%, 66%))' }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
            <span>0:10</span>
            <span>0:15</span>
          </div>
        </div>

        {/* Caption overlay */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-lg transition-all duration-500 delay-300 ${showPlayer ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs text-white font-medium">AI-generated captions ✨</span>
        </div>
      </div>

      {/* Stats */}
      <div className={`flex gap-6 mt-6 transition-all duration-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium text-foreground">{formatNum(views)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-foreground">{formatNum(likes)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Share</span>
        </div>
      </div>

      {/* Social pills */}
      <div className={`flex gap-2 mt-4 transition-all duration-500 ${showSocials ? 'opacity-100' : 'opacity-0'}`}>
        {socials.map((s, i) => (
          <span key={s} className="px-3 py-1 text-xs rounded-full border border-border bg-card/50 text-muted-foreground transition-all duration-300"
            style={{ transitionDelay: `${i * 100}ms`, opacity: showSocials ? 1 : 0, transform: showSocials ? 'scale(1)' : 'scale(0.8)' }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className={`mt-8 transition-all duration-500 ${showCTA ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <Button variant="newPurple" size="lg" className="animate-pulse" style={{ animationDuration: '2s' }}
          onClick={() => window.location.href = '/signup'}
        >
          Start Creating for Free
        </Button>
      </div>
    </div>
  );
};

export default ResultScene;
