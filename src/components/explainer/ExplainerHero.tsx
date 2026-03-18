import React, { useEffect, useState, useCallback } from 'react';
import IntroScene from './scenes/IntroScene';
import UploadScene from './scenes/UploadScene';
import ChatPromptScene from './scenes/ChatPromptScene';
import ResultScene from './scenes/ResultScene';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SCENE_DURATIONS = [4000, 5500, 7000, 6000]; // ms per scene
const TOTAL_SCENES = 4;

const ExplainerHero: React.FC = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const navigate = useNavigate();

  const advanceScene = useCallback(() => {
    setCurrentScene(prev => (prev + 1) % TOTAL_SCENES);
  }, []);

  useEffect(() => {
    const timer = setTimeout(advanceScene, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene, advanceScene]);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsla(262, 50%, 20%, 0.4) 0%, transparent 60%)',
        }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Scene indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentScene(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentScene ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
          />
        ))}
      </div>

      {/* Scenes */}
      <IntroScene active={currentScene === 0} />
      <UploadScene active={currentScene === 1} />
      <ChatPromptScene active={currentScene === 2} />
      <ResultScene active={currentScene === 3} />
    </div>
  );
};

export default ExplainerHero;
