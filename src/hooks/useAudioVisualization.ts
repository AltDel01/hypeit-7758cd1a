
import { useRef, useState, useEffect } from 'react';

export const useAudioVisualization = (isActive: boolean, onClose: () => void) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startMicrophone = async () => {
    console.log("Starting microphone...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("Microphone stream acquired successfully");

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      // Increase FFT size for more detailed visualization
      analyser.fftSize = 1024;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
      
      setIsListening(true);
      console.log("Audio visualization setup complete");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onClose();
    }
  };

  const stopMicrophone = () => {
    console.log("Stopping microphone...");
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
    console.log("Microphone stopped and resources cleaned up");
  };

  useEffect(() => {
    console.log("useAudioVisualization effect - isActive changed to:", isActive);
    if (isActive && !isListening) {
      startMicrophone();
    } else if (!isActive && isListening) {
      stopMicrophone();
    }
    
    return () => {
      if (isListening) {
        stopMicrophone();
      }
    };
  }, [isActive, isListening]);

  return {
    isListening,
    analyser: analyserRef.current,
    dataArray: dataArrayRef.current
  };
};
