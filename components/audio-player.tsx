"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  text: string;
  audioUrl?: string;
}

export const AudioPlayer = ({ text, audioUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState(audioUrl || "");

  useEffect(() => {
    if (!audioUrl && !audioSrc && text) {
      generateSpeech();
    }
  }, [text, audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const value =
        (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
      setProgress(value);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const setAudioProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const generateSpeech = async () => {
    if (!text) return;

    setIsLoading(true);

    try {
      // This is where you'd make an API call to your TTS service
      // For now, we'll simulate it
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/your-voice-id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        // If real API fails, use a placeholder
        setAudioSrc("/placeholder.mp3");
        return;
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioSrc(url);
    } catch (error) {
      console.error("Error generating speech:", error);
      // Fallback to placeholder
      setAudioSrc("/placeholder.mp3");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full mt-2">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={isLoading || !audioSrc}
          className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center hover:bg-pink-500/30 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"
            />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div
            className="h-2 bg-gray-800/50 rounded-full cursor-pointer overflow-hidden"
            onClick={setAudioProgress}
          >
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={toggleMute}
          className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800/70 transition-colors"
        >
          {isMuted ? (
            <VolumeX size={14} className="text-gray-400" />
          ) : (
            <Volume2 size={14} className="text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};
