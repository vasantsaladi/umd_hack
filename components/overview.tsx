import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import {
  HeartIcon,
  Mic,
  ImageIcon,
  Sparkles,
  Volume2,
  CalendarCheck,
  Music,
  VolumeX,
} from "lucide-react";

import { Button } from "./ui/button";
import { useMusic } from "@/lib/music-context";

export const Overview = () => {
  const { isPlaying, toggle, initializeAudio } = useMusic();

  // Initialize audio when Overview component mounts
  useEffect(() => {
    // Small delay to ensure browser is ready
    const timer = setTimeout(() => {
      initializeAudio();
    }, 800);

    return () => clearTimeout(timer);
  }, [initializeAudio]);

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <div className="flex flex-row justify-center gap-3 items-center relative">
          <HeartIcon className="text-red-500" size={32} />
          <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Rizz Lab
          </span>

          <Button
            variant="ghost"
            size="sm"
            className={`absolute right-0 p-1 h-8 w-8 rounded-full hover:bg-pink-500/10 ${
              isPlaying ? "music-btn-active" : ""
            }`}
            onClick={toggle}
            title={
              isPlaying ? "Mute background music" : "Play background music"
            }
          >
            {isPlaying ? (
              <Volume2 size={16} className="text-pink-400" />
            ) : (
              <VolumeX size={16} className="text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="bg-gradient-to-r from-pink-100/10 to-purple-100/10 p-6 rounded-xl border border-pink-200/20">
          <h2 className="text-xl font-semibold mb-4">Welcome to Rizz Lab</h2>
          <p className="mb-4">
            Train and improve your flirting skills with our advanced AI-powered
            rizz evaluator. Get real-time feedback, ratings, and suggestions to
            level up your game.
          </p>
          <p>
            Just type in your best pickup lines or flirting messages, and our AI
            will evaluate and score your rizz based on creativity, confidence,
            and authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-pink-100/10 rounded-lg border border-pink-200/20">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="text-pink-400" size={20} />
            </div>
            <h3 className="font-medium mb-2">🌟 Get Scored</h3>
            <p>Receive detailed scores on your rizz game</p>
          </div>

          <div className="p-4 bg-purple-100/10 rounded-lg border border-purple-200/20">
            <div className="flex items-center justify-center mb-2">
              <Mic className="text-purple-400" size={20} />
            </div>
            <h3 className="font-medium mb-2">🎤 Voice Practice</h3>
            <p>Practice your lines with voice input and playback</p>
          </div>

          <div className="p-4 bg-pink-100/10 rounded-lg border border-pink-200/20">
            <div className="flex items-center justify-center mb-2">
              <ImageIcon className="text-pink-400" size={20} />
            </div>
            <h3 className="font-medium mb-2">🖼️ Visualize Scenarios</h3>
            <p>Create images of flirting scenarios to visualize success</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-center mb-2">
              <CalendarCheck className="text-purple-400" size={20} />
            </div>
            <h3 className="font-medium mb-2 text-purple-300">
              ✨ Date Simulation
            </h3>
            <p className="text-gray-300">
              Test your conversation skills in simulated date scenarios and get
              personalized feedback
            </p>
          </div>

          <div className="p-4 bg-pink-900/20 rounded-xl border border-pink-500/20">
            <div className="flex items-center justify-center mb-2">
              <Volume2 className="text-pink-400" size={20} />
            </div>
            <h3 className="font-medium mb-2 text-pink-300">
              🔊 Voice Interaction
            </h3>
            <p className="text-gray-300">
              Experience interactive conversations with AI voice responses. Try
              &quot;speak: hello&quot; to hear it!
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/40 flex items-center gap-3">
          <Music className="text-pink-400" size={18} />
          <div className="text-sm text-left">
            <p className="text-gray-300">
              Enjoy the romantic ambiance with our background music as you
              practice your dating skills
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Start by typing or speaking your pickup line or flirting message
          below!
        </p>
      </div>
    </motion.div>
  );
};
