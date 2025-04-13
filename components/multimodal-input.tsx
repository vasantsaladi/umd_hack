"use client";

import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import type React from "react";
import {
  useRef,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

import { cn, sanitizeUIMessages } from "@/lib/utils";

import { ArrowUpIcon, StopIcon } from "./icons";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VoiceRecorder } from "./voice-recorder";
import { ImageIcon, Volume2 } from "lucide-react";
import { useMusic } from "@/lib/music-context";
import { Checkbox } from "./ui/checkbox";

const suggestedActions = [
  {
    title: "Evaluate my rizz",
    label: "Are you a library book? Because I'm checking you out!",
    action:
      "Evaluate my rizz: Are you a library book? Because I'm checking you out!",
  },
  {
    title: "Interactive date simulation",
    label: "Hi, I noticed you like coffee too. Mind if I join you?",
    action:
      "Simulate a date with this opener: Hi, I noticed you like coffee too. Mind if I join you?",
  },
  {
    title: "Try voice interaction",
    label: "Speak: Hi there! How's your day going?",
    action: "speak: Hi there! How's your day going?",
  },
  {
    title: "Generate an image",
    label: "Create an image of a romantic dinner conversation",
    action:
      "Generate an image of a romantic dinner conversation with good flirting",
  },
];

const contextOptions = [
  { value: "casual conversation", label: "Casual Conversation" },
  { value: "dating app", label: "Dating App" },
  { value: "bar", label: "Bar/Club" },
  { value: "workplace", label: "Workplace" },
  { value: "social media", label: "Social Media" },
  { value: "restaurant", label: "Restaurant" },
  { value: "coffee shop", label: "Coffee Shop" },
  { value: "park", label: "Park" },
  { value: "movie theater", label: "Movie Theater" },
];

export function MultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [selectedContext, setSelectedContext] = useState("casual conversation");
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [useAdvancedModel, setUseAdvancedModel] = useState(false);
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isAudioProcessing, setIsAudioProcessing] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const { pauseDuringAction, resumeAfterAction } = useMusic();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    // Show context selector if the input contains keywords related to rizz evaluation
    const rizzKeywords = [
      "rizz",
      "pickup",
      "flirt",
      "evaluate",
      "rate",
      "dating",
      "date",
      "simulate",
    ];
    setShowContextSelector(
      rizzKeywords.some((keyword) => input.toLowerCase().includes(keyword))
    );

    // Show voice selector if the input contains keywords related to voice
    const voiceKeywords = [
      "voice",
      "speak",
      "say",
      "talk",
      "audio",
      "text to speech",
      "tts",
    ];
    setShowVoiceSelector(
      voiceKeywords.some((keyword) => input.toLowerCase().includes(keyword))
    );

    // Show image generation option if input mentions image generation
    const imageKeywords = [
      "picture",
      "image",
      "visualization",
      "visualize",
      "generate image",
      "create image",
    ];
    setShowImageGen(
      imageKeywords.some((keyword) => input.toLowerCase().includes(keyword))
    );
  }, [input]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 2
      }px`;
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const handleAudioTranscription = (text: string) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
      adjustHeight();
    }
  };

  const generateImage = () => {
    const imageContent = `Generate an image visualization for: ${input} (Context: ${selectedContext})`;
    setInput("");
    append({
      role: "user",
      content: imageContent,
    });
  };

  const voiceOptions = [
    { value: "alloy", label: "Alloy (Neutral)" },
    { value: "echo", label: "Echo (Deep)" },
    { value: "fable", label: "Fable (Storytelling)" },
    { value: "onyx", label: "Onyx (Professional)" },
    { value: "nova", label: "Nova (Feminine)" },
    { value: "shimmer", label: "Shimmer (Cheerful)" },
  ];

  const generateSpeech = async (
    text: string,
    voice: string = selectedVoice
  ) => {
    try {
      // Pause background music while TTS is playing
      pauseDuringAction();

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice,
          use_advanced_model: useAdvancedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();

      if (data.audio_base64) {
        // If there's an existing audio element playing, stop it
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create an audio element and play it
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
        audioRef.current = audio;

        // Add event listener to resume background music when TTS finishes
        audio.onended = () => {
          audioRef.current = null;
          resumeAfterAction();
        };

        // Add event listener for audio errors
        audio.onerror = () => {
          console.error("Error playing TTS audio");
          audioRef.current = null;
          resumeAfterAction();
        };

        audio.play().catch((error) => {
          console.error("Error playing TTS:", error);
          resumeAfterAction();
        });
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      toast.error("Failed to generate speech. Please try again.");
      resumeAfterAction();
    }
  };

  const submitForm = useCallback(() => {
    // Add context to input if it's a rizz evaluation or date simulation
    let finalInput = input;
    const rizzKeywords = [
      "rizz",
      "pickup",
      "flirt",
      "evaluate",
      "rate",
      "dating",
      "date",
      "simulate",
    ];

    // Check if this is a speech generation command
    const speechRegex = /^(?:speak|say|voice|tts):\s*(.*)/i;
    const speechMatch = input.match(speechRegex);

    if (speechMatch && speechMatch[1]) {
      // Text-to-speech command detected
      const textToSpeak = speechMatch[1];
      generateSpeech(textToSpeak);
      setLocalStorageInput("");
      setInput("");
      return;
    }

    if (rizzKeywords.some((keyword) => input.toLowerCase().includes(keyword))) {
      finalInput = `${input} (Context: ${selectedContext})`;
    }

    const modifiedSubmit = (
      e?: { preventDefault?: () => void },
      options?: ChatRequestOptions
    ) => {
      append(
        {
          role: "user",
          content: finalInput,
        },
        options
      );
    };

    modifiedSubmit(undefined, {});
    setLocalStorageInput("");
    setInput("");

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    selectedContext,
    selectedVoice,
    append,
    setInput,
    setLocalStorageInput,
    width,
    generateSpeech,
  ]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 && (
        <div className="grid sm:grid-cols-2 gap-2 w-full">
          {suggestedActions.map((suggestedAction, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.05 * index }}
              key={`suggested-action-${suggestedAction.title}-${index}`}
              className="block"
            >
              <Button
                variant="ghost"
                onClick={async () => {
                  append({
                    role: "user",
                    content:
                      suggestedAction.action + ` (Context: ${selectedContext})`,
                  });
                }}
                className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
              >
                <span className="font-medium">{suggestedAction.title}</span>
                <span className="text-muted-foreground">
                  {suggestedAction.label}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {showContextSelector && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <Label className="text-xs text-muted-foreground">
                  Context:
                </Label>
                <Select
                  value={selectedContext}
                  onValueChange={setSelectedContext}
                >
                  <SelectTrigger className="h-7 text-xs bg-background border-pink-500/20 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contextOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {showVoiceSelector && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 ml-2"
              >
                <Label className="text-xs text-muted-foreground">Voice:</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="h-7 text-xs bg-background border-purple-500/20 w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="advanced-model"
                    checked={useAdvancedModel}
                    onCheckedChange={(checked: boolean) =>
                      setUseAdvancedModel(checked)
                    }
                    className="h-3 w-3"
                  />
                  <Label
                    htmlFor="advanced-model"
                    className="text-xs cursor-pointer text-muted-foreground"
                  >
                    Advanced AI voice
                  </Label>
                </div>
              </motion.div>
            )}
          </div>

          <VoiceRecorder
            onTranscription={handleAudioTranscription}
            isProcessing={isAudioProcessing}
            setIsProcessing={setIsAudioProcessing}
          />
        </div>

        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type your pickup line, flirting message, or try 'speak: hello' to hear TTS..."
            value={input}
            onChange={handleInput}
            className={cn(
              "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl !text-base bg-muted pr-16",
              className
            )}
            rows={3}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();

                if (isLoading) {
                  toast.error(
                    "Please wait for the model to finish its response!"
                  );
                } else {
                  submitForm();
                }
              }
            }}
          />

          <div className="absolute right-2 bottom-2 flex gap-1.5">
            {showVoiceSelector && (
              <Button
                className="rounded-full p-1.5 h-fit border dark:border-zinc-600 bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  const speechRegex = /^(?:speak|say|voice|tts):\s*(.*)/i;
                  const speechMatch = input.match(speechRegex);

                  if (speechMatch && speechMatch[1]) {
                    generateSpeech(speechMatch[1]);
                  } else if (input.trim()) {
                    generateSpeech(input);
                  } else {
                    toast.info("Please enter text to speak");
                  }
                }}
                disabled={isLoading || input.length === 0}
                title="Generate speech from this text"
              >
                <Volume2 size={14} />
              </Button>
            )}

            {showImageGen && (
              <Button
                className="rounded-full p-1.5 h-fit border dark:border-zinc-600 bg-purple-600 hover:bg-purple-700"
                onClick={generateImage}
                disabled={isLoading || input.length === 0}
                title="Generate image from this prompt"
              >
                <ImageIcon size={14} />
              </Button>
            )}

            {isLoading ? (
              <Button
                className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
                onClick={(event) => {
                  event.preventDefault();
                  stop();
                  setMessages((messages) => sanitizeUIMessages(messages));
                }}
              >
                <StopIcon size={14} />
              </Button>
            ) : (
              <Button
                className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
                onClick={(event) => {
                  event.preventDefault();
                  submitForm();
                }}
                disabled={input.length === 0}
              >
                <ArrowUpIcon size={14} />
              </Button>
            )}
          </div>
        </div>

        {(showVoiceSelector || showContextSelector) && (
          <div className="text-xs text-muted-foreground mt-1">
            {showVoiceSelector &&
              "Tip: Type 'speak: your message' to generate speech directly."}
            {showVoiceSelector && showContextSelector && " • "}
            {showContextSelector &&
              "Date simulations now include audio responses!"}
          </div>
        )}
      </div>
    </div>
  );
}
