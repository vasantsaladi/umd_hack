"use client";

import { FC, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MessageSquare,
  Award,
  TrendingUp,
  FileText,
  Download,
  PlayCircle,
  PauseCircle,
  Volume2,
  Heart,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "./ui/button";
import { useMusic } from "@/lib/music-context";
import { toast } from "sonner";

interface DateSimulationProps {
  simulationResult?: DateSimulationResult;
  isLoading?: boolean;
  onRegenerate?: () => void;
}

interface DateSimulationResult {
  scenario: string;
  image_url: string;
  context: string;
  analysis: {
    overall_score: number;
    chemistry_score: number;
    conversation_score: number;
    strengths: string[];
    improvements: string[];
  };
  date_speech?: {
    audio_base64: string;
    text: string;
    voice: string;
  };
}

export const DateSimulation: FC<DateSimulationProps> = ({
  simulationResult,
  isLoading = false,
  onRegenerate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { pauseDuringAction, resumeAfterAction } = useMusic();
  const [activeTab, setActiveTab] = useState<"conversation" | "analysis">(
    "conversation"
  );
  const [showImageFull, setShowImageFull] = useState(false);

  // Create audio URL from base64 data when available
  useEffect(() => {
    if (simulationResult?.date_speech?.audio_base64) {
      const base64Audio = simulationResult.date_speech.audio_base64;
      const audioData = `data:audio/mp3;base64,${base64Audio}`;
      setAudioUrl(audioData);
    }

    return () => {
      // Clean up audio URL when component unmounts
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Ensure music is resumed if component unmounts while playing
      if (isPlaying) {
        resumeAfterAction();
      }
    };
  }, [simulationResult, audioUrl, isPlaying, resumeAfterAction]);

  // Add to the existing useEffect at the top of the component
  useEffect(() => {
    // If we have a simulation result and audio is not currently playing,
    // make sure background music is playing for the romantic mood
    if (simulationResult && !isPlaying && !audioUrl) {
      // Check if music is already playing via context
      if (!isPlaying) {
        // You may want to ensure background music is playing here
        // This is optional, remove if you prefer music to remain in its current state
        const timeoutId = setTimeout(() => {
          if (!isPlaying) {
            resumeAfterAction(); // This will resume music if it was previously paused
          }
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [simulationResult, isPlaying, audioUrl, resumeAfterAction]);

  // Handle play/pause audio
  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      resumeAfterAction(); // Resume background music when paused
      toast("Audio paused", {
        icon: <PauseCircle className="text-pink-400" size={18} />,
      });
    } else {
      pauseDuringAction(); // Pause background music before playing
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        resumeAfterAction(); // Resume background music if error
        toast.error("Failed to play audio");
      });
      toast("Playing date's voice", {
        icon: <PlayCircle className="text-pink-400" size={18} />,
      });
    }

    setIsPlaying(!isPlaying);
  };

  // Update isPlaying state when audio ends
  const handleAudioEnded = () => {
    setIsPlaying(false);
    resumeAfterAction(); // Resume background music when finished
    toast("Audio playback complete", {
      icon: <Sparkles className="text-pink-400" size={18} />,
    });
  };

  const handleRegenerateClick = () => {
    if (onRegenerate) {
      toast("Regenerating date scenario...", {
        icon: <RotateCcw className="text-purple-400 animate-spin" size={18} />,
      });
      onRegenerate();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background/50 backdrop-blur-lg rounded-xl p-6 shadow-md border border-purple-500/20 animate-pulse">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-muted rounded-md w-1/3"></div>
            <div className="h-8 w-8 rounded-full bg-muted"></div>
          </div>
          <div className="h-44 bg-muted rounded-md"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-muted rounded-md"></div>
            <div className="h-20 bg-muted rounded-md"></div>
            <div className="h-20 bg-muted rounded-md"></div>
          </div>
          <div className="h-24 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!simulationResult) {
    return null;
  }

  // Function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-500";
    if (score <= 6) return "text-yellow-500";
    return "text-green-500";
  };

  // Format the scenario text with proper paragraph breaks and highlight dialog
  const formattedScenario = simulationResult.scenario
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, index) => {
      if (line.startsWith("Date Setting:")) {
        return (
          <p key={index} className="font-medium text-purple-300 mb-3">
            {line}
          </p>
        );
      } else if (line.startsWith("You:")) {
        return (
          <p key={index} className="text-blue-300 mb-2">
            {line}
          </p>
        );
      } else if (line.startsWith("Date:")) {
        return (
          <p key={index} className="text-pink-300 mb-2">
            {line}
          </p>
        );
      } else {
        return (
          <p key={index} className="text-gray-300 mb-3">
            {line}
          </p>
        );
      }
    });

  // Handle image download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = simulationResult.image_url;
    link.download = `date-simulation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded successfully");
  };

  // Extract dialogue from scenario for improved readability
  const dialogue = simulationResult.scenario
    .split("\n")
    .filter((line) => line.startsWith("You:") || line.startsWith("Date:"))
    .map((line, index) => {
      const isUser = line.startsWith("You:");
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className={`p-3 rounded-lg ${
            isUser
              ? "bg-blue-900/30 border-blue-800/40 hover:bg-blue-900/40"
              : "bg-pink-900/30 border-pink-800/40 hover:bg-pink-900/40"
          } border mb-3 transition-colors duration-200`}
        >
          <p className={isUser ? "text-blue-300" : "text-pink-300"}>{line}</p>
        </motion.div>
      );
    });

  return (
    <>
      {showImageFull && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageFull(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative max-w-3xl max-h-[90vh]"
          >
            <img
              src={simulationResult.image_url}
              alt="Date scenario full view"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <Button
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-2"
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowImageFull(false);
              }}
            >
              ✕
            </Button>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-500/30 overflow-hidden"
      >
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            onError={() => {
              console.error("Audio playback error");
              setIsPlaying(false);
              resumeAfterAction();
              toast.error("Audio playback error");
            }}
            style={{ display: "none" }}
          />
        )}

        <div className="p-4 border-b border-gray-700/60 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="flex items-center gap-2">
            <Heart className="text-pink-400" size={18} />
            <h3 className="font-medium text-white/90">Date Simulation</h3>
            <span className="px-2 py-0.5 bg-purple-900/50 rounded-full text-xs text-purple-300 border border-purple-800/30">
              {simulationResult.context}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {audioUrl && (
              <Button
                onClick={toggleAudio}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-pink-900/30"
              >
                {isPlaying ? (
                  <PauseCircle size={18} className="text-pink-400" />
                ) : (
                  <PlayCircle size={18} className="text-pink-400" />
                )}
              </Button>
            )}
            <Button
              onClick={handleDownload}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full hover:bg-purple-900/30"
              title="Download image"
            >
              <Download size={16} className="text-purple-400" />
            </Button>
            {onRegenerate && (
              <Button
                onClick={handleRegenerateClick}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-blue-900/30"
                title="Regenerate simulation"
              >
                <RotateCcw size={16} className="text-blue-400" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 p-4">
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="rounded-lg border border-gray-700/50 overflow-hidden cursor-pointer shadow-md hover:shadow-lg"
              onClick={() => setShowImageFull(true)}
            >
              <div className="relative">
                <img
                  src={simulationResult.image_url}
                  alt="Date scenario visualization"
                  className="w-full h-auto object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                    Click to enlarge
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="flex flex-col items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 shadow-sm"
              >
                <span className="text-sm text-gray-400 mb-1">Overall</span>
                <span
                  className={`text-xl font-bold ${getScoreColor(
                    simulationResult.analysis.overall_score
                  )}`}
                >
                  {simulationResult.analysis.overall_score}/10
                </span>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="flex flex-col items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 shadow-sm"
              >
                <span className="text-sm text-gray-400 mb-1">Chemistry</span>
                <span
                  className={`text-xl font-bold ${getScoreColor(
                    simulationResult.analysis.chemistry_score
                  )}`}
                >
                  {simulationResult.analysis.chemistry_score}/10
                </span>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="flex flex-col items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 shadow-sm"
              >
                <span className="text-sm text-gray-400 mb-1">Conversation</span>
                <span
                  className={`text-xl font-bold ${getScoreColor(
                    simulationResult.analysis.conversation_score
                  )}`}
                >
                  {simulationResult.analysis.conversation_score}/10
                </span>
              </motion.div>
            </div>

            {simulationResult.date_speech && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-700/40 flex items-center gap-3 shadow-md"
              >
                <Volume2 size={18} className="text-purple-400" />
                <span className="text-sm text-purple-300">
                  {isPlaying
                    ? "Playing date's voice response..."
                    : "Hear your date's voice"}
                </span>
                <Button
                  onClick={toggleAudio}
                  size="sm"
                  variant="ghost"
                  className="ml-auto h-8 w-8 p-0 rounded-full bg-purple-800/50 hover:bg-purple-700/50"
                >
                  {isPlaying ? (
                    <PauseCircle size={16} className="text-purple-300" />
                  ) : (
                    <PlayCircle size={16} className="text-purple-300" />
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex border-b border-gray-700/30 mb-1">
              <Button
                variant={activeTab === "conversation" ? "default" : "ghost"}
                size="sm"
                className={`rounded-b-none ${
                  activeTab === "conversation"
                    ? "bg-purple-800/40 text-purple-200 hover:bg-purple-800/50"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("conversation")}
              >
                <MessageSquare size={14} className="mr-1" />
                Conversation
              </Button>
              <Button
                variant={activeTab === "analysis" ? "default" : "ghost"}
                size="sm"
                className={`rounded-b-none ${
                  activeTab === "analysis"
                    ? "bg-purple-800/40 text-purple-200 hover:bg-purple-800/50"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("analysis")}
              >
                <FileText size={14} className="mr-1" />
                Analysis
              </Button>
            </div>

            {activeTab === "conversation" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 shadow-md"
              >
                <div className="max-h-[320px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
                  {dialogue}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={18} className="text-green-400" />
                    <h4 className="font-medium text-white/90">Strengths</h4>
                  </div>
                  <ul className="text-sm space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {simulationResult.analysis.strengths.map(
                      (strength, index) => (
                        <motion.li
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          key={index}
                          className="flex items-start gap-2 bg-green-900/10 p-2 rounded border border-green-800/20"
                        >
                          <span className="text-green-400 text-lg leading-tight">
                            •
                          </span>
                          <span className="text-gray-300">{strength}</span>
                        </motion.li>
                      )
                    )}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={18} className="text-yellow-400" />
                    <h4 className="font-medium text-white/90">Improvements</h4>
                  </div>
                  <ul className="text-sm space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {simulationResult.analysis.improvements.map(
                      (improvement, index) => (
                        <motion.li
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          key={index}
                          className="flex items-start gap-2 bg-yellow-900/10 p-2 rounded border border-yellow-800/20"
                        >
                          <span className="text-yellow-400 text-lg leading-tight">
                            •
                          </span>
                          <span className="text-gray-300">{improvement}</span>
                        </motion.li>
                      )
                    )}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};
