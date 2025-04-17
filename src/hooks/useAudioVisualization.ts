import { useRef, useState, useEffect } from 'react';
import { toast } from "sonner";

export const useAudioVisualization = (isActive: boolean, onClose: () => void) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
      
      setIsListening(true);
      // Removed toast.success("Microphone activated");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // Removed toast.error
      onClose();
    }
  };

  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsListening(false);
    sourceRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  useEffect(() => {
    if (isActive && !isListening) {
      startMicrophone();
    } else if (!isActive && isListening) {
      stopMicrophone();
    }
    
    return () => {
      stopMicrophone();
    };
  }, [isActive]);

  return {
    isListening,
    analyser: analyserRef.current,
    dataArray: dataArrayRef.current
  };
};
