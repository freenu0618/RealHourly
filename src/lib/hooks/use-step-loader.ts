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
  isComplete: boolean;
}

export function useStepLoader(steps: Step[]) {
  const [state, setState] = useState<StepLoaderState>({
    currentIndex: 0,
    isActive: false,
    isComplete: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(
    (index: number) => {
      if (index >= steps.length - 1) return;
      timerRef.current = setTimeout(() => {
        setState((prev) =>
          prev.isActive && !prev.isComplete
            ? { ...prev, currentIndex: index + 1 }
            : prev
        );
        advance(index + 1);
      }, steps[index].duration);
    },
    [steps]
  );

  const start = useCallback(() => {
    clearTimer();
    setState({ currentIndex: 0, isActive: true, isComplete: false });
    advance(0);
  }, [advance, clearTimer]);

  const complete = useCallback(() => {
    clearTimer();
    setState({ currentIndex: 0, isActive: false, isComplete: true });
    timerRef.current = setTimeout(() => {
      setState({ currentIndex: 0, isActive: false, isComplete: false });
    }, 1200);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState({ currentIndex: 0, isActive: false, isComplete: false });
  }, [clearTimer]);

  const currentStep = state.isActive ? steps[state.currentIndex] : null;
  const progress =
    state.isActive && steps.length > 0
      ? Math.round(((state.currentIndex + 1) / steps.length) * 100)
      : state.isComplete
        ? 100
        : 0;

  return {
    currentStep,
    currentIndex: state.currentIndex,
    progress,
    isActive: state.isActive,
    isComplete: state.isComplete,
    start,
    complete,
    reset,
  };
}
