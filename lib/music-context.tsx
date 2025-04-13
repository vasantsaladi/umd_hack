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
  initializeAudio: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Higher default volume
  const [wasPlayingBeforePause, setWasPlayingBeforePause] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitializedRef = useRef(false);
  const autoPlayAttemptedRef = useRef(false);

  // Try to auto-start immediately when mounted - this happens on page load
  useEffect(() => {
    // Create the audio element immediately
    if (!audioRef.current) {
      const audio = new Audio("/careless-whisper.mp3");
      audioRef.current = audio;
      audio.loop = true;
      audio.volume = volume;
      audio.preload = "auto";

      // Add event listeners for more robust looping
      audio.addEventListener("canplaythrough", () => {
        if (!autoPlayAttemptedRef.current) {
          autoPlayAttemptedRef.current = true;
          // Try to autoplay
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsInitialized(true);
              hasInitializedRef.current = true;
            })
            .catch((err) => {
              console.log(
                "Autoplay prevented by browser, waiting for interaction"
              );
            });
        }
      });

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

      // Load the audio
      audio.load();
    }

    // Handle cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [volume, isPlaying]);

  // Initialize audio but don't autoplay immediately
  const initializeAudio = () => {
    // If already initialized or no audio ref, do nothing
    if (hasInitializedRef.current || !audioRef.current) return;
    hasInitializedRef.current = true;

    try {
      const audio = audioRef.current;

      // Try to play the audio
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsInitialized(true);
        })
        .catch((error) => {
          console.error("Audio playback prevented by browser:", error);
          // We'll try again on user interaction
        });
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  };

  // Make sure we handle user interaction to play audio
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!isPlaying && audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsInitialized(true);
            hasInitializedRef.current = true;
          })
          .catch((err) => console.error("Play failed after interaction:", err));
      }

      // Remove event listeners after successful play
      if (isPlaying) {
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("touchstart", handleUserInteraction);
        document.removeEventListener("keydown", handleUserInteraction);
      }
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
  }, [isPlaying]);

  // Handle play/pause based on isPlaying state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Add slight delay for better UX
      const playPromise = audioRef.current.play();

      // Handle promise to avoid browser warnings
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback prevented by browser:", error);
          // Auto-retry once after user interaction
          const retryPlay = () => {
            if (audioRef.current) {
              audioRef.current
                .play()
                .then(() => {
                  setIsInitialized(true);
                })
                .catch((e) => console.error("Retry play failed:", e));
            }
            document.removeEventListener("click", retryPlay);
          };
          document.addEventListener("click", retryPlay, { once: true });
        });
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggle = () => {
    if (!hasInitializedRef.current && audioRef.current) {
      // Initialize and play
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsInitialized(true);
          hasInitializedRef.current = true;
        })
        .catch((error) => {
          console.error("Play failed on toggle:", error);
        });
    } else {
      setIsPlaying((prev) => !prev);
    }
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
