"use client";

import { useEffect } from "react";

const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let cancelled = false;
    let updateTimer: number | null = null;

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (cancelled) {
            return;
          }

          updateTimer = window.setInterval(() => {
            void reg.update();
          }, SW_UPDATE_INTERVAL_MS);
        })
        .catch((err) => {
          console.error("SW registration failed:", err);
        });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => registerServiceWorker());
    } else {
      globalThis.setTimeout(registerServiceWorker, 0);
    }

    return () => {
      cancelled = true;
      if (updateTimer) {
        window.clearInterval(updateTimer);
      }
    };
  }, []);

  return null;
}
