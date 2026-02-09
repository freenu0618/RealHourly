"use client";

import { useState, useEffect } from "react";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/lib/hooks/use-audio-recorder";
import { cn } from "@/lib/utils";

const WARNING_THRESHOLD = 100; // seconds

interface VoiceInputProps {
  onTranscribed: (text: string) => void;
  disabled?: boolean;
}

type VoiceState = "idle" | "recording" | "transcribing" | "error";

export function VoiceInput({ onTranscribed, disabled }: VoiceInputProps) {
  const t = useTranslations("timeLog");
  const {
    isRecording,
    duration,
    audioBlob,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync recorder error to UI
  useEffect(() => {
    if (recorderError === "PERMISSION_DENIED") {
      setVoiceState("error");
      setErrorMessage(t("voicePermissionDenied"));
    } else if (recorderError) {
      setVoiceState("error");
      setErrorMessage(t("voiceNetworkError"));
    }
  }, [recorderError, t]);

  // Auto-transcribe when recording stops and blob is available
  useEffect(() => {
    if (!isRecording && audioBlob && voiceState === "recording") {
      handleTranscribe(audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, audioBlob]);

  async function handleTranscribe(blob: Blob) {
    setVoiceState("transcribing");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/time/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        const code = data?.error?.code;
        if (code === "EMPTY_TRANSCRIPTION" || code === "EMPTY_AUDIO") {
          setVoiceState("error");
          setErrorMessage(t("voiceNoSpeech"));
          return;
        }
        throw new Error(data?.error?.message ?? "Transcription failed");
      }

      const { data } = await res.json();
      toast.success(t("voiceSuccess"));
      onTranscribed(data.text);
      setVoiceState("idle");
      resetRecording();
    } catch {
      setVoiceState("error");
      setErrorMessage(t("voiceTranscribeFailed"));
    }
  }

  function handleStart() {
    setVoiceState("recording");
    setErrorMessage(null);
    startRecording();
  }

  function handleStop() {
    stopRecording();
    // voiceState stays "recording" until the blob triggers transcription
  }

  function handleRetry() {
    resetRecording();
    setVoiceState("idle");
    setErrorMessage(null);
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // Idle state: mic button
  if (voiceState === "idle") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleStart}
        disabled={disabled}
        aria-label={t("voiceRecord")}
        className="size-10 shrink-0 rounded-full border-muted-foreground/30 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
      >
        <Mic className="size-4" />
      </Button>
    );
  }

  // Recording state
  if (voiceState === "recording") {
    return (
      <div className="flex items-center gap-2">
        {/* Pulsing mic indicator */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-10 animate-ping rounded-full bg-red-400/30" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleStop}
            aria-label={t("voiceStop")}
            className="relative size-10 rounded-full"
          >
            <Square className="size-3.5" />
          </Button>
        </div>

        {/* Duration + waveform */}
        <div className="flex items-center gap-2">
          <span className="min-w-[3ch] text-sm font-medium tabular-nums text-destructive">
            {formatTime(duration)}
          </span>

          {/* Simple waveform bars */}
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-0.5 rounded-full bg-destructive/70",
                  "animate-bounce",
                )}
                style={{
                  height: `${8 + Math.random() * 12}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>

          {duration >= WARNING_THRESHOLD && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {t("voiceMaxSoon")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Transcribing state
  if (voiceState === "transcribing") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>{t("voiceTranscribing")}</span>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span>{errorMessage}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRetry}
        className="text-xs"
      >
        {t("voiceRecordAgain")}
      </Button>
    </div>
  );
}
