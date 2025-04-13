"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

export const VoiceRecorder = ({
  onTranscription,
  isProcessing,
  setIsProcessing,
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        setAudioBlob(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start a timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append("file", audioBlob, "recording.mp3");

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const data = await response.json();
      onTranscription(data.text);
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to process speech. Please try again.");
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
    }
  };

  useEffect(() => {
    if (audioBlob && !isRecording) {
      uploadAudio();
    }
  }, [audioBlob, isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 bg-red-950/30 px-3 py-1.5 rounded-full border border-red-500/30 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs text-red-400">
              {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            onClick={stopRecording}
            size="sm"
            className="rounded-full w-8 h-8 p-0 bg-red-600 hover:bg-red-700 border-none"
            aria-label="Stop recording"
          >
            <Square size={12} />
          </Button>
        </>
      ) : isProcessing ? (
        <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-700/50">
          <Loader2 size={14} className="animate-spin text-purple-400" />
          <span className="text-xs text-gray-400">Transcribing...</span>
        </div>
      ) : (
        <Button
          onClick={startRecording}
          size="sm"
          className="rounded-full flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-none"
          aria-label="Start recording"
        >
          <Mic size={14} />
          <span className="text-xs">Speak</span>
        </Button>
      )}
    </div>
  );
};
