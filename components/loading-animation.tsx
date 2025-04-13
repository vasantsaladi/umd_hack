"use client";

import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartIcon, Music, VolumeX, Volume2 } from "lucide-react";
import { useMusic } from "@/lib/music-context";
import { Button } from "./ui/button";

interface LoadingAnimationProps {
  onComplete?: () => void;
}

export const LoadingAnimation: FC<LoadingAnimationProps> = ({ onComplete }) => {
  const { isPlaying, toggle, initializeAudio } = useMusic();
  const [loadingStep, setLoadingStep] = useState(0);
  const [allowContinue, setAllowContinue] = useState(false);

  // Initialize music but don't block on it
  useEffect(() => {
    initializeAudio();

    // Always proceed after short delay regardless of music state
    const timer = setTimeout(() => {
      setAllowContinue(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [initializeAudio]);

  // Loading steps animation
  useEffect(() => {
    const stepTimers = [
      setTimeout(() => setLoadingStep(1), 1500),
      setTimeout(() => setLoadingStep(2), 3000),
      // Allow transition to complete page after a reasonable time
      // regardless of music playing state
      setTimeout(() => {
        if (onComplete && allowContinue) {
          onComplete();
        }
      }, 4000),
    ];

    return () => stepTimers.forEach((timer) => clearTimeout(timer));
  }, [onComplete, allowContinue]);

  // Just in case everything else fails, this is our backup
  useEffect(() => {
    // Force completion after max wait time
    const maxWaitTimer = setTimeout(() => {
      if (onComplete) {
        console.log("Forcing completion after maximum wait time");
        onComplete();
      }
    }, 8000); // Hard timeout of 8 seconds max

    return () => clearTimeout(maxWaitTimer);
  }, [onComplete]);

  // Don't return null - always show loading screen until complete callback is called
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-xs mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            >
              <HeartIcon size={60} className="text-pink-500" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-pink-500 rounded-full blur-xl opacity-30"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mt-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
          >
            Rizz Lab
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="flex gap-2 mb-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-pink-500"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm">
              {loadingStep === 0
                ? "Loading..."
                : loadingStep === 1
                ? "Setting the mood..."
                : "Preparing your rizz experience..."}
            </p>

            <Button
              onClick={toggle}
              variant="outline"
              className="rounded-full flex items-center gap-1.5 px-3 py-1.5 mt-2 bg-pink-500/30 hover:bg-pink-500/40 border border-pink-500/30 animate-pulse"
              title={isPlaying ? "Mute music" : "Play music"}
            >
              {isPlaying ? (
                <>
                  <Volume2 size={16} className="text-white" />
                  <span className="text-sm font-medium text-white">
                    Music Playing
                  </span>
                </>
              ) : (
                <>
                  <Music size={16} className="text-white" />
                  <span className="text-sm font-medium text-white">
                    Click to Play Music
                  </span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
