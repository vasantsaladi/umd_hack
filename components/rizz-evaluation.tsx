"use client";

import { motion } from "framer-motion";
import { FC } from "react";
import { HeartPulse, Check, Info, Lightbulb, BarChart2 } from "lucide-react";

// Define the RizzResult type
type RizzResult = {
  score: number;
  context: string;
  creativity: number;
  confidence: number;
  authenticity: number;
  feedback: string;
  improvement_tips: string[];
};

// Props for the RizzEvaluation component
interface RizzEvaluationProps {
  rizzResult?: RizzResult;
  isLoading?: boolean;
}

export const RizzEvaluation: FC<RizzEvaluationProps> = ({
  rizzResult,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-background/50 backdrop-blur-lg rounded-xl p-6 shadow-md border border-pink-500/20 animate-pulse">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-muted rounded-md w-1/3"></div>
            <div className="h-8 w-8 rounded-full bg-muted"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-muted rounded-md"></div>
            <div className="h-20 bg-muted rounded-md"></div>
            <div className="h-20 bg-muted rounded-md"></div>
          </div>
          <div className="h-16 bg-muted rounded-md"></div>
          <div className="h-24 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!rizzResult) {
    return null;
  }

  // Function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-500";
    if (score <= 6) return "text-yellow-500";
    return "text-green-500";
  };

  // Function to determine background based on score
  const getScoreBg = (score: number) => {
    if (score <= 3) return "bg-red-500/10 border-red-500/20";
    if (score <= 6) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-green-500/10 border-green-500/20";
  };

  // Function to determine border color based on score
  const getScoreBorder = (score: number) => {
    if (score <= 3) return "border-red-500/30";
    if (score <= 6) return "border-yellow-500/30";
    return "border-green-500/30";
  };

  // Function to determine icon based on score
  const getScoreIcon = (score: number) => {
    return <HeartPulse className={`${getScoreColor(score)}`} size={20} />;
  };

  // Function to generate score visualization
  const renderScoreBar = (value: number, label: string) => {
    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className={`${getScoreColor(value)} font-bold`}>
            {value}/10
          </span>
        </div>
        <div className="relative h-2 bg-gray-800/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value * 10}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute h-full rounded-full ${
              value <= 3
                ? "bg-gradient-to-r from-red-600 to-red-400"
                : value <= 6
                ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                : "bg-gradient-to-r from-green-600 to-green-400"
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-lg rounded-xl p-6 shadow-lg border ${getScoreBorder(
        rizzResult.score
      )}`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${getScoreBg(rizzResult.score)}`}>
              <BarChart2
                className={getScoreColor(rizzResult.score)}
                size={18}
              />
            </div>
            <h3 className="text-lg font-semibold">Rizz Evaluation</h3>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full">
            <span className="text-sm text-gray-400">Score:</span>
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 10,
                delay: 0.2,
              }}
              className={`text-lg font-bold ${getScoreColor(rizzResult.score)}`}
            >
              {rizzResult.score}/10
            </motion.span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 bg-gray-800/40 border border-gray-700/40 rounded-lg"
          >
            {renderScoreBar(rizzResult.creativity, "Creativity")}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 bg-gray-800/40 border border-gray-700/40 rounded-lg"
          >
            {renderScoreBar(rizzResult.confidence, "Confidence")}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-gray-800/40 border border-gray-700/40 rounded-lg"
          >
            {renderScoreBar(rizzResult.authenticity, "Authenticity")}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 bg-gray-800/30 p-4 rounded-lg border border-gray-700/40"
        >
          <div className="mt-0.5 p-1.5 rounded-md bg-blue-500/20 text-blue-400">
            <Info size={16} />
          </div>
          <div>
            <h4 className="font-medium mb-1 text-white/90">Feedback:</h4>
            <p className="text-gray-300">{rizzResult.feedback}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/30 rounded-lg border border-gray-700/40"
        >
          <div className="p-4 border-b border-gray-700/40 flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-yellow-500/20 text-yellow-400">
              <Lightbulb size={16} />
            </div>
            <h4 className="font-medium text-white/90">Improvement Tips:</h4>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {rizzResult.improvement_tips.map((tip, index) => (
                <motion.li
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  key={index}
                  className="flex items-start gap-2"
                >
                  <Check size={16} className="text-green-400 mt-1 shrink-0" />
                  <span className="text-sm text-gray-300">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {rizzResult.context && (
          <div className="flex justify-between items-center text-xs text-gray-500 px-1">
            <span>
              Based on context:{" "}
              <span className="text-pink-400">{rizzResult.context}</span>
            </span>
            <span>Results may vary based on individual preferences</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
