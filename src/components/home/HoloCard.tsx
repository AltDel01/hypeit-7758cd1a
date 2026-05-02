import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'lg' | 'md';
  tint?: 'violet' | 'cyan' | 'pink' | 'amber';
  onClick?: () => void;
  disabled?: boolean;
}

const tintMap = {
  violet: { a: '#a855f7', b: '#22d3ee', c: '#f0abfc' },
  cyan: { a: '#22d3ee', b: '#a855f7', c: '#67e8f9' },
  pink: { a: '#f472b6', b: '#fbbf24', c: '#fb7185' },
  amber: { a: '#fbbf24', b: '#fb7185', c: '#fde68a' },
};

/**
 * Pokemon-style hologram card with:
 *  - Animated rotating conic-gradient border
 *  - Cursor-tracked radial foil overlay
 *  - 3D tilt on hover (capped at +/- 10deg)
 *  - Sheen sweep
 */
const HoloCard: React.FC<HoloCardProps> = ({
  children,
  className,
  size = 'md',
  tint = 'violet',
  onClick,
  disabled,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const colors = tintMap[tint];

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 14; // tilt
    const ry = (px - 0.5) * 14;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', `0deg`);
    el.style.setProperty('--ry', `0deg`);
    setHovered(false);
  }, []);

  const sizeClass = size === 'lg' ? 'w-[280px] h-[380px] md:w-[320px] md:h-[440px]' : 'w-[180px] h-[240px] md:w-[210px] md:h-[280px]';

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'holo-card group relative rounded-2xl select-none',
        sizeClass,
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className
      )}
      style={{
        // CSS vars consumed by ::before / ::after via the holo-card class
        ['--c1' as any]: colors.a,
        ['--c2' as any]: colors.b,
        ['--c3' as any]: colors.c,
        transform: 'perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))',
        transition: 'transform 220ms ease-out',
      }}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Inner content surface */}
      <div className="holo-inner relative z-10 w-full h-full rounded-2xl overflow-hidden bg-[#0b0612]/90 backdrop-blur-sm">
        {/* Foil overlay */}
        <div className="holo-foil pointer-events-none absolute inset-0" />
        {/* Prismatic noise */}
        <div className="holo-prism pointer-events-none absolute inset-0 mix-blend-color-dodge opacity-60" />
        {/* Sheen sweep */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-300',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="holo-sheen absolute inset-y-0 -inset-x-1/2" />
        </div>
        {/* Content */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-5 text-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HoloCard;
