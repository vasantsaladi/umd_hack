"use client";

import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartIcon } from "lucide-react";
import { useMusic } from "@/lib/music-context";

interface LoadingAnimationProps {
  onComplete?: () => void;
}

export const LoadingAnimation: FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [isComplete, setIsComplete] = useState(false);
  const { toggle, isPlaying } = useMusic();

  useEffect(() => {
    // Start the animation sequence
    const animationTimer = setTimeout(() => {
      setIsComplete(true);

      // Start playing the background music when animation completes
      // Only toggle if music isn't already playing
      if (!isPlaying) {
        toggle();
      }

      if (onComplete) {
        onComplete();
      }
    }, 3000); // 3 seconds loading time

    return () => {
      clearTimeout(animationTimer);
    };
  }, [onComplete, toggle, isPlaying]);

  if (isComplete) {
    return null;
  }

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center bg-background z-50"
    >
      <div className="flex flex-col items-center gap-6">
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
          <p className="text-muted-foreground text-sm">Setting the mood...</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
