"use client";

import { useState, useCallback } from "react";

export interface ThinkingStep {
  id: string;
  icon: string;
  text: string;
  details: string[];
  status: "active" | "done";
}

export function useThinkingLog() {
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [completionText, setCompletionText] = useState("");

  const addStep = useCallback((icon: string, text: string): string => {
    const id = crypto.randomUUID();
    setSteps((prev) => [
      ...prev.map((s) => ({ ...s, status: "done" as const })),
      { id, icon, text, details: [], status: "active" as const },
    ]);
    return id;
  }, []);

  const addDetail = useCallback((stepId: string, detail: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, details: [...s.details, detail] } : s
      )
    );
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, status: "done" as const } : s
      )
    );
  }, []);

  const complete = useCallback((text: string) => {
    setSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
    setCompletionText(text);
    setIsComplete(true);
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setIsComplete(false);
    setCompletionText("");
  }, []);

  return {
    steps,
    isComplete,
    completionText,
    addStep,
    addDetail,
    completeStep,
    complete,
    reset,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
