"use client";

import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Award,
  TrendingUp,
  AlertTriangle,
  Send,
  RotateCcw,
  Share2,
  User,
  Camera,
  Heart,
  Edit,
  X,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface RizzEvaluationProps {
  evaluationResult: EvaluationResult;
  userInput: string;
  isLoading?: boolean;
  onRegenerateClick?: () => void;
}

interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  category: string;
  emojis: string[];
}

interface ProfileField {
  label: string;
  value: string;
  tips: string[];
}

export const RizzEvaluation: FC<RizzEvaluationProps> = ({
  evaluationResult,
  userInput,
  isLoading = false,
  onRegenerateClick,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  const [showProfileCreator, setShowProfileCreator] = useState(false);
  const [activeProfileField, setActiveProfileField] = useState<string | null>(
    null
  );
  const [profileFields, setProfileFields] = useState<ProfileField[]>([
    {
      label: "Bio",
      value: "",
      tips: [
        "Keep it short and engaging",
        "Show your personality",
        "Mention 1-2 interests or hobbies",
        "Add a touch of humor if that's your style",
      ],
    },
    {
      label: "Interests",
      value: "",
      tips: [
        "Be specific rather than generic",
        "Include interests that spark conversation",
        "Avoid listing too many things",
        "Be authentic - don't fake interests",
      ],
    },
    {
      label: "First Date Idea",
      value: "",
      tips: [
        "Suggest something casual and low-pressure",
        "Choose an activity that allows conversation",
        "Be specific - 'coffee at the waterfront' is better than just 'coffee'",
        "Show thoughtfulness in your suggestion",
      ],
    },
  ]);

  // Trigger confetti for high scores on first render
  useEffect(() => {
    if (evaluationResult && evaluationResult.score >= 8 && !hasAnimated) {
      setTimeout(() => {
        setShowConfetti(true);
        setHasAnimated(true);

        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
      }, 500);
    }
  }, [evaluationResult, hasAnimated]);

  const handleShare = () => {
    if (!evaluationResult) return;

    const shareText = `I just got a rizz score of ${evaluationResult.score}/10 with: "${userInput}" #RizzLab`;

    if (navigator.share) {
      navigator
        .share({
          title: "My Rizz Score",
          text: shareText,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
          copyToClipboard(shareText);
        });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy to clipboard");
      });
  };

  const handleReaction = (type: "like" | "dislike") => {
    setReaction(type);
    if (type === "like") {
      toast.success("Thanks for your feedback!", {
        icon: <ThumbsUp className="text-green-500" size={18} />,
      });
    } else {
      toast("We'll improve our evaluation next time", {
        icon: <ThumbsDown className="text-yellow-500" size={18} />,
      });
    }
  };

  const handleProfileFieldChange = (index: number, newValue: string) => {
    const updatedFields = [...profileFields];
    updatedFields[index].value = newValue;
    setProfileFields(updatedFields);
  };

  const handleProfileFieldEdit = (label: string) => {
    setActiveProfileField(activeProfileField === label ? null : label);
  };

  const scoreProfile = () => {
    // Count filled fields and calculate total length
    const filledFields = profileFields.filter(
      (field) => field.value.trim().length > 0
    );
    const totalLength = profileFields.reduce(
      (sum, field) => sum + field.value.length,
      0
    );

    // Simple scoring algorithm
    let score = 5; // Base score

    // Add points for filled fields
    score += filledFields.length * 1.5;

    // Add points for content length (up to a point)
    if (totalLength > 50) score += 1;
    if (totalLength > 100) score += 1;

    // Cap score at 10
    score = Math.min(Math.round(score), 10);

    // Show toast with feedback
    toast.success(`Profile Score: ${score}/10`, {
      description:
        score >= 8
          ? "Your profile stands out! Very engaging."
          : score >= 6
          ? "Good profile! A few more details could help."
          : "Consider adding more details to make your profile shine!",
      icon:
        score >= 8 ? (
          <Sparkles className="text-pink-400" />
        ) : (
          <TrendingUp className="text-yellow-400" />
        ),
    });
  };

  if (isLoading) {
    return (
      <div className="bg-background/50 backdrop-blur-lg rounded-xl p-6 shadow-md border border-purple-500/20 animate-pulse">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-muted rounded-md w-1/3"></div>
            <div className="h-8 w-8 rounded-full bg-muted"></div>
          </div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
          </div>
          <div className="h-24 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-xl overflow-hidden relative date-card"
    >
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="confetti-container">
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 60%)`,
                  }}
                />
              ))}
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-pink-900/20 via-purple-900/10 to-transparent">
        <div className="flex items-center gap-2">
          <Flame
            className={`${
              evaluationResult && evaluationResult.score >= 8
                ? "text-pink-500"
                : evaluationResult && evaluationResult.score >= 5
                ? "text-yellow-500"
                : "text-blue-500"
            }`}
            size={20}
          />
          <h3 className="font-medium text-white">Rizz Evaluation</h3>
          <span className="px-2 py-0.5 bg-purple-900/50 rounded-full text-xs text-purple-300 border border-purple-800/30">
            {evaluationResult && evaluationResult.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowProfileCreator(!showProfileCreator)}
            size="sm"
            variant={showProfileCreator ? "default" : "ghost"}
            className={`h-8 p-0 px-2 rounded-full hover:bg-blue-900/30 flex items-center gap-1 ${
              showProfileCreator ? "bg-blue-900/40 text-blue-300" : ""
            }`}
            title="Dating Profile Creator"
          >
            <User
              size={14}
              className={showProfileCreator ? "text-blue-300" : "text-blue-400"}
            />
            <span className="text-xs">Profile</span>
          </Button>
          <Button
            onClick={handleShare}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full hover:bg-purple-900/30"
          >
            <Share2 size={16} className="text-purple-400" />
          </Button>
          {onRegenerateClick && (
            <Button
              onClick={onRegenerateClick}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-900/30"
              title="Regenerate evaluation"
            >
              <RotateCcw size={16} className="text-blue-400" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showProfileCreator ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium rizz-gradient-text">
                Dating Profile Creator
              </h3>
              <Button
                onClick={scoreProfile}
                size="sm"
                className="bg-pink-700 hover:bg-pink-600 text-xs flex items-center gap-1"
              >
                <Heart size={14} />
                <span>Score My Profile</span>
              </Button>
            </div>

            <div className="bg-gray-800/30 rounded-lg border border-gray-700/40 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-blue-400" />
                <h4 className="text-white font-medium">
                  Perfect Your Dating Profile
                </h4>
              </div>
              <p className="text-sm text-gray-300 mb-6">
                Your dating profile is your chance to make a great first
                impression. Craft each section carefully to showcase your
                authentic self and attract the right matches.
              </p>

              <div className="space-y-6">
                {profileFields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-purple-300">
                        {field.label}
                      </label>
                      <Button
                        onClick={() => handleProfileFieldEdit(field.label)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        {activeProfileField === field.label ? (
                          <X size={14} className="text-gray-400" />
                        ) : (
                          <Edit size={14} className="text-gray-400" />
                        )}
                      </Button>
                    </div>

                    {activeProfileField === field.label ? (
                      <div className="space-y-3">
                        <textarea
                          value={field.value}
                          onChange={(e) =>
                            handleProfileFieldChange(index, e.target.value)
                          }
                          placeholder={`Write your ${field.label.toLowerCase()} here...`}
                          className="w-full bg-gray-800/60 border border-gray-700/60 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-24"
                        />
                        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
                          <h5 className="text-xs font-medium text-purple-300 mb-2">
                            Tips:
                          </h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {field.tips.map((tip, tipIndex) => (
                              <li
                                key={tipIndex}
                                className="text-xs text-purple-200"
                              >
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 min-h-20">
                        {field.value ? (
                          <p className="text-sm text-gray-300">{field.value}</p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No {field.label.toLowerCase()} added yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowProfileCreator(false)}
                variant="ghost"
                className="text-sm text-gray-400 hover:text-white"
              >
                Go Back to Evaluation
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="mb-6">
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/40 mb-6">
              <h4 className="text-sm text-gray-400 mb-2">Your Line</h4>
              <p className="text-white italic">"{userInput}"</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="relative"
              >
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-4 ${
                    evaluationResult && evaluationResult.score >= 8
                      ? "border-pink-500 text-pink-500 bg-pink-950/30"
                      : evaluationResult && evaluationResult.score >= 5
                      ? "border-yellow-500 text-yellow-500 bg-yellow-950/30"
                      : "border-blue-500 text-blue-500 bg-blue-950/30"
                  }`}
                >
                  {evaluationResult ? `${evaluationResult.score}/10` : "?/10"}
                </div>
                <div className="absolute -top-1 -right-1">
                  {evaluationResult && evaluationResult.score >= 8 && (
                    <div className="animate-pulse">
                      <Sparkles className="text-pink-500" size={24} />
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2 rizz-gradient-text">
                  Feedback
                </h3>
                <p className="text-gray-300">
                  {evaluationResult && evaluationResult.feedback}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {evaluationResult &&
                    evaluationResult.emojis &&
                    evaluationResult.emojis.map((emoji, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.1 * index,
                        }}
                        className="text-2xl"
                      >
                        {emoji}
                      </motion.span>
                    ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-gradient-to-r from-green-900/10 to-green-900/5 rounded-lg border border-green-700/30 shadow-md"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Award size={18} className="text-green-500" />
                  <h4 className="font-medium text-white/90">Strengths</h4>
                </div>
                <ul className="space-y-2">
                  {evaluationResult &&
                    evaluationResult.strengths &&
                    evaluationResult.strengths.map((strength, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + 0.1 * index }}
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-300">{strength}</span>
                      </motion.li>
                    ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-gradient-to-r from-yellow-900/10 to-yellow-900/5 rounded-lg border border-yellow-700/30 shadow-md"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-yellow-500" />
                  <h4 className="font-medium text-white/90">Improvements</h4>
                </div>
                <ul className="space-y-2">
                  {evaluationResult &&
                    evaluationResult.improvements &&
                    evaluationResult.improvements.map((improvement, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + 0.1 * index }}
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <span className="text-yellow-500 mt-1">•</span>
                        <span className="text-gray-300">{improvement}</span>
                      </motion.li>
                    ))}
                </ul>
              </motion.div>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex justify-between items-center border-t border-gray-700/30 pt-4"
        >
          <div className="text-sm text-gray-400">
            Was this evaluation helpful?
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleReaction("like")}
              variant={reaction === "like" ? "default" : "ghost"}
              size="sm"
              className={`${
                reaction === "like"
                  ? "bg-green-900/50 hover:bg-green-900/60 text-green-300"
                  : "text-gray-400 hover:text-green-400"
              }`}
            >
              <ThumbsUp size={16} className="mr-1" />
              Yes
            </Button>
            <Button
              onClick={() => handleReaction("dislike")}
              variant={reaction === "dislike" ? "default" : "ghost"}
              size="sm"
              className={`${
                reaction === "dislike"
                  ? "bg-yellow-900/50 hover:bg-yellow-900/60 text-yellow-300"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              <ThumbsDown size={16} className="mr-1" />
              No
            </Button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          opacity: 0;
          transform: translateY(0);
          animation: confetti 3s ease-in-out forwards;
        }

        @keyframes confetti {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-100vh) rotate(720deg);
          }
        }
      `}</style>
    </motion.div>
  );
};
