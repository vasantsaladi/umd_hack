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
} from "lucide-react";
import { Button } from "./ui/button";

interface DateSimulationProps {
  simulationResult?: DateSimulationResult;
  isLoading?: boolean;
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
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
    };
  }, [simulationResult]);

  // Handle play/pause audio
  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Update isPlaying state when audio ends
  const handleAudioEnded = () => {
    setIsPlaying(false);
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
          className={`p-2 rounded-lg ${
            isUser
              ? "bg-blue-900/20 border-blue-800/30"
              : "bg-pink-900/20 border-pink-800/30"
          } border mb-2`}
        >
          <p className={isUser ? "text-blue-300" : "text-pink-300"}>{line}</p>
        </motion.div>
      );
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-r from-gray-900/70 to-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-purple-500/20 overflow-hidden"
    >
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          style={{ display: "none" }}
        />
      )}

      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="text-purple-400" size={18} />
          <h3 className="font-medium text-white/90">Date Simulation</h3>
          <span className="px-2 py-0.5 bg-purple-900/40 rounded-full text-xs text-purple-300">
            {simulationResult.context}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {audioUrl && (
            <Button
              onClick={toggleAudio}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full"
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
            className="h-8 w-8 p-0 rounded-full"
          >
            <Download size={14} />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 p-4">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-700/40 overflow-hidden">
            <img
              src={simulationResult.image_url}
              alt="Date scenario visualization"
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-800/40 border border-gray-700/40">
              <span className="text-sm text-gray-400 mb-1">Overall</span>
              <span
                className={`text-xl font-bold ${getScoreColor(
                  simulationResult.analysis.overall_score
                )}`}
              >
                {simulationResult.analysis.overall_score}/10
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-800/40 border border-gray-700/40">
              <span className="text-sm text-gray-400 mb-1">Chemistry</span>
              <span
                className={`text-xl font-bold ${getScoreColor(
                  simulationResult.analysis.chemistry_score
                )}`}
              >
                {simulationResult.analysis.chemistry_score}/10
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-800/40 border border-gray-700/40">
              <span className="text-sm text-gray-400 mb-1">Conversation</span>
              <span
                className={`text-xl font-bold ${getScoreColor(
                  simulationResult.analysis.conversation_score
                )}`}
              >
                {simulationResult.analysis.conversation_score}/10
              </span>
            </div>
          </div>

          {simulationResult.date_speech && (
            <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/40 flex items-center gap-2">
              <Volume2 size={16} className="text-purple-400" />
              <span className="text-sm text-purple-300">
                {isPlaying
                  ? "Playing date responses..."
                  : "Play date responses"}
              </span>
              <Button
                onClick={toggleAudio}
                size="sm"
                variant="ghost"
                className="ml-auto h-7 w-7 p-0 rounded-full bg-purple-800/40"
              >
                {isPlaying ? (
                  <PauseCircle size={14} className="text-purple-300" />
                ) : (
                  <PlayCircle size={14} className="text-purple-300" />
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/40">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-blue-400" />
              <h4 className="font-medium text-white/90">Conversation</h4>
            </div>
            <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {dialogue}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/40">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-green-400" />
                <h4 className="font-medium text-white/90">Strengths</h4>
              </div>
              <ul className="text-sm space-y-1">
                {simulationResult.analysis.strengths.map((strength, index) => (
                  <motion.li
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <span className="text-green-400">•</span>
                    <span className="text-gray-300">{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/40">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-yellow-400" />
                <h4 className="font-medium text-white/90">Improvements</h4>
              </div>
              <ul className="text-sm space-y-1">
                {simulationResult.analysis.improvements.map(
                  (improvement, index) => (
                    <motion.li
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      key={index}
                      className="flex items-start gap-2"
                    >
                      <span className="text-yellow-400">•</span>
                      <span className="text-gray-300">{improvement}</span>
                    </motion.li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
