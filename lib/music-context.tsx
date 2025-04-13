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
  initializeAudio: () => Promise<boolean>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [wasPlayingBeforePause, setWasPlayingBeforePause] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitializedRef = useRef(false);
  const userInteractionRef = useRef(false);

  // Create audio element only once
  useEffect(() => {
    if (!audioRef.current) {
      console.log("Creating audio element with careless-whisper.mp3");
      try {
        const audioElement = new Audio("/careless-whisper.mp3");
        audioElement.loop = true;
        audioElement.volume = volume;
        audioElement.preload = "auto";
        audioRef.current = audioElement;

        // Add error handling
        audioElement.addEventListener("error", (e) => {
          console.error("Audio error event:", e);
          // Don't recreate here - just log the error
        });

        // Handle ended more simply
        audioElement.addEventListener("ended", () => {
          if (isPlaying && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((e) => console.error("Loop play failed:", e));
          }
        });
      } catch (error) {
        console.error("Error creating audio element:", error);
      }
    }

    // No return cleanup function here - we want to keep the audio element
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Listen for user interaction - this is critical for iOS/Safari
  useEffect(() => {
    const handleUserInteraction = () => {
      userInteractionRef.current = true;
      // Don't auto-play on interaction, just mark that interaction happened
    };

    // Add event listeners to capture user interactions
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  // Handle play/pause based on isPlaying state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      console.log("Attempting to play audio");
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback prevented:", error);
          setIsPlaying(false); // Reset state if play fails
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const toggle = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        // Try to play
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsInitialized(true);
            hasInitializedRef.current = true;
          })
          .catch((error) => {
            console.error("Toggle play failed:", error);
            setIsPlaying(false);
          });
      } else {
        // Just pause
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Pause music during speech or simulation
  const pauseDuringAction = () => {
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

  // Initialize audio but don't force autoplay
  const initializeAudio = async (): Promise<boolean> => {
    // If already initialized and playing, just return success
    if (isInitialized && isPlaying) return true;
    hasInitializedRef.current = true;

    // If no audio ref, initialization failed
    if (!audioRef.current) return false;

    try {
      // Just prepare the audio but don't autoplay
      setIsInitialized(true);
      return userInteractionRef.current; // Return whether user has interacted
    } catch (error) {
      console.error("Error initializing audio:", error);
      return false;
    }
  };

  const value = {
    isPlaying,
    toggle,
    volume,
    setVolume,
    pauseDuringAction,
    resumeAfterAction,
    initializeAudio,
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
