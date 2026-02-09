"use client";

import { useTranslations } from "next-intl";
import type { Step } from "@/lib/hooks/use-step-loader";

interface StepLoaderProps {
  currentStep: Step | null;
  currentIndex: number;
  progress: number;
  namespace: string;
}

export function StepLoader({
  currentStep,
  currentIndex,
  progress,
  namespace,
}: StepLoaderProps) {
  const t = useTranslations(namespace);

  if (!currentStep) return null;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <span
        key={currentIndex}
        className="animate-in fade-in zoom-in-75 text-4xl duration-300"
      >
        {currentStep.emoji}
      </span>
      <p
        key={`text-${currentIndex}`}
        className="animate-in fade-in slide-in-from-bottom-2 text-sm font-medium text-muted-foreground duration-300"
      >
        {t(currentStep.key)}
      </p>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
