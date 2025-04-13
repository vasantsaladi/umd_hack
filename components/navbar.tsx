"use client";

import { Button } from "./ui/button";
import { HeartIcon } from "lucide-react";
import Link from "next/link";
import { MusicControl } from "./music-control";
import { useMusic } from "@/lib/music-context";
import { useEffect } from "react";

export const Navbar = () => {
  const { initializeAudio, toggle, isPlaying } = useMusic();

  // Try to initialize audio when component mounts - now more aggressive
  useEffect(() => {
    console.log("Navbar: Attempting to initialize audio on mount");

    // Immediate attempt
    initializeAudio();

    // Staggered attempts with increasing delays
    [500, 1500, 3000, 6000].forEach((delay) => {
      setTimeout(() => {
        console.log(`Navbar: Attempting initialization after ${delay}ms`);
        initializeAudio();

        // If still not playing, try to toggle
        if (!isPlaying) {
          console.log(`Navbar: Forcing toggle after ${delay}ms`);
          toggle();
        }
      }, delay);
    });
  }, [initializeAudio, toggle, isPlaying]);

  // Add a user interaction listener for iOS/Safari browsers
  useEffect(() => {
    const handleUserInteraction = () => {
      console.log("Navbar: User interaction detected");
      // Try both initializing and toggling on interaction
      initializeAudio();
      if (!isPlaying) {
        toggle();
      }
    };

    // Add event listeners
    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("touchstart", handleUserInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [initializeAudio, toggle, isPlaying]);

  return (
    <div className="p-3 flex flex-row gap-2 justify-between items-center border-b border-gray-800/30">
      <div className="flex items-center gap-2">
        <HeartIcon className="text-red-500" size={20} />
        <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hidden md:inline">
          Rizz Lab
        </span>
      </div>

      <div className="flex items-center gap-3">
        <MusicControl />

        <Link href="/about">
          <Button
            variant="ghost"
            className="text-sm hover:bg-pink-500/10 hover:text-pink-400 transition-colors"
          >
            About
          </Button>
        </Link>

        <Link href="/tips">
          <Button
            variant="ghost"
            className="text-sm hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
          >
            Rizz Tips
          </Button>
        </Link>
      </div>
    </div>
  );
};
