import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Video as VideoIcon, Wand2, Pencil, Sparkles } from 'lucide-react';
import HoloCard from './HoloCard';
import { cn } from '@/lib/utils';

type PrimaryKind = 'image' | 'video' | null;

const PokemonChooserHero: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<PrimaryKind>(null);

  const goTo = (mode: string) => {
    try {
      localStorage.setItem('dashboard_mode', mode);
    } catch {}
    navigate(`/dashboard?mode=${mode}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-black pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-[420px] w-[420px] rounded-full bg-[#8C52FF]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-cyan-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-[#c4a8ff]" />
          Viralin AI
        </div>
        <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-6xl">
          Create What <span className="bg-gradient-to-r from-[#c4a8ff] via-[#8C52FF] to-[#22d3ee] bg-clip-text text-transparent">Goes Viral</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/60 md:text-lg">
          Pick what you want to make. We will handle the rest.
        </p>

        {/* Cards row */}
        <div
          className="mt-14 flex flex-col items-stretch justify-center gap-12 md:flex-row md:gap-16"
          onMouseLeave={() => setActive(null)}
        >
          {/* IMAGE column */}
          <CardColumn
            primary={
              <HoloCard
                size="lg"
                tint="violet"
                onClick={() => goTo('image-gen')}
                className="mx-auto"
              >
                <div onMouseEnter={() => setActive('image')}>
                  <ImageIcon className="mx-auto h-14 w-14 text-[#e9dcff]" strokeWidth={1.5} />
                  <div className="mt-4 text-2xl font-bold tracking-wide text-white">IMAGE</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
                    Generate or Edit
                  </div>
                  <div className="mt-6 text-[11px] uppercase tracking-widest text-[#c4a8ff]/80">
                    Hover to choose
                  </div>
                </div>
              </HoloCard>
            }
            expanded={active === 'image'}
            onActivate={() => setActive('image')}
            children1={
              <HoloCard size="lg" tint="violet" onClick={() => goTo('image-gen')}>
                <Wand2 className="h-12 w-12 text-[#e9dcff]" strokeWidth={1.5} />
                <div className="mt-4 text-xl font-bold text-white">Image Generation</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
                  Text to Image
                </div>
              </HoloCard>
            }
            children2={
              <HoloCard size="lg" tint="pink" onClick={() => goTo('image-edit')}>
                <Pencil className="h-12 w-12 text-[#ffd9ec]" strokeWidth={1.5} />
                <div className="mt-4 text-xl font-bold text-white">Image Editing</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
                  Instruction or Decompose
                </div>
              </HoloCard>
            }
          />

          {/* VIDEO column */}
          <CardColumn
            primary={
              <HoloCard
                size="lg"
                tint="cyan"
                onClick={() => goTo('video-t2v')}
                className="mx-auto"
              >
                <div onMouseEnter={() => setActive('video')}>
                  <VideoIcon className="mx-auto h-14 w-14 text-[#cffafe]" strokeWidth={1.5} />
                  <div className="mt-4 text-2xl font-bold tracking-wide text-white">VIDEO</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
                    Generate or Edit
                  </div>
                  <div className="mt-6 text-[11px] uppercase tracking-widest text-cyan-200/80">
                    Hover to choose
                  </div>
                </div>
              </HoloCard>
            }
            expanded={active === 'video'}
            onActivate={() => setActive('video')}
            children1={
              <HoloCard size="lg" tint="cyan" onClick={() => goTo('video-t2v')}>
                <Wand2 className="h-12 w-12 text-[#cffafe]" strokeWidth={1.5} />
                <div className="mt-4 text-xl font-bold text-white">Video Generation</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
                  T2V, I2V, R2V, Face Swap
                </div>
              </HoloCard>
            }
            children2={
              <HoloCard size="lg" tint="amber" onClick={() => goTo('video-edit')}>
                <Pencil className="h-12 w-12 text-amber-200" strokeWidth={1.5} />
                <div className="mt-4 text-xl font-bold text-white">Video Editing</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
                  Manual editor crafted
                </div>
              </HoloCard>
            }
          />
        </div>

        <p className="mt-10 text-xs text-white/40">
          {" "}
        </p>
      </div>
    </section>
  );
};

interface CardColumnProps {
  primary: React.ReactNode;
  expanded: boolean;
  onActivate: () => void;
  children1: React.ReactNode;
  children2: React.ReactNode;
}

const CardColumn: React.FC<CardColumnProps> = ({ primary, expanded, onActivate, children1, children2 }) => {
  return (
    <div className="relative flex flex-col items-center" onMouseEnter={onActivate}>
      <div
        className={cn(
          'transition-all duration-500',
          expanded ? 'opacity-0 scale-95 -translate-y-4 pointer-events-none absolute inset-x-0' : 'opacity-100 scale-100'
        )}
      >
        {primary}
      </div>
      <div
        className={cn(
          'flex flex-col gap-4 sm:flex-row sm:gap-5 transition-all duration-500',
          expanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none absolute'
        )}
      >
        <div className={cn('transition-all duration-500', expanded ? 'translate-x-0' : 'translate-x-6')}>
          {children1}
        </div>
        <div className={cn('transition-all duration-500 delay-75', expanded ? 'translate-x-0' : '-translate-x-6')}>
          {children2}
        </div>
      </div>
    </div>
  );
};

export default PokemonChooserHero;
