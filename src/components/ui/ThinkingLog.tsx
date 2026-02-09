"use client";

import { useEffect, useRef } from "react";
import type { ThinkingStep } from "@/lib/hooks/use-thinking-log";

interface ThinkingLogProps {
  title: string;
  steps: ThinkingStep[];
  isComplete: boolean;
  completionText?: string;
}

export function ThinkingLog({
  title,
  steps,
  isComplete,
  completionText,
}: ThinkingLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [steps, isComplete]);

  return (
    <div
      ref={containerRef}
      className="max-h-[300px] overflow-y-auto rounded-[16px] border border-border/50 bg-card p-5"
    >
      {/* Title */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">{"\uD83D\uDCAD"}</span>
        <span className="animate-pulse text-sm font-medium text-muted-foreground">
          {title}
        </span>
      </div>

      {/* Separator */}
      <div className="mb-4 border-t border-dashed border-border/50" />

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className="animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2">
              {step.status === "done" ? (
                <span className="text-xs">{"\u2705"}</span>
              ) : (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
              )}
              <span className="text-base">{step.icon}</span>
              <span
                className={`text-sm ${
                  step.status === "active"
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.text}
              </span>
            </div>
            {step.details.length > 0 && (
              <div className="ml-8 mt-1 space-y-0.5">
                {step.details.map((detail, i) => (
                  <p
                    key={i}
                    className="animate-in fade-in text-xs text-muted-foreground duration-150"
                  >
                    <span className="text-muted-foreground/60">{"\u2192"}</span>{" "}
                    {detail}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Completion */}
        {isComplete && completionText && (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 pt-2 duration-300">
            <span className="animate-bounce text-base">{"\u2705"}</span>
            <span className="text-sm font-medium text-primary">
              {completionText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
