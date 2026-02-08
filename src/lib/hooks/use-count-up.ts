"use client";

import { useEffect, useState } from "react";

/**
 * Animates a number from 0 to the target value.
 * Used for "fact bomb" effect on hourly rate display.
 */
export function useCountUp(target: number | null, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null || target === 0) {
      setValue(0);
      return;
    }

    let start: number | null = null;
    let raf: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target!);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
