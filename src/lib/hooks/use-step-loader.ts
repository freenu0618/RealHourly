"use client";

import { useState, useRef, useCallback } from "react";

export interface Step {
  key: string;
  emoji: string;
  duration: number;
}

interface StepLoaderState {
  currentIndex: number;
  isActive: boolean;
}

export function useStepLoader(steps: Step[]) {
  const [state, setState] = useState<StepLoaderState>({
    currentIndex: 0,
    isActive: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(
    (index: number) => {
      if (index >= steps.length - 1) return;
      timerRef.current = setTimeout(() => {
        setState((prev) =>
          prev.isActive ? { ...prev, currentIndex: index + 1 } : prev
        );
        advance(index + 1);
      }, steps[index].duration);
    },
    [steps]
  );

  const start = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ currentIndex: 0, isActive: true });
    advance(0);
  }, [advance]);

  const complete = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState({ currentIndex: 0, isActive: false });
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState({ currentIndex: 0, isActive: false });
  }, []);

  const currentStep = state.isActive ? steps[state.currentIndex] : null;
  const progress =
    state.isActive && steps.length > 0
      ? Math.round(((state.currentIndex + 1) / steps.length) * 100)
      : 0;

  return { currentStep, currentIndex: state.currentIndex, progress, isActive: state.isActive, start, complete, reset };
}
