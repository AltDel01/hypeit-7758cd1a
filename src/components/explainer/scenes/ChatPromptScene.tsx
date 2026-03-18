import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ChatPromptSceneProps {
  active: boolean;
}

const ChatPromptScene: React.FC<ChatPromptSceneProps> = ({ active }) => {
  const [typedText, setTypedText] = useState('');
  const [showPills, setShowPills] = useState(false);
  const [visiblePills, setVisiblePills] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const fullPrompt = 'Add captions, B-roll, and transitions. Make it 1080p 15 seconds.';
  const pills = ['Captions', 'B-Roll', 'Transitions', '1080p', '15s'];

  useEffect(() => {
    if (!active) {
      setTypedText('');
      setShowPills(false);
      setVisiblePills(0);
      setShowSpinner(false);
      setShowChat(false);
      return;
    }

    const t0 = setTimeout(() => setShowChat(true), 200);

    let charIndex = 0;
    const t1 = setTimeout(() => {
      const interval = setInterval(() => {
        charIndex++;
        setTypedText(fullPrompt.slice(0, charIndex));
        if (charIndex >= fullPrompt.length) {
          clearInterval(interval);
          // Show pills after typing
          setTimeout(() => {
            setShowPills(true);
            let pillIdx = 0;
            const pillInterval = setInterval(() => {
              pillIdx++;
              setVisiblePills(pillIdx);
              if (pillIdx >= pills.length) {
                clearInterval(pillInterval);
                setTimeout(() => setShowSpinner(true), 400);
              }
            }, 200);
          }, 400);
        }
      }, 35);
      return () => clearInterval(interval);
    }, 600);

    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, [active]);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <p className={`text-sm uppercase tracking-widest text-muted-foreground mb-8 transition-all duration-500 ${showChat ? 'opacity-100' : 'opacity-0'}`}>
        Step 2 — Tell AI What You Want
      </p>

      {/* Chat container */}
      <div className={`w-[340px] md:w-[480px] rounded-2xl border border-border bg-card/80 backdrop-blur overflow-hidden transition-all duration-700 ${showChat ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        {/* Chat header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-muted-foreground">Viralin AI — Online</span>
        </div>

        {/* Messages */}
        <div className="p-4 min-h-[180px] flex flex-col gap-3">
          {/* AI greeting */}
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-foreground max-w-[80%]">
              Video uploaded! How should I edit it?
            </div>
          </div>

          {/* User message typing */}
          {typedText && (
            <div className="flex justify-end">
              <div className="bg-primary/20 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-foreground max-w-[80%]">
                {typedText}
                {typedText.length < fullPrompt.length && <span className="animate-pulse">|</span>}
              </div>
            </div>
          )}

          {/* Feature pills */}
          {showPills && (
            <div className="flex flex-wrap gap-2 mt-1">
              {pills.map((pill, i) => (
                <span
                  key={pill}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all duration-300 ${i < visiblePills
                    ? 'opacity-100 scale-100 border-primary/40 bg-primary/10 text-primary'
                    : 'opacity-0 scale-75 border-transparent'
                  }`}
                >
                  {pill}
                </span>
              ))}
            </div>
          )}

          {/* Processing */}
          {showSpinner && (
            <div className="flex gap-2 items-center animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: '2s' }} />
              </div>
              <span className="text-sm text-muted-foreground">Processing your video...</span>
              <div className="flex gap-1 ml-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPromptScene;
