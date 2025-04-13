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
  Smile,
  Frown,
  ThumbsUp,
  ThumbsDown,
  Mic,
  StopCircle,
  LineChart,
  Clock,
  Check,
  X,
  Lightbulb,
  MessageCircle,
  Send,
  Trophy,
  Star,
  Medal,
  PartyPopper,
  Flame,
  Zap,
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

// Add image error boundary component
interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageWithFallback = ({ src, alt, className }: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(
        "https://placehold.co/600x400/9333ea/ffffff?text=Image+Unavailable"
      );
      console.error("Image failed to load:", src);
    }
  };

  return (
    <img src={imgSrc} alt={alt} className={className} onError={handleError} />
  );
};

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
  const [userResponse, setUserResponse] = useState("");
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceResponses, setPracticeResponses] = useState<
    { text: string; score: number }[]
  >([]);
  const [showTips, setShowTips] = useState(false);
  const [dateMood, setDateMood] = useState<number>(7); // Starting mood 0-10
  const [moodHistory, setMoodHistory] = useState<
    { response: string; mood: number }[]
  >([]);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isImageLoading, setIsImageLoading] = useState(true);
  const audioChunks = useRef<Blob[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [dateProgress, setDateProgress] = useState<
    {
      stage: string;
      description: string;
      status: "completed" | "current" | "upcoming";
    }[]
  >([
    {
      stage: "First Impression",
      description:
        "Make a positive first impression with a confident introduction and warm smile.",
      status: "completed",
    },
    {
      stage: "Small Talk",
      description:
        "Break the ice with light conversation about shared interests or observations.",
      status: "current",
    },
    {
      stage: "Personal Connection",
      description:
        "Deepen the conversation by sharing meaningful experiences and asking thoughtful questions.",
      status: "upcoming",
    },
    {
      stage: "Chemistry Building",
      description:
        "Create moments of connection through humor, active listening, and appropriate compliments.",
      status: "upcoming",
    },
    {
      stage: "Next Steps",
      description:
        "Express genuine interest in seeing them again and suggest a specific plan.",
      status: "upcoming",
    },
  ]);
  const [showCoach, setShowCoach] = useState(false);
  const [coachMessage, setCoachMessage] = useState<string>("");
  const [coachResponses, setCoachResponses] = useState<
    { type: "user" | "coach"; text: string }[]
  >([
    {
      type: "coach",
      text: "Hey there! What aspect of your dating game would you like help with today? Ask me about openers, confidence, handling awkward silences, or anything else!",
    },
  ]);
  const [coachInput, setCoachInput] = useState<string>("");
  const [isCoachTyping, setIsCoachTyping] = useState(false);

  // Achievement system
  const [achievements, setAchievements] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      icon: JSX.Element;
      unlocked: boolean;
      progress?: number;
      maxProgress?: number;
      date?: Date;
      rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    }>
  >([
    {
      id: "first_practice",
      title: "Conversation Starter",
      description: "Practice your first response",
      icon: <MessageSquare className="text-blue-400" size={18} />,
      unlocked: false,
      rarity: "common",
    },
    {
      id: "voice_response",
      title: "Speaking Up",
      description: "Use voice mode to practice speaking",
      icon: <Mic className="text-purple-400" size={18} />,
      unlocked: false,
      rarity: "common",
    },
    {
      id: "perfect_score",
      title: "Smooth Talker",
      description: "Get a perfect 10/10 on a practice response",
      icon: <Star className="text-yellow-400" size={18} />,
      unlocked: false,
      rarity: "uncommon",
    },
    {
      id: "mood_master",
      title: "Mood Master",
      description: "Get your date to the highest mood level",
      icon: <Heart className="text-pink-400" size={18} />,
      unlocked: false,
      rarity: "rare",
    },
    {
      id: "practice_streak",
      title: "Dedicated Dater",
      description: "Practice 5 responses in a row",
      icon: <Flame className="text-orange-400" size={18} />,
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      rarity: "uncommon",
    },
    {
      id: "timeline_explorer",
      title: "Timeline Explorer",
      description: "View the date timeline",
      icon: <Clock className="text-yellow-400" size={18} />,
      unlocked: false,
      rarity: "common",
    },
    {
      id: "coach_consultation",
      title: "Seeking Wisdom",
      description: "Ask the Flirt Coach for advice",
      icon: <Lightbulb className="text-amber-400" size={18} />,
      unlocked: false,
      rarity: "common",
    },
    {
      id: "all_stages",
      title: "Full Circle",
      description: "Complete all stages of a date",
      icon: <Medal className="text-emerald-400" size={18} />,
      unlocked: false,
      rarity: "epic",
    },
    {
      id: "rizz_master",
      title: "Rizz Master",
      description: "Unlock all other achievements",
      icon: <Trophy className="text-yellow-300" size={18} />,
      unlocked: false,
      progress: 0,
      maxProgress: 8,
      rarity: "legendary",
    },
  ]);

  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [showXpGain, setShowXpGain] = useState<{
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  // Add a constant for fallback image
  const FALLBACK_IMAGE_URL =
    "https://placehold.co/600x400/9333ea/ffffff?text=Date+Simulation+Image";

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

  // Fix image loading with timeout and better error handling
  useEffect(() => {
    if (simulationResult?.image_url) {
      setIsImageLoading(true);

      const img = new Image();

      // Set a 15-second timeout for image loading
      const loadingTimeout = setTimeout(() => {
        setIsImageLoading(false);
        toast.error("Image loading timed out. Using fallback image.", {
          id: "image-timeout",
        });
      }, 15000);

      img.onload = () => {
        clearTimeout(loadingTimeout);
        setIsImageLoading(false);
      };

      img.onerror = () => {
        clearTimeout(loadingTimeout);
        setIsImageLoading(false);
        toast.error("Failed to load image. Using fallback image.", {
          id: "image-error",
        });
      };

      img.src = simulationResult.image_url;

      return () => {
        clearTimeout(loadingTimeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      setIsImageLoading(false);
    }
  }, [simulationResult?.image_url]);

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
        toast("Failed to play audio");
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

  // Update the date stage based on interactions and mood
  const updateDateProgress = () => {
    // Base progression on mood and practice responses
    if (practiceResponses.length >= 2 && dateMood >= 6) {
      const newProgress = [...dateProgress];
      if (newProgress[1].status === "current") {
        newProgress[1].status = "completed";
        newProgress[2].status = "current";
      } else if (
        newProgress[2].status === "current" &&
        practiceResponses.length >= 4 &&
        dateMood >= 7
      ) {
        newProgress[2].status = "completed";
        newProgress[3].status = "current";
      } else if (
        newProgress[3].status === "current" &&
        practiceResponses.length >= 6 &&
        dateMood >= 8
      ) {
        newProgress[3].status = "completed";
        newProgress[4].status = "current";
      } else if (
        newProgress[4].status === "current" &&
        practiceResponses.length >= 8 &&
        dateMood >= 9
      ) {
        newProgress[4].status = "completed";

        // Show success message when reaching the end
        toast("Date completed successfully! 🎉", {
          description:
            "You've successfully navigated the entire date conversation!",
          icon: <Heart className="text-pink-500" size={18} />,
          duration: 5000,
        });
      }

      setDateProgress(newProgress);
    }
  };

  // Call updateDateProgress whenever practice responses or mood changes
  useEffect(() => {
    if (practiceResponses.length > 0) {
      updateDateProgress();
    }
  }, [practiceResponses, dateMood]);

  // Function to unlock an achievement
  const unlockAchievement = (id: string) => {
    const achievement = achievements.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
      // Mark achievement as unlocked
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, unlocked: true, date: new Date() } : a
        )
      );

      // Show achievement notification
      setShowAchievement(id);
      setTimeout(() => setShowAchievement(null), 3000);

      // Award XP based on rarity
      const xpValues = {
        common: 25,
        uncommon: 50,
        rare: 100,
        epic: 200,
        legendary: 500,
      };

      // Award XP with animation at center of screen
      const container = document.querySelector(".date-simulation-container");
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (container) {
        const rect = container.getBoundingClientRect();
        x = rect.width / 2;
        y = rect.height / 2;
      }

      addXP(xpValues[achievement.rarity], x, y);

      // Check if all achievements are unlocked
      const updatedAchievements = achievements.map((a) =>
        a.id === id ? { ...a, unlocked: true } : a
      );

      const unlockedCount = updatedAchievements.filter(
        (a) => a.id !== "rizz_master" && a.unlocked
      ).length;
      const totalAchievements = updatedAchievements.filter(
        (a) => a.id !== "rizz_master"
      ).length;

      // Update Rizz Master progress
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === "rizz_master" ? { ...a, progress: unlockedCount } : a
        )
      );

      // If all other achievements are unlocked, unlock Rizz Master
      if (unlockedCount === totalAchievements) {
        setTimeout(() => unlockAchievement("rizz_master"), 500);
      }

      // Show toast with achievement notification
      toast.success(`Achievement Unlocked: ${achievement.title}`, {
        icon: <Trophy className="text-yellow-400" />,
        duration: 4000,
        position: "top-center",
        className: "achievement-toast",
      });
    }
  };

  // Function to update achievement progress
  const updateAchievementProgress = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (
          a.id === id &&
          a.progress !== undefined &&
          a.maxProgress !== undefined
        ) {
          const newProgress = Math.min(a.progress + 1, a.maxProgress);
          // If progress is complete, unlock the achievement
          if (newProgress === a.maxProgress && !a.unlocked) {
            setTimeout(() => unlockAchievement(id), 100);
          }
          return { ...a, progress: newProgress };
        }
        return a;
      })
    );
  };

  // Function to add XP
  const addXP = (amount: number, x?: number, y?: number) => {
    // Ensure we have valid coordinates
    if (!x || !y) {
      const container = document.querySelector(".date-simulation-container");
      x = 50;
      y = 50;
      if (container) {
        const rect = container.getBoundingClientRect();
        x = Math.random() * (rect.width - 100) + 50;
        y = Math.random() * (rect.height - 100) + 50;
      }
    }

    const newXP = userXP + amount;
    setUserXP(newXP);

    // Show XP gain animation
    setShowXpGain({ amount, x, y });
    setTimeout(() => setShowXpGain(null), 1500);

    // Level up if needed
    if (newXP >= xpToNextLevel) {
      setUserLevel((prev) => prev + 1);
      setUserXP(newXP - xpToNextLevel);
      setXpToNextLevel((prev) => Math.floor(prev * 1.5));

      // Create floating emojis for level up
      const container = document.querySelector(".date-simulation-container");
      if (container) {
        for (let i = 0; i < 5; i++) {
          const emoji = document.createElement("div");
          emoji.className = "emoji-float";
          emoji.textContent = ["🎉", "🥳", "🚀", "⭐", "🔥"][
            Math.floor(Math.random() * 5)
          ];
          emoji.style.left = `${Math.random() * 80 + 10}%`;
          emoji.style.bottom = "10%";
          container.appendChild(emoji);

          // Remove after animation completes
          setTimeout(() => {
            emoji.remove();
          }, 3000);
        }
      }

      toast.success(`Level Up! You're now level ${userLevel + 1}`, {
        description: `+${amount} XP | Next level: ${xpToNextLevel} XP`,
        icon: <Zap className="text-yellow-400" />,
        duration: 5000,
      });
    }
  };

  // Override practice toggle to add XP
  const handlePracticeToggle = () => {
    setPracticeMode(!practiceMode);
    if (!practiceMode) {
      // Add random XP when enabling practice mode
      const randomXP = Math.floor(Math.random() * 10) + 5;
      addXP(randomXP);
    }
  };

  // Handle practice submit - override with XP rewards
  const handlePracticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userResponse.trim()) return;

    // Generate random score 1-10 weighted toward middle values
    let randomScore = Math.floor(Math.random() * 10) + 1;
    // Slightly improved random generation based on response length
    if (userResponse.length > 20) {
      randomScore = Math.min(10, randomScore + 1);
    }
    if (userResponse.length > 50) {
      randomScore = Math.min(10, randomScore + 1);
    }

    // Randomly spike the score occasionally for excitement
    if (Math.random() > 0.8) {
      randomScore = Math.min(10, randomScore + 2);
    }

    // Get random client coords for XP animation
    const container = document.querySelector(".date-simulation-container");
    let x = 50,
      y = 50;
    if (container) {
      const rect = container.getBoundingClientRect();
      x = Math.random() * (rect.width - 100) + 50;
      y = Math.random() * (rect.height - 100) + 50;
    }

    // Add XP based on score (better responses give more XP)
    const xpAmount = 5 + randomScore * 2;
    addXP(xpAmount, x, y);

    // Update practice responses
    setPracticeResponses([
      ...practiceResponses,
      {
        text: userResponse,
        score: randomScore,
      },
    ]);

    // Update mood based on score
    const moodChange = Math.floor((randomScore - 5) / 2);
    const newMood = Math.min(Math.max(dateMood + moodChange, 0), 10);
    setDateMood(newMood);

    // Add to mood history
    setMoodHistory([
      ...moodHistory,
      {
        response: userResponse,
        mood: newMood,
      },
    ]);

    // Update date progress based on responses count
    updateDateProgress();

    // Clear the input
    setUserResponse("");

    // Show toast with feedback based on score
    if (randomScore >= 8) {
      toast("Great response! " + randomScore + "/10", {
        description: "You're making an excellent impression!",
        icon: <Star className="text-yellow-400" />,
      });
    } else if (randomScore >= 5) {
      toast("Solid response! " + randomScore + "/10", {
        description: "Your date seems to appreciate your effort.",
        icon: <ThumbsUp className="text-blue-400" />,
      });
    } else {
      toast("That was a bit awkward...", {
        description: randomScore + "/10. Try something different.",
        icon: <ThumbsDown className="text-red-400" />,
      });
    }
  };

  // Get mood icon and text
  const getMoodDetails = (mood: number) => {
    if (mood >= 8)
      return {
        icon: <Smile className="text-green-400" />,
        text: "Very Interested",
        color: "text-green-400",
      };
    if (mood >= 6)
      return {
        icon: <ThumbsUp className="text-blue-400" />,
        text: "Interested",
        color: "text-blue-400",
      };
    if (mood >= 4)
      return {
        icon: <Sparkles className="text-yellow-400" />,
        text: "Neutral",
        color: "text-yellow-400",
      };
    if (mood >= 2)
      return {
        icon: <ThumbsDown className="text-orange-400" />,
        text: "Disinterested",
        color: "text-orange-400",
      };
    return {
      icon: <Frown className="text-red-400" />,
      text: "Ready to Leave",
      color: "text-red-400",
    };
  };

  // Start/stop voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorder?.stop();
      setIsRecording(false);
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);

        // Generate voice response score and award XP
        const randomScore = Math.floor(Math.random() * 4) + 6; // Random score between 6-9
        const xpAmount = 10 + randomScore * 3; // More XP for voice responses

        // Get random position for XP animation
        const container = document.querySelector(".date-simulation-container");
        let x = 50,
          y = 50;
        if (container) {
          const rect = container.getBoundingClientRect();
          x = Math.random() * (rect.width - 100) + 50;
          y = Math.random() * (rect.height - 100) + 50;
        }
        addXP(xpAmount, x, y);

        // Update practice responses with voice entry
        setPracticeResponses([
          ...practiceResponses,
          {
            text: "Voice Response",
            score: randomScore,
          },
        ]);

        // Update mood based on score
        const moodChange = Math.floor((randomScore - 5) / 2);
        const newMood = Math.min(Math.max(dateMood + moodChange, 0), 10);
        setDateMood(newMood);

        // Add to mood history
        setMoodHistory([
          ...moodHistory,
          {
            response: "Voice Response",
            mood: newMood,
          },
        ]);

        toast("Voice response scored: " + randomScore + "/10", {
          description:
            "Voice responses are harder to evaluate but help build confidence!",
          icon: <Mic className="text-pink-400" />,
        });

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      recorder.start();
      setIsRecording(true);
      toast("Recording your voice...", {
        icon: <Mic className="text-red-400 animate-pulse" />,
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast("Couldn't access microphone. Please check permissions.");
    }
  };

  // Handle coach input submission
  const handleCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim()) return;

    // Add user message
    const userMessage = coachInput.trim();
    setCoachResponses([...coachResponses, { type: "user", text: userMessage }]);
    setCoachInput("");
    setIsCoachTyping(true);

    // Award small XP for asking coach questions
    const xpAmount = 5;
    addXP(xpAmount);

    // Simulate AI response with predefined coaching responses
    setTimeout(() => {
      let response = "";

      if (
        userMessage.toLowerCase().includes("opener") ||
        userMessage.toLowerCase().includes("start") ||
        userMessage.toLowerCase().includes("first message")
      ) {
        response =
          "Great openers show you've paid attention to their profile. Try something specific like 'I noticed you love hiking, have you been to [specific trail]?' instead of generic 'hey'. Personalized openers get 30% more responses!";
      } else if (
        userMessage.toLowerCase().includes("confident") ||
        userMessage.toLowerCase().includes("confidence")
      ) {
        response =
          "Confidence isn't about being perfect! It's about comfortable vulnerability. Try power posing for 2 minutes before dates, maintain good posture, and focus on asking questions rather than impressing - this shifts attention away from your nerves.";
      } else if (
        userMessage.toLowerCase().includes("awkward") ||
        userMessage.toLowerCase().includes("silence")
      ) {
        response =
          "Embrace brief silences - they're natural! Prepare 3-5 open-ended questions in advance. Try the 'past, present, future' technique: ask about their day (present), childhood memories (past), and goals (future). This creates depth naturally.";
      } else if (
        userMessage.toLowerCase().includes("compliment") ||
        userMessage.toLowerCase().includes("flattery")
      ) {
        response =
          "The best compliments are specific and behavior-based rather than appearance-only. 'I love how passionate you sound when talking about your work' means more than 'you look nice'. Aim for thoughtful observations over generic praise.";
      } else if (
        userMessage.toLowerCase().includes("text") ||
        userMessage.toLowerCase().includes("message")
      ) {
        response =
          "For messaging, the 'ping-pong' rule works well - match their energy and text length. If they write a paragraph, respond similarly. For timing, aim to respond within a similar timeframe to their responses, neither too eager nor too distant.";
      } else if (
        userMessage.toLowerCase().includes("joke") ||
        userMessage.toLowerCase().includes("humor") ||
        userMessage.toLowerCase().includes("funny")
      ) {
        response =
          "Self-deprecating humor in small doses shows confidence, while observational humor about shared experiences creates bonds. Avoid controversial topics or jokes at others' expense. A simple 'Did you see that...' about something in your environment can work well.";
      } else if (
        userMessage.toLowerCase().includes("body language") ||
        userMessage.toLowerCase().includes("nonverbal")
      ) {
        response =
          "Maintain comfortable eye contact (70% of the time), face them directly, and mirror their posture subtly. Leaning slightly forward shows interest. Keep your arms uncrossed and hands visible. Genuine smiles reach your eyes - think of something that actually makes you happy!";
      } else if (
        userMessage.toLowerCase().includes("question") ||
        userMessage.toLowerCase().includes("ask")
      ) {
        response =
          "Use the FORD technique: Family, Occupation, Recreation, Dreams. These topics generally yield engaging conversations. Follow-up questions show you're listening - 'What did you enjoy most about that?' after they share an experience works wonders.";
      } else if (
        userMessage.toLowerCase().includes("second date") ||
        userMessage.toLowerCase().includes("another date") ||
        userMessage.toLowerCase().includes("next time")
      ) {
        response =
          "When asking for a second date, be specific but flexible. 'I'd love to check out that jazz bar you mentioned. Are you free next weekend?' is better than 'We should hang out again sometime.' Specific plans show genuine interest and intent.";
      } else {
        response =
          "That's a great question about dating! My suggestion is to be authentic while putting your best foot forward. Focus on creating genuine connection by asking open-ended questions and actively listening to their responses. What specific aspect of this would you like me to elaborate on?";
      }

      setCoachResponses([
        ...coachResponses,
        { type: "user", text: userMessage },
        { type: "coach", text: response },
      ]);
      setIsCoachTyping(false);
    }, 1500); // Simulate AI thinking time
  };

  // Check for achievements after certain actions
  useEffect(() => {
    // Check for first practice response
    if (
      practiceResponses.length === 1 &&
      !achievements.find((a) => a.id === "first_practice")?.unlocked
    ) {
      unlockAchievement("first_practice");
    }

    // Check for practice streak
    if (practiceResponses.length > 0) {
      updateAchievementProgress("practice_streak");
    }

    // Check for perfect score
    if (
      practiceResponses.some((r) => r.score === 10) &&
      !achievements.find((a) => a.id === "perfect_score")?.unlocked
    ) {
      unlockAchievement("perfect_score");
    }

    // Check for highest mood
    if (
      dateMood === 10 &&
      !achievements.find((a) => a.id === "mood_master")?.unlocked
    ) {
      unlockAchievement("mood_master");
    }

    // Check for all stages completed
    if (
      dateProgress.every((stage) => stage.status === "completed") &&
      !achievements.find((a) => a.id === "all_stages")?.unlocked
    ) {
      unlockAchievement("all_stages");
    }
  }, [practiceResponses, dateMood, dateProgress]);

  // Check for timeline explorer achievement
  useEffect(() => {
    if (
      showTimeline &&
      !achievements.find((a) => a.id === "timeline_explorer")?.unlocked
    ) {
      unlockAchievement("timeline_explorer");
    }
  }, [showTimeline]);

  // Check for coach consultation achievement
  useEffect(() => {
    if (
      showCoach &&
      !achievements.find((a) => a.id === "coach_consultation")?.unlocked
    ) {
      unlockAchievement("coach_consultation");
    }
  }, [showCoach]);

  // Check for voice response achievement
  useEffect(() => {
    if (
      recordedAudio &&
      !achievements.find((a) => a.id === "voice_response")?.unlocked
    ) {
      unlockAchievement("voice_response");
    }
  }, [recordedAudio]);

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
    toast("Image downloaded successfully");
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

  // Add level indicator to UI
  const renderLevelIndicator = () => (
    <div className="flex items-center gap-2 text-xs">
      <div className="relative">
        <div className="w-20 progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(userXP / xpToNextLevel) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Lvl {userLevel}</span>
          <span>
            {userXP}/{xpToNextLevel} XP
          </span>
        </div>
      </div>
    </div>
  );

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
            {isImageLoading ? (
              // Loading state for full screen view
              <div className="flex flex-col items-center justify-center bg-gray-900/50 p-20 rounded-lg border border-purple-800/30">
                <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-purple-300 text-md animate-pulse">
                  Creating your high-quality date image...
                </p>
                <p className="text-purple-200/60 text-sm mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : (
              <ImageWithFallback
                src={simulationResult.image_url || FALLBACK_IMAGE_URL}
                alt="Date scenario full view"
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              />
            )}
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
              toast("Audio playback error");
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
            <Button
              onClick={() => setShowTimeline(!showTimeline)}
              size="sm"
              variant={showTimeline ? "default" : "ghost"}
              className={`h-8 p-0 px-2 rounded-full hover:bg-yellow-900/30 flex items-center gap-1 ${
                showTimeline ? "bg-yellow-900/40 text-yellow-300" : ""
              }`}
              title="View Date Timeline"
            >
              <Clock
                size={14}
                className={showTimeline ? "text-yellow-300" : "text-yellow-400"}
              />
              <span className="text-xs">Timeline</span>
            </Button>
            <Button
              onClick={() => setPracticeMode(!practiceMode)}
              size="sm"
              variant={practiceMode ? "default" : "ghost"}
              className={`h-8 p-0 px-2 rounded-full hover:bg-green-900/30 flex items-center gap-1 ${
                practiceMode ? "bg-green-900/40 text-green-300" : ""
              }`}
              title="Practice responding"
            >
              <MessageSquare
                size={14}
                className={practiceMode ? "text-green-300" : "text-green-400"}
              />
              <span className="text-xs">Practice</span>
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
            <Button
              onClick={() => setShowCoach(!showCoach)}
              size="sm"
              variant={showCoach ? "default" : "ghost"}
              className={`h-8 p-0 px-2 rounded-full hover:bg-orange-900/30 flex items-center gap-1 ${
                showCoach ? "bg-orange-900/40 text-orange-300" : ""
              }`}
              title="Get Flirt Coaching"
            >
              <Lightbulb
                size={14}
                className={showCoach ? "text-orange-300" : "text-orange-400"}
              />
              <span className="text-xs">Coach</span>
            </Button>
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
                {isImageLoading ? (
                  // Loading state with spinner and placeholder
                  <div className="flex flex-col items-center justify-center bg-gray-900/50 p-10 h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-purple-300 text-sm animate-pulse">
                      Generating your date scene...
                    </p>
                  </div>
                ) : (
                  // Actual image when loaded
                  <ImageWithFallback
                    src={simulationResult.image_url || FALLBACK_IMAGE_URL}
                    alt="Date scenario visualization"
                    className="w-full h-auto object-cover transition-all duration-300"
                  />
                )}
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
              {practiceMode && (
                <Button
                  onClick={() => setShowTips(!showTips)}
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-xs text-purple-300 hover:text-purple-200"
                >
                  {showTips ? "Hide Tips" : "Show Tips"}
                </Button>
              )}
            </div>

            {activeTab === "conversation" ? (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 shadow-md"
                >
                  <div className="max-h-[260px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
                    {dialogue}

                    {practiceResponses.map((response, idx) => (
                      <motion.div
                        key={`practice-${idx}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-blue-900/30 border-blue-800/40 hover:bg-blue-900/40 border mb-3 transition-colors duration-200"
                      >
                        <div className="flex justify-between">
                          <p className="text-blue-300">
                            You (practice): {response.text}
                          </p>
                          <span
                            className={`${
                              response.score >= 8
                                ? "text-green-400"
                                : response.score >= 6
                                ? "text-yellow-400"
                                : "text-red-400"
                            } text-xs font-bold`}
                          >
                            {response.score}/10
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {practiceMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {/* Mood tracker */}
                    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Heart className="text-pink-400" size={16} />
                        <span className="text-sm text-gray-300">
                          Date's Mood:
                        </span>
                        <div className="flex items-center gap-1">
                          {getMoodDetails(dateMood).icon}
                          <span
                            className={`text-sm font-medium ${
                              getMoodDetails(dateMood).color
                            }`}
                          >
                            {getMoodDetails(dateMood).text}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-purple-300 hover:text-purple-200"
                        onClick={() => setShowMoodTracker(!showMoodTracker)}
                      >
                        {showMoodTracker ? "Hide History" : "Show History"}
                      </Button>
                    </div>

                    {/* Mood history */}
                    {showMoodTracker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-gray-800/30 rounded-lg border border-gray-700/40 p-3 max-h-32 overflow-y-auto custom-scrollbar"
                      >
                        <h4 className="text-sm text-gray-400 mb-2">
                          Mood History
                        </h4>
                        {moodHistory.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">
                            No responses yet
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {moodHistory.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs"
                              >
                                <div className="truncate max-w-[80%]">
                                  <span className="text-gray-400">You: </span>
                                  <span className="text-gray-300">
                                    {item.response}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {getMoodDetails(item.mood).icon}
                                  <span
                                    className={`${
                                      getMoodDetails(item.mood).color
                                    }`}
                                  >
                                    {item.mood}/10
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Voice mode toggle */}
                    <div className="flex justify-center">
                      <div
                        className="inline-flex rounded-md shadow-sm"
                        role="group"
                      >
                        <button
                          type="button"
                          onClick={() => setVoiceMode(false)}
                          className={`px-4 py-2 text-xs font-medium rounded-l-lg border ${
                            !voiceMode
                              ? "text-purple-300 bg-purple-900/30 border-purple-700/50"
                              : "text-gray-400 bg-gray-800/30 border-gray-700/50 hover:text-purple-300 hover:bg-purple-900/20"
                          }`}
                        >
                          <MessageSquare size={14} className="inline mr-1" />
                          Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoiceMode(true)}
                          className={`px-4 py-2 text-xs font-medium rounded-r-lg border ${
                            voiceMode
                              ? "text-pink-300 bg-pink-900/30 border-pink-700/50"
                              : "text-gray-400 bg-gray-800/30 border-gray-700/50 hover:text-pink-300 hover:bg-pink-900/20"
                          }`}
                        >
                          <Mic size={14} className="inline mr-1" />
                          Voice
                        </button>
                      </div>
                    </div>

                    {/* Tips */}
                    {showTips && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg text-sm text-purple-200"
                      >
                        <h4 className="font-medium mb-1">Quick Tips:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                          <li>Be confident but authentic</li>
                          <li>Ask open-ended questions</li>
                          <li>Show genuine interest in their responses</li>
                          <li>Use humor appropriately</li>
                          <li>
                            Maintain positive body language (smile, eye contact)
                          </li>
                          {voiceMode && (
                            <>
                              <li>Speak clearly and at a moderate pace</li>
                              <li>Vary your tone to show enthusiasm</li>
                              <li>
                                Take brief pauses to show you're thoughtful
                              </li>
                            </>
                          )}
                        </ul>
                      </motion.div>
                    )}

                    {/* Input options based on mode */}
                    {voiceMode ? (
                      <div className="flex flex-col items-center gap-3">
                        {recordedAudio && (
                          <div className="w-full bg-gray-800/40 rounded-lg p-3 border border-gray-700/50 flex items-center justify-between">
                            <span className="text-sm text-gray-300">
                              Your recorded response:
                            </span>
                            <audio
                              src={recordedAudio}
                              controls
                              className="h-8 w-48"
                            />
                          </div>
                        )}

                        <Button
                          onClick={toggleRecording}
                          className={`${
                            isRecording
                              ? "bg-red-700 hover:bg-red-600"
                              : "bg-pink-700 hover:bg-pink-600"
                          } 
                            flex items-center gap-2 px-4`}
                        >
                          {isRecording ? (
                            <>
                              <StopCircle size={16} className="animate-pulse" />
                              <span>Stop Recording</span>
                            </>
                          ) : (
                            <>
                              <Mic size={16} />
                              <span>Record Response</span>
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handlePracticeSubmit}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={userResponse}
                          onChange={(e) => setUserResponse(e.target.value)}
                          placeholder="Practice your response..."
                          className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-purple-700 hover:bg-purple-600"
                        >
                          Send
                        </Button>
                      </form>
                    )}
                  </motion.div>
                )}
              </div>
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

      {/* Date Timeline Modal */}
      {showTimeline && (
        <div className="p-4 bg-gray-900/60 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <Clock size={16} />
              Date Conversation Timeline
            </h3>
            <Button
              onClick={() => setShowTimeline(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-full"
            >
              <X size={16} className="text-gray-400" />
            </Button>
          </div>

          <div className="relative">
            {/* Timeline track */}
            <div className="absolute top-5 left-6 h-full w-[2px] bg-gray-700/60" />

            {/* Timeline stages */}
            <div className="space-y-8 ml-2">
              {dateProgress.map((stage, index) => (
                <div key={index} className="relative flex items-start gap-3">
                  <div
                    className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      stage.status === "completed"
                        ? "bg-green-900/50 border-green-500 text-green-300"
                        : stage.status === "current"
                        ? "bg-yellow-900/50 border-yellow-500 text-yellow-300 animate-pulse"
                        : "bg-gray-800/50 border-gray-600 text-gray-400"
                    }`}
                  >
                    {stage.status === "completed" ? (
                      <Check size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div
                    className={`pt-1 ${
                      stage.status === "completed"
                        ? "text-green-300"
                        : stage.status === "current"
                        ? "text-yellow-300"
                        : "text-gray-400"
                    }`}
                  >
                    <h4 className="text-sm font-medium">{stage.stage}</h4>
                    <p className="text-xs mt-1 max-w-64">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-xs text-center text-gray-400">
            Progress through the date by practicing your responses and
            maintaining a positive mood.
          </div>
        </div>
      )}

      {/* Flirt Coach Modal */}
      {showCoach && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-b border-gray-700/50"
        >
          <div className="p-4 bg-gradient-to-r from-orange-900/10 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-orange-300 flex items-center gap-2">
                <Lightbulb size={16} />
                Flirt Coach AI Assistant
              </h3>
              <Button
                onClick={() => setShowCoach(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 rounded-full"
              >
                <X size={16} className="text-gray-400" />
              </Button>
            </div>

            <div className="h-64 overflow-y-auto bg-gray-900/40 rounded-lg border border-gray-700/50 p-3 mb-3 custom-scrollbar">
              {coachResponses.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-3 ${msg.type === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.type === "user"
                        ? "bg-purple-900/30 text-purple-100"
                        : "bg-orange-900/30 text-orange-100"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isCoachTyping && (
                <div className="mb-3">
                  <div className="inline-block max-w-[80%] p-3 rounded-lg bg-orange-900/30 text-orange-100">
                    <div className="flex gap-1 items-center">
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleCoachSubmit} className="flex gap-2">
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Ask for flirting advice..."
                className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                disabled={isCoachTyping}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isCoachTyping}
                className="bg-orange-700 hover:bg-orange-600 text-white px-3"
              >
                <Send size={14} />
              </Button>
            </form>

            <div className="mt-3 text-xs text-center text-gray-400">
              Popular topics: openers, confidence, body language, questions,
              second date
            </div>
          </div>
        </motion.div>
      )}

      {/* XP gain animation */}
      {showXpGain && (
        <div
          className="xp-gain absolute text-sm font-bold text-yellow-300"
          style={{
            left: `${showXpGain.x}px`,
            top: `${showXpGain.y}px`,
          }}
        >
          +{showXpGain.amount} XP
        </div>
      )}
    </>
  );
};
