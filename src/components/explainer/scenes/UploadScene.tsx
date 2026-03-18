import React, { useEffect, useState } from 'react';
import { Upload, Film } from 'lucide-react';

interface UploadSceneProps {
  active: boolean;
}

const UploadScene: React.FC<UploadSceneProps> = ({ active }) => {
  const [showZone, setShowZone] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const fullName = 'product_launch_raw.mp4';

  useEffect(() => {
    if (!active) {
      setShowZone(false);
      setShowIcon(false);
      setFileName('');
      setShowProgress(false);
      setProgress(0);
      return;
    }

    const t1 = setTimeout(() => setShowZone(true), 200);
    const t2 = setTimeout(() => setShowIcon(true), 700);

    // Typewriter for filename
    let charIndex = 0;
    const t3 = setTimeout(() => {
      const interval = setInterval(() => {
        charIndex++;
        setFileName(fullName.slice(0, charIndex));
        if (charIndex >= fullName.length) {
          clearInterval(interval);
          setShowProgress(true);
          // Animate progress
          let p = 0;
          const pInterval = setInterval(() => {
            p += 3;
            setProgress(Math.min(p, 100));
            if (p >= 100) clearInterval(pInterval);
          }, 40);
        }
      }, 60);
      return () => clearInterval(interval);
    }, 1200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <p className={`text-sm uppercase tracking-widest text-muted-foreground mb-8 transition-all duration-500 ${showZone ? 'opacity-100' : 'opacity-0'}`}>
        Step 1 — Upload Your Video
      </p>

      {/* Upload zone */}
      <div className={`relative w-80 md:w-96 h-56 rounded-2xl border-2 border-dashed border-border bg-card/50 backdrop-blur flex flex-col items-center justify-center transition-all duration-700 ${showZone ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        {/* Falling icon */}
        <div className={`transition-all duration-500 ${showIcon ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'}`}>
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
            <Film className="w-8 h-8 text-primary" />
          </div>
        </div>

        {!fileName && (
          <div className={`flex flex-col items-center transition-all duration-500 ${showZone ? 'opacity-60' : 'opacity-0'}`}>
            <Upload className="w-5 h-5 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Drop your video here</span>
          </div>
        )}

        {fileName && (
          <div className="flex flex-col items-center gap-3 w-full px-8">
            <span className="text-sm text-foreground font-mono">
              {fileName}<span className="animate-pulse">|</span>
            </span>

            {showProgress && (
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(262, 100%, 66%))',
                  }}
                />
              </div>
            )}

            {progress >= 100 && (
              <span className="text-xs text-green-400 animate-fade-in">✓ Uploaded</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadScene;
