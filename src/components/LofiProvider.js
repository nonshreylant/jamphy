"use client";
import { createContext, useContext, useState, useRef, useEffect } from "react";

// Just a single track now
const LOFI_TRACK_SRC = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3";

const LofiContext = createContext();

export function LofiProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle Play/Pause toggle
  useEffect(() => {
    if (!audioRef.current || !isClient) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.log("Audio play failed:", e);
        setIsPlaying(false); // Reset to paused if browser blocks it
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isClient]);

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const seek = (percent) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  return (
    <LofiContext.Provider value={{ isPlaying, togglePlay, progress, seek }}>
      {children}
      {isClient && (
        <audio 
          ref={audioRef} 
          src={LOFI_TRACK_SRC} 
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          loop
        />
      )}
    </LofiContext.Provider>
  );
}

export function useLofi() {
  return useContext(LofiContext);
}
