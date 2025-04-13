"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  ReactNode,
} from "react";

interface MusicContextType {
  isPlaying: boolean;
  toggle: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  pauseDuringAction: () => void;
  resumeAfterAction: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [wasPlayingBeforePause, setWasPlayingBeforePause] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio on client-side only
  useEffect(() => {
    // Only create the audio element once
    if (!isInitialized) {
      const audio = new Audio("/careless-whisper.mp3");
      audioRef.current = audio;

      // Explicitly set loop to true
      audio.loop = true;
      audio.volume = volume;

      // Add event listeners for more robust looping
      audio.addEventListener("ended", () => {
        // Even though loop is true, manually restart playback as a fallback
        if (isPlaying) {
          audio.currentTime = 0;
          audio
            .play()
            .catch((err) => console.error("Loop playback error:", err));
        }
      });

      // Add error recovery
      audio.addEventListener("error", () => {
        console.error("Audio playback error, attempting recovery");
        // Try to recreate and replay after error
        setTimeout(() => {
          if (isPlaying) {
            const newAudio = new Audio("/careless-whisper.mp3");
            newAudio.loop = true;
            newAudio.volume = volume;
            audioRef.current = newAudio;
            newAudio.play().catch((e) => console.error("Recovery failed:", e));
          }
        }, 1000);
      });

      setIsInitialized(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isInitialized, volume, isPlaying]);

  // Handle play/pause based on isPlaying state
  useEffect(() => {
    if (!audioRef.current || !isInitialized) return;

    if (isPlaying) {
      // Add slight delay for better UX
      const playPromise = audioRef.current.play();

      // Handle promise to avoid browser warnings
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback prevented by browser:", error);
          // Auto-retry once after user interaction
          const retryPlay = () => {
            audioRef.current
              ?.play()
              .catch((e) => console.error("Retry play failed:", e));
            document.removeEventListener("click", retryPlay);
          };
          document.addEventListener("click", retryPlay, { once: true });
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isInitialized]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggle = () => {
    setIsPlaying((prev) => !prev);
  };

  // Pause music during speech or simulation
  const pauseDuringAction = () => {
    // Remember if music was playing before we paused it
    if (isPlaying) {
      setWasPlayingBeforePause(true);
      setIsPlaying(false);
    }
  };

  // Resume music after speech or simulation if it was playing before
  const resumeAfterAction = () => {
    if (wasPlayingBeforePause) {
      setIsPlaying(true);
      setWasPlayingBeforePause(false);
    }
  };

  const value = {
    isPlaying,
    toggle,
    volume,
    setVolume,
    pauseDuringAction,
    resumeAfterAction,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
