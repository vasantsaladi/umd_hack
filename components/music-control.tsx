"use client";

import React, { useEffect, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { Button } from "./ui/button";
import { useMusic } from "@/lib/music-context";
import { cn } from "@/lib/utils";

export const MusicControl = () => {
  const { isPlaying, toggle, volume, setVolume, initializeAudio } = useMusic();
  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);

  // Try to initialize on component mount
  useEffect(() => {
    if (!hasAttemptedInit) {
      console.log("MusicControl: Attempting to initialize audio");
      initializeAudio();
      setHasAttemptedInit(true);

      // Force play with multiple attempts
      const attempts = [500, 1500, 3000];
      attempts.forEach((delay) => {
        setTimeout(() => {
          if (!isPlaying) {
            console.log(
              `MusicControl: Attempting to play after ${delay}ms delay`
            );
            toggle();
          }
        }, delay);
      });
    }
  }, [initializeAudio, isPlaying, toggle, hasAttemptedInit]);

  // Add a click handler that is more aggressive than just toggle
  const handleMusicClick = () => {
    console.log("MusicControl: Music button clicked");
    toggle();

    // If toggling to play, force another attempt after a short delay
    if (!isPlaying) {
      setTimeout(() => {
        initializeAudio();
        console.log("MusicControl: Extra play attempt after button click");
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleMusicClick}
        variant={isPlaying ? "default" : "outline"}
        className={cn(
          "rounded-full flex items-center gap-1.5 px-3 py-1 h-8 transition-colors",
          isPlaying
            ? "bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20"
            : "border-pink-500/30 text-pink-400 hover:bg-pink-500/20 hover:text-pink-300"
        )}
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Volume2 size={16} /> : <Music size={16} />}
        <span className="text-xs font-medium">
          {isPlaying ? "Music On" : "Music Off"}
        </span>
      </Button>

      {isPlaying && (
        <div className="flex items-center gap-2 bg-gray-800/30 px-2 py-1 rounded-full">
          <Volume2 size={14} className="text-pink-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 accent-pink-500 bg-gray-700 rounded-full"
            title="Adjust volume"
          />
        </div>
      )}
    </div>
  );
};
